import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as path from "path";
import { processAllTranscripts, Chunk } from "./chunk-transcripts";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const BATCH_SIZE = 100;
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

async function initializeIndex(): Promise<void> {
  const indexName = process.env.PINECONE_INDEX || "lenny-podcast";

  try {
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some((idx) => idx.name === indexName);

    if (!indexExists) {
      console.log(`Creating index: ${indexName}`);
      await pinecone.createIndex({
        name: indexName,
        dimension: EMBEDDING_DIMENSIONS,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      // Wait for index to be ready
      console.log("Waiting for index to be ready...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
    } else {
      console.log(`Index ${indexName} already exists`);
    }
  } catch (error) {
    console.error("Error initializing index:", error);
    throw error;
  }
}

async function ingestChunks(chunks: Chunk[]): Promise<void> {
  const indexName = process.env.PINECONE_INDEX || "lenny-podcast";
  const index = pinecone.Index(indexName);

  console.log(`Ingesting ${chunks.length} chunks in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.text);

    try {
      // Create embeddings
      const embeddings = await createEmbeddings(texts);

      // Prepare vectors for upsert
      const vectors = batch.map((chunk, j) => ({
        id: chunk.id,
        values: embeddings[j],
        metadata: {
          text: chunk.text,
          guest: chunk.guest,
          title: chunk.title,
          videoId: chunk.videoId,
          timestamp: chunk.timestamp,
          timestampSeconds: chunk.timestampSeconds,
          speaker: chunk.speaker,
          episodeSlug: chunk.episodeSlug,
        },
      }));

      // Upsert to Pinecone
      await index.upsert(vectors);

      console.log(`Processed ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks`);

      // Rate limiting: small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing batch at index ${i}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log("=== Lenny's Podcast RAG Ingestion ===\n");

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is required");
  }

  const transcriptsPath =
    process.env.TRANSCRIPTS_PATH ||
    "/Users/vishweshwarvivek/Downloads/lennys-podcast-transcripts/episodes";

  // Step 1: Process transcripts into chunks
  console.log("Step 1: Processing transcripts...");
  const chunks = processAllTranscripts(transcriptsPath);
  console.log(`Generated ${chunks.length} chunks from transcripts\n`);

  if (chunks.length === 0) {
    console.error("No chunks generated. Check transcript path and format.");
    process.exit(1);
  }

  // Step 2: Initialize Pinecone index
  console.log("Step 2: Initializing Pinecone index...");
  await initializeIndex();
  console.log("Index ready\n");

  // Step 3: Embed and ingest chunks
  console.log("Step 3: Creating embeddings and uploading to Pinecone...");
  await ingestChunks(chunks);

  console.log("\n=== Ingestion Complete ===");
  console.log(`Total chunks ingested: ${chunks.length}`);
}

main().catch((error) => {
  console.error("Ingestion failed:", error);
  process.exit(1);
});
