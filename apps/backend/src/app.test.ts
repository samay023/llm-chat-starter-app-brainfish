import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
  MockInstance,
} from "vitest";
import { app } from "./app.js";
import { OpenAI } from "openai";

const mocks = vi.hoisted(() => {
  return {
    create: vi.fn(),
  }
})

vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mocks.create,
      },
    },
  })),
}));

describe("Backend API Tests", () => {
  let createSpy: MockInstance;

  beforeAll(() => {
    // createSpy = vi.spyOn(OpenAI.prototype.chat.completions, 'create');

    // Setup mock implementation
    const mockChunks = [
      { choices: [{ delta: { content: "Hello" } }] },
      { choices: [{ delta: { content: " " } }] },
      { choices: [{ delta: { content: "world" } }] },
    ];

    mocks.create.mockImplementation(async () => ({
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      },
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mocks.create.mockClear();
  });

  describe("Health Check", () => {
    it("should return 200 and correct message", async () => {
      const res = await app.request("/");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ message: "LLM API is running" });
    });
  });

  describe("Chat Endpoint", () => {
    it("should return 400 for empty messages", async () => {
      const res = await app.request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: "Messages are required" });
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid message format", async () => {
      const res = await app.request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "invalid", content: "test" }],
        }),
      });

      expect(res.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("should stream response chunks correctly", async () => {
      const res = await app.request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/event-stream");
      expect(mocks.create).toHaveBeenCalledTimes(1);

      // Verify OpenAI was called with correct params
      expect(mocks.create).toHaveBeenCalledWith({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.7,
        stream: true,
      });

      // Read and verify stream content
      const reader = res.body?.getReader();
      expect(reader).toBeDefined();

      const chunks: string[] = [];
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n").filter(Boolean);

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            chunks.push(data.content);
          }
        }
      }

      expect(chunks).toEqual(["Hello", " ", "world"]);
    });

    it("should handle OpenAI errors gracefully", async () => {
      mocks.create.mockImplementationOnce(async () => {
        throw new Error("OpenAI API error");
      });

      const res = await app.request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: "Failed to process request" });
    });
  });
});
