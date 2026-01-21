import { NextRequest } from "next/server";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";
import { generateStreamingResponse } from "@/lib/rag/generation";
import { getCachedResponse, setCachedResponse, checkRateLimit, CachedResult } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { query, userId = "anonymous" } = await request.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          remaining: rateLimit.remaining,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check cache first
    const cachedResult = await getCachedResponse(query);
    if (cachedResult) {
      // Return cached response with sources
      return new Response(
        JSON.stringify({
          cached: true,
          response: cachedResult.response,
          sources: cachedResult.sources,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "X-Cache": "HIT",
          },
        }
      );
    }

    // Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(query, 4);

    if (chunks.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No relevant content found for your query.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prepare sources for caching
    const sources: CachedResult["sources"] = chunks.map((chunk) => ({
      guest: chunk.guest,
      title: chunk.title,
      timestamp: chunk.timestamp,
      youtubeUrl: chunk.youtubeUrl,
      speaker: chunk.speaker,
      snippet: chunk.text.substring(0, 200) + "...",
    }));

    // Generate streaming response
    const result = await generateStreamingResponse(query, chunks);

    // Track full response for caching
    let fullResponse = "";

    const encoder = new TextEncoder();

    // Convert the AI stream to our custom stream with sources
    const customStream = new ReadableStream({
      async start(controller) {
        // First, send the sources as a JSON object
        const sourcesPayload = JSON.stringify({
          type: "sources",
          data: sources,
        });
        controller.enqueue(encoder.encode(`data: ${sourcesPayload}\n\n`));

        // Then stream the response
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`));

        try {
          for await (const textChunk of result.textStream) {
            fullResponse += textChunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "text", data: textChunk })}\n\n`)
            );
          }
        } catch (error) {
          console.error("Stream error:", error);
        }

        // Signal completion
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));

        // Cache the response with sources
        if (fullResponse) {
          await setCachedResponse(query, fullResponse, sources);
        }

        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
