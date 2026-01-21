import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

export interface TranscriptMetadata {
  guest: string;
  title: string;
  youtube_url: string;
  video_id: string;
  description: string;
  duration_seconds: number;
  duration: string;
  view_count: number;
  channel: string;
}

export interface SpeakerTurn {
  speaker: string;
  timestamp: string;
  timestampSeconds: number;
  text: string;
}

export interface Chunk {
  id: string;
  text: string;
  guest: string;
  title: string;
  videoId: string;
  timestamp: string;
  timestampSeconds: number;
  speaker: string;
  episodeSlug: string;
}

function sanitizeToAscii(str: string): string {
  // Convert non-ASCII characters to ASCII equivalents
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\x00-\x7F]/g, ""); // Remove any remaining non-ASCII
}

function parseTimestamp(timestamp: string): number {
  // Parse "HH:MM:SS" or "MM:SS" format to seconds
  const parts = timestamp.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function parseSpeakerTurns(content: string): SpeakerTurn[] {
  const turns: SpeakerTurn[] = [];

  // Match patterns like "Speaker Name (HH:MM:SS):" followed by text
  const regex = /^([^(]+)\s*\((\d{1,2}:\d{2}:\d{2})\):\s*$/gm;
  const lines = content.split("\n");

  let currentTurn: SpeakerTurn | null = null;
  let currentText: string[] = [];

  for (const line of lines) {
    const match = line.match(/^([^(]+)\s*\((\d{1,2}:\d{2}:\d{2})\):\s*$/);

    if (match) {
      // Save previous turn
      if (currentTurn && currentText.length > 0) {
        currentTurn.text = currentText.join(" ").trim();
        if (currentTurn.text) {
          turns.push(currentTurn);
        }
      }

      // Start new turn
      currentTurn = {
        speaker: match[1].trim(),
        timestamp: match[2],
        timestampSeconds: parseTimestamp(match[2]),
        text: "",
      };
      currentText = [];
    } else if (currentTurn && line.trim()) {
      // Skip markdown headers and metadata
      if (!line.startsWith("#") && !line.startsWith("---")) {
        currentText.push(line.trim());
      }
    }
  }

  // Save last turn
  if (currentTurn && currentText.length > 0) {
    currentTurn.text = currentText.join(" ").trim();
    if (currentTurn.text) {
      turns.push(currentTurn);
    }
  }

  return turns;
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

export function chunkTranscript(
  content: string,
  metadata: TranscriptMetadata,
  episodeSlug: string,
  maxTokens: number = 600,
  overlapTokens: number = 100
): Chunk[] {
  const chunks: Chunk[] = [];
  const sanitizedSlug = sanitizeToAscii(episodeSlug);
  const turns = parseSpeakerTurns(content);

  if (turns.length === 0) {
    return chunks;
  }

  let currentChunk: string[] = [];
  let currentTokens = 0;
  let chunkStartTurn = turns[0];
  let chunkIndex = 0;

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const turnText = `${turn.speaker}: ${turn.text}`;
    const turnTokens = estimateTokens(turnText);

    // If adding this turn would exceed max tokens, save current chunk
    if (currentTokens + turnTokens > maxTokens && currentChunk.length > 0) {
      chunks.push({
        id: `${sanitizedSlug}-${chunkIndex}`,
        text: currentChunk.join("\n\n"),
        guest: metadata.guest,
        title: metadata.title,
        videoId: metadata.video_id,
        timestamp: chunkStartTurn.timestamp,
        timestampSeconds: chunkStartTurn.timestampSeconds,
        speaker: chunkStartTurn.speaker,
        episodeSlug,
      });
      chunkIndex++;

      // Start new chunk with overlap
      // Find a turn to start overlap from
      let overlapStart = i;
      let overlapTokenCount = 0;
      while (overlapStart > 0 && overlapTokenCount < overlapTokens) {
        overlapStart--;
        overlapTokenCount += estimateTokens(`${turns[overlapStart].speaker}: ${turns[overlapStart].text}`);
      }

      currentChunk = [];
      currentTokens = 0;

      // Add overlap turns
      for (let j = overlapStart; j < i; j++) {
        const overlapTurn = turns[j];
        const overlapText = `${overlapTurn.speaker}: ${overlapTurn.text}`;
        currentChunk.push(overlapText);
        currentTokens += estimateTokens(overlapText);
      }

      chunkStartTurn = turns[overlapStart];
    }

    currentChunk.push(turnText);
    currentTokens += turnTokens;

    if (currentChunk.length === 1) {
      chunkStartTurn = turn;
    }
  }

  // Save final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      id: `${sanitizedSlug}-${chunkIndex}`,
      text: currentChunk.join("\n\n"),
      guest: metadata.guest,
      title: metadata.title,
      videoId: metadata.video_id,
      timestamp: chunkStartTurn.timestamp,
      timestampSeconds: chunkStartTurn.timestampSeconds,
      speaker: chunkStartTurn.speaker,
      episodeSlug,
    });
  }

  return chunks;
}

export function processAllTranscripts(transcriptsPath: string): Chunk[] {
  const allChunks: Chunk[] = [];
  const episodeDirs = fs.readdirSync(transcriptsPath);

  for (const episodeDir of episodeDirs) {
    const transcriptPath = path.join(transcriptsPath, episodeDir, "transcript.md");

    if (!fs.existsSync(transcriptPath)) {
      console.log(`Skipping ${episodeDir}: no transcript.md found`);
      continue;
    }

    try {
      const fileContent = fs.readFileSync(transcriptPath, "utf-8");
      const { data, content } = matter(fileContent);

      const metadata = data as TranscriptMetadata;
      const chunks = chunkTranscript(content, metadata, episodeDir);

      allChunks.push(...chunks);
      console.log(`Processed ${episodeDir}: ${chunks.length} chunks`);
    } catch (error) {
      console.error(`Error processing ${episodeDir}:`, error);
    }
  }

  return allChunks;
}

// CLI execution
if (require.main === module) {
  const transcriptsPath = process.env.TRANSCRIPTS_PATH ||
    "/Users/vishweshwarvivek/Downloads/lennys-podcast-transcripts/episodes";

  console.log(`Processing transcripts from: ${transcriptsPath}`);
  const chunks = processAllTranscripts(transcriptsPath);
  console.log(`\nTotal chunks: ${chunks.length}`);

  // Save to JSON for inspection
  const outputPath = path.join(__dirname, "chunks.json");
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
  console.log(`Saved to: ${outputPath}`);
}
