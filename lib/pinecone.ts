import { Pinecone, Index } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;
let pineconeIndex: Index | null = null;

function getPinecone(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export function getIndex(): Index {
  if (!pineconeIndex) {
    pineconeIndex = getPinecone().Index(process.env.PINECONE_INDEX || "lenny-podcast");
  }
  return pineconeIndex;
}

export default getPinecone;

export interface ChunkMetadata {
  text: string;
  guest: string;
  title: string;
  videoId: string;
  timestamp: string;
  timestampSeconds: number;
  speaker: string;
  episodeSlug: string;
  [key: string]: string | number;
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: ChunkMetadata }[]
) {
  const index = getIndex();
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}

export async function queryVectors(
  embedding: number[],
  topK: number = 4
): Promise<{ id: string; score: number; metadata: ChunkMetadata }[]> {
  const index = getIndex();
  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  return (results.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata as unknown as ChunkMetadata,
  }));
}
