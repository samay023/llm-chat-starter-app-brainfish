import { zValidator } from "@hono/zod-validator";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { OpenAI } from "openai";
import { z } from "zod";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set this in your .env file
});

// Create Hono app
export const app = new Hono();

// Middleware
app.use(cors());

// Routes
app.get("/", (c) => {
  return c.json({ message: "LLM API is running" });
});

// Chat endpoint
app.post(
  "/api/chat",
  zValidator(
    "json",
    z.object({
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
    })
  ),
  async (c) => {
    try {
      const { messages } = c.req.valid("json");

      if (!messages?.length) {
        return c.json({ error: "Messages are required" }, 400);
      }

      const aiStream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        stream: true,
      });

      return streamSSE(c, async (stream) => {
        for await (const chunk of aiStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            await stream.writeSSE({
              data: JSON.stringify({ content }),
            });
          }
        }
      });
    } catch (error) {
      console.error("Error:", error);
      return c.json({ error: "Failed to process request" }, 500);
    }
  }
);

