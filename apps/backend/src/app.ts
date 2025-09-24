import { zValidator } from "@hono/zod-validator";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { OpenAI } from "openai";
import { z } from "zod";
import pdf from "@bingsjs/pdf-parse";

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
      file: z.string().optional(),
    })
  ),
  async (c) => {
    try {
      const { messages, file } = c.req.valid("json");

      if (!messages?.length) {
        return c.json({ error: "Messages are required" }, 400);
      }

      if (file) {
        const buffer = Buffer.from(file, "base64");

        const pdfData = await pdf(buffer);
        const fileText = pdfData.text;

        if (fileText) {
          messages.push({
            role: "user",
            content: `Extracted text from the uploaded PDF:\n\n${fileText}`,
          });
        }
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
