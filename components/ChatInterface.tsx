"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import { Source } from "./SourceCard";
import { getRandomQuestions } from "@/lib/rag/prompts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ChatInterfaceProps {
  initialQuestion?: string;
}

export default function ChatInterface({ initialQuestion }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingSources, setStreamingSources] = useState<Source[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize random questions on mount
  useEffect(() => {
    setSuggestedQuestions(getRandomQuestions(4));
  }, []);

  const hasSubmittedInitial = useRef(false);

  const refreshQuestions = () => {
    setSuggestedQuestions(getRandomQuestions(4));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setStreamingSources([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      // Check if it's a cached response (JSON) or streaming response
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";
        let sources: Source[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "sources") {
                  sources = data.data;
                  setStreamingSources(sources);
                } else if (data.type === "text") {
                  fullContent += data.data;
                  setStreamingContent(fullContent);
                } else if (data.type === "done") {
                  // Complete the message
                  const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: fullContent,
                    sources: sources,
                  };
                  setMessages((prev) => [...prev, assistantMessage]);
                  setStreamingContent("");
                  setStreamingSources([]);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Auto-submit initial question if provided (run once on mount)
  useEffect(() => {
    if (initialQuestion && !hasSubmittedInitial.current) {
      hasSubmittedInitial.current = true;

      // Submit the question
      const submitInitialQuestion = async () => {
        const query = initialQuestion.trim();
        if (!query) return;

        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: query,
        };

        setMessages([userMessage]);
        setIsLoading(true);

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get response");
          }

          const contentType = response.headers.get("content-type");

          if (contentType?.includes("application/json")) {
            const data = await response.json();
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: data.response,
              sources: data.sources || [],
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();
            let fullContent = "";
            let sources: Source[] = [];

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const text = decoder.decode(value);
              const lines = text.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === "sources") {
                      sources = data.data;
                      setStreamingSources(sources);
                    } else if (data.type === "text") {
                      fullContent += data.data;
                      setStreamingContent(fullContent);
                    } else if (data.type === "done") {
                      const assistantMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: fullContent,
                        sources: sources,
                      };
                      setMessages((prev) => [...prev, assistantMessage]);
                      setStreamingContent("");
                      setStreamingSources([]);
                    }
                  } catch {
                    // Ignore parse errors
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Chat error:", error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: error instanceof Error ? error.message : "Sorry, something went wrong.",
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      submitInitialQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setStreamingContent("");
    setStreamingSources([]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Clear chat button - shown when there are messages */}
      {messages.length > 0 && (
        <div className="flex justify-end px-4 pt-3 pb-0">
          <button
            onClick={handleClearChat}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear chat
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ask anything about Lenny&apos;s Podcast
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Search through 269 episodes of product and growth wisdom from
              world-class leaders.
            </p>

            <div className="grid gap-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Try asking:
                </p>
                <button
                  onClick={refreshQuestions}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  More questions
                </button>
              </div>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(question)}
                  className="text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 rounded-lg text-gray-700 text-sm transition-colors border border-gray-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            sources={message.sources}
          />
        ))}

        {streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            sources={streamingSources}
            isStreaming={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about product, growth, or leadership..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <svg
                    className="w-5 h-5"
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
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by GPT-4o-mini. Responses are based on 269 Lenny&apos;s Podcast
            episodes.
          </p>
        </div>
      </div>
    </div>
  );
}
