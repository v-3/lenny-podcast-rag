import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT, buildContextPrompt } from "./prompts";
import { RetrievedChunk } from "./retrieval";

export async function generateStreamingResponse(
  query: string,
  chunks: RetrievedChunk[]
) {
  const contextPrompt = buildContextPrompt(
    chunks.map((c) => ({
      text: c.text,
      guest: c.guest,
      title: c.title,
      speaker: c.speaker,
      timestamp: c.timestamp,
    }))
  );

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${contextPrompt}\n\nQuestion: ${query}`,
      },
    ],
    temperature: 0.7,
    maxOutputTokens: 1000,
  });

  return result;
}

export async function generateResponse(
  query: string,
  chunks: RetrievedChunk[]
): Promise<string> {
  const result = await generateStreamingResponse(query, chunks);
  let fullResponse = "";
  for await (const chunk of result.textStream) {
    fullResponse += chunk;
  }
  return fullResponse;
}
