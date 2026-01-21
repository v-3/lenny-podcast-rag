# Lenny's Podcast AI

An AI-powered search engine for [Lenny's Podcast](https://www.lennyspodcast.com/) - instantly find insights from 269 episodes of product and growth wisdom.

## Acknowledgments

A huge thank you to:

- **[Lenny Rachitsky](https://www.lennysnewsletter.com/)** - For creating one of the most valuable resources for product managers and growth professionals. Your podcast has helped thousands of PMs level up their careers.

- **All the incredible guests** who have shared their wisdom on the show, including Shreyas Doshi, Julie Zhuo, Marty Cagan, April Dunford, Gibson Biddle, Elena Verna, and 260+ other world-class product leaders.

- **The PM community** - For continuously learning, sharing, and helping each other grow.

This project is a tribute to the immense value Lenny's Podcast provides to the product management community.

## Features

- **Semantic Search** - Ask natural language questions and get relevant answers from across all 269 episodes
- **Source Citations** - Every answer includes timestamped YouTube links so you can dive deeper
- **Streaming Responses** - Fast, real-time responses powered by GPT-4o-mini
- **Smart Caching** - Frequently asked questions are cached for instant responses
- **100 Suggested Questions** - Curated questions to help you explore PM topics

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| Vector Database | Pinecone Serverless |
| LLM | OpenAI GPT-4o-mini |
| Embeddings | text-embedding-3-small |
| Cache | Upstash Redis (optional) |
| Auth | JWT-based password protection |
| Deployment | Vercel |

## Architecture

```
User → Vercel Edge (Auth) → API Route → Cache Check
                                  ↓
                       Cache Miss → Pinecone (retrieval)
                                  ↓
                            GPT-4o-mini (generation)
                                  ↓
                       Stream response + cache result
```

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key
- Pinecone account (free tier works)
- Upstash Redis account (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lenny-podcast-rag.git
   cd lenny-podcast-rag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your `.env` file:
   ```env
   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=...
   PINECONE_INDEX=lenny-podcast
   AUTH_PASSWORD=your-shared-password
   JWT_SECRET=your-secret-at-least-32-chars

   # Optional - for caching
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

4. **Run data ingestion** (if you have transcripts)
   ```bash
   npm run ingest
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open http://localhost:3000**

## Project Structure

```
lenny-podcast-rag/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Password login
│   ├── chat/page.tsx         # Main chat interface
│   └── api/
│       ├── auth/route.ts     # Login endpoint
│       └── chat/route.ts     # RAG endpoint (streaming)
├── components/
│   ├── ChatInterface.tsx     # Chat UI with streaming
│   ├── MessageBubble.tsx     # Message display with markdown
│   └── SourceCard.tsx        # Citation cards with YouTube links
├── lib/
│   ├── openai.ts             # OpenAI client
│   ├── pinecone.ts           # Pinecone client
│   ├── redis.ts              # Upstash client + caching
│   ├── auth.ts               # JWT authentication
│   └── rag/
│       ├── retrieval.ts      # Vector search
│       ├── generation.ts     # LLM streaming
│       └── prompts.ts        # System prompts + 100 questions
├── scripts/
│   ├── chunk-transcripts.ts  # Parse transcripts into chunks
│   └── ingest.ts             # Embed & upload to Pinecone
└── middleware.ts             # Auth middleware
```

## Data Statistics

- **269 episodes** processed
- **16,534 chunks** embedded and indexed
- **~600 tokens** per chunk with 100 token overlap
- **4 chunks** retrieved per query

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Vercel

```
OPENAI_API_KEY
PINECONE_API_KEY
PINECONE_INDEX
AUTH_PASSWORD
JWT_SECRET
UPSTASH_REDIS_REST_URL (optional)
UPSTASH_REDIS_REST_TOKEN (optional)
```

## Cost Estimates

| Component | Monthly Cost |
|-----------|--------------|
| Vercel Pro | $20 |
| Pinecone Serverless | ~$50 |
| OpenAI GPT-4o-mini | ~$150-250 |
| Upstash Redis | $0 (free tier) |
| **Total** | **~$220-320/month** |

## Sample Questions

- "What advice do guests give about transitioning from IC to manager?"
- "How do successful PMs prioritize their roadmap?"
- "What are the best frameworks for product strategy?"
- "How should startups think about pricing?"
- "What makes a great product leader?"

## License

This project is for educational purposes. All podcast content belongs to Lenny Rachitsky and respective guests.

## Built With

Built by [Claude Code](https://claude.ai/). Uses Next.js, Pinecone, and OpenAI.

---

**Thanks to Lenny's Newsletter for inspiring this project.**
