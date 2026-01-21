"use client";

import ReactMarkdown from "react-markdown";
import SourceCard, { Source } from "./SourceCard";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export default function MessageBubble({
  role,
  content,
  sources,
  isStreaming,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-purple-600 text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[80%]">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-bl-sm max-w-[90%] shadow-sm">
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h3:text-base prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0.5 prose-strong:text-gray-900 prose-strong:font-semibold">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                  {children}
                </h3>
              ),
              h2: ({ children }) => (
                <h3 className="text-base font-bold text-gray-900 mt-3 mb-2 first:mt-0">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="text-sm font-bold text-gray-900 mt-3 mb-1 first:mt-0">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-4 my-2 space-y-1.5">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-4 my-2 space-y-1.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed pl-1">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-purple-300 pl-4 py-1 my-3 bg-purple-50 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-purple-700">
                  {children}
                </code>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-purple-500 animate-pulse ml-1 align-middle" />
          )}
        </div>
      </div>

      {sources && sources.length > 0 && !isStreaming && (
        <div className="ml-4">
          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Sources
          </p>
          <div className="grid gap-2">
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
