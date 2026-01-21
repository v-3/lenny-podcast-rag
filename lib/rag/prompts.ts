export const SYSTEM_PROMPT = `You are an AI assistant that helps product managers find insights from Lenny's Podcast, one of the most popular podcasts for product and growth professionals.

You have access to transcripts from 269 episodes featuring world-class product leaders, founders, and growth experts.

Guidelines:
1. Answer questions based ONLY on the provided context from the podcast transcripts
2. If the context doesn't contain relevant information, say so honestly
3. Always cite your sources by mentioning the guest name and episode title
4. Keep answers concise but informative
5. When quoting, use direct quotes with attribution
6. If multiple guests have discussed a topic, synthesize their perspectives

Format:
- Use bullet points for lists
- Bold key takeaways
- Include source citations at the end of your response`;

export const CONTEXT_TEMPLATE = `Here are relevant excerpts from Lenny's Podcast transcripts:

{context}

---

Based on the above context, please answer the user's question. If the context doesn't contain enough information to answer fully, acknowledge that and share what you can.`;

export function buildContextPrompt(
  chunks: {
    text: string;
    guest: string;
    title: string;
    speaker: string;
    timestamp: string;
  }[]
): string {
  const contextParts = chunks.map((chunk, i) => {
    return `[Source ${i + 1}: "${chunk.title}" - ${chunk.speaker} at ${chunk.timestamp}]
${chunk.text}`;
  });

  return CONTEXT_TEMPLATE.replace("{context}", contextParts.join("\n\n"));
}

export const SUGGESTED_QUESTIONS = [
  // Career & Growth
  "What advice do guests give about transitioning from IC to manager?",
  "How do you know when it's time to leave your job?",
  "What makes a great product leader?",
  "How do you build a successful PM career?",
  "What skills should new PMs focus on developing?",
  "How do you get promoted to senior PM?",
  "What are the biggest career mistakes PMs make?",
  "How do you transition into product management?",
  "What should you look for in a PM job?",
  "How do you know if product management is right for you?",
  "What's the difference between a good PM and a great PM?",
  "How do you stay relevant as a PM as you get more senior?",
  "What advice would you give to someone starting their PM career?",
  "How do you build executive presence as a PM?",
  "What are the most important lessons for first-time managers?",

  // Product Strategy
  "What are the best frameworks for product strategy?",
  "How do successful PMs prioritize their roadmap?",
  "How do you say no to stakeholders?",
  "What makes a good product vision?",
  "How do you create a product strategy?",
  "How do you balance short-term and long-term thinking?",
  "What frameworks do top PMs use for prioritization?",
  "How do you align product and business strategy?",
  "How do you measure product success?",
  "What's the difference between strategy and tactics?",
  "How do you build conviction around product decisions?",
  "How do you know when to pivot vs persevere?",
  "What makes a compelling product roadmap?",
  "How do you communicate product strategy to executives?",
  "How do you handle competing priorities?",

  // Building Products
  "How do you validate product ideas?",
  "What's the best way to do user research?",
  "How do you write a good PRD?",
  "How do you run effective product meetings?",
  "What makes a great product launch?",
  "How do you build products users love?",
  "What's the right way to do A/B testing?",
  "How do you gather customer feedback effectively?",
  "How do you build a product culture?",
  "What's the role of intuition in product decisions?",
  "How do you build MVPs effectively?",
  "How do you know when a product is ready to ship?",
  "What makes a feature successful?",
  "How do you design for simplicity?",
  "How do you handle technical debt as a PM?",

  // Growth & Metrics
  "How do you build a growth team?",
  "What metrics should PMs focus on?",
  "How do you improve user retention?",
  "What are the best growth strategies for startups?",
  "How do you identify your North Star metric?",
  "How do you increase user activation?",
  "What's the best way to reduce churn?",
  "How do you think about virality and word of mouth?",
  "How do you build a data-driven product culture?",
  "What growth levers have the biggest impact?",
  "How do you set good OKRs?",
  "How do you experiment effectively?",
  "What are common mistakes in growth?",
  "How do you scale a product?",
  "How do you balance growth and product quality?",

  // Leadership & Teams
  "How do you build high-performing product teams?",
  "How do you give effective feedback?",
  "How do you motivate your team?",
  "What makes a great product culture?",
  "How do you handle conflict in teams?",
  "How do you build trust with engineers?",
  "How do you work effectively with designers?",
  "How do you manage up effectively?",
  "How do you lead without authority?",
  "How do you build influence as a PM?",
  "How do you run effective 1:1s?",
  "How do you hire great PMs?",
  "How do you onboard new PMs?",
  "How do you create psychological safety?",
  "What's the best team structure for product?",

  // Startups & Entrepreneurship
  "How should startups think about pricing?",
  "What makes startups successful?",
  "How do you find product-market fit?",
  "When should you raise funding?",
  "How do you build a startup from scratch?",
  "What are the biggest mistakes founders make?",
  "How do you validate a startup idea?",
  "How do you hire your first PM?",
  "When should a founder stop being the PM?",
  "How do you scale from founder-led sales?",
  "What's the right time to expand your product?",
  "How do you compete with bigger companies?",
  "How do you build a moat?",
  "What makes a good co-founder relationship?",
  "How do you know when to quit your startup?",

  // Communication & Influence
  "How do you tell better stories?",
  "How do you present to executives?",
  "How do you write better product docs?",
  "How do you persuade stakeholders?",
  "How do you communicate bad news?",
  "How do you run better meetings?",
  "How do you get buy-in for your ideas?",
  "How do you handle disagreements with leadership?",
  "How do you communicate with customers?",
  "How do you build your personal brand?",

  // Personal Development
  "How do you avoid burnout?",
  "How do you manage your time as a PM?",
  "How do you deal with imposter syndrome?",
  "How do you build resilience?",
  "How do you make better decisions?",
  "What books should PMs read?",
  "How do you develop product sense?",
  "How do you stay creative?",
  "How do you learn from failure?",
  "What habits make successful PMs?",
];

// Helper function to get random questions
export function getRandomQuestions(count: number = 4): string[] {
  const shuffled = [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
