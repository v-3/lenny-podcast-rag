import { createEmbedding } from "../openai";
import { queryVectors, ChunkMetadata } from "../pinecone";

export interface RetrievedChunk {
  text: string;
  guest: string;
  title: string;
  videoId: string;
  timestamp: string;
  timestampSeconds: number;
  speaker: string;
  score: number;
  youtubeUrl: string;
}

export async function retrieveRelevantChunks(
  query: string,
  topK: number = 4
): Promise<RetrievedChunk[]> {
  // Generate embedding for the query
  const queryEmbedding = await createEmbedding(query);

  // Query Pinecone for similar chunks
  const results = await queryVectors(queryEmbedding, topK);

  // Transform results into a usable format
  return results.map((result) => {
    const metadata = result.metadata;
    return {
      text: metadata.text,
      guest: metadata.guest,
      title: metadata.title,
      videoId: metadata.videoId,
      timestamp: metadata.timestamp,
      timestampSeconds: metadata.timestampSeconds,
      speaker: metadata.speaker,
      score: result.score,
      youtubeUrl: `https://www.youtube.com/watch?v=${metadata.videoId}&t=${Math.floor(metadata.timestampSeconds)}s`,
    };
  });
}

export function formatChunksForContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, i) => {
      return `[Source ${i + 1}: "${chunk.title}" - ${chunk.speaker} at ${chunk.timestamp}]
${chunk.text}`;
    })
    .join("\n\n");
}
