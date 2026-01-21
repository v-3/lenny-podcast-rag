import Link from "next/link";

const SAMPLE_QUESTIONS = [
  "How do I transition from IC to manager?",
  "What makes a great product strategy?",
  "How should startups think about pricing?",
  "When is it time to leave your job?",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl mb-8">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Lenny&apos;s Podcast
            <span className="text-purple-600"> AI</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Instantly search through <span className="font-semibold">269 episodes</span> of
            product and growth wisdom from world-class leaders like Shreyas
            Doshi, Julie Zhuo, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
            >
              Get Started
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Semantic Search
            </h3>
            <p className="text-gray-600">
              Ask natural questions and get relevant answers from across all
              episodes. No more scrubbing through hours of content.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Source Citations
            </h3>
            <p className="text-gray-600">
              Every answer includes timestamped links to the original YouTube
              video so you can dive deeper.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Instant Answers
            </h3>
            <p className="text-gray-600">
              Powered by GPT-4o-mini with streaming responses. Get insights in
              seconds, not hours.
            </p>
          </div>
        </div>

        {/* Sample questions */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Ask questions like...
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {SAMPLE_QUESTIONS.map((question, i) => (
              <Link
                key={i}
                href={`/login?q=${encodeURIComponent(question)}`}
                className="group bg-white rounded-xl px-5 py-4 text-gray-700 text-left border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md hover:bg-purple-50 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">&ldquo;{question}&rdquo;</span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Built by Claude Code. Uses Next.js, Pinecone, and OpenAI. Thanks to
            Lenny&apos;s Newsletter.
          </p>
        </div>
      </footer>
    </div>
  );
}
