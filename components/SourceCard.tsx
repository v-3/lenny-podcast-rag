"use client";

export interface Source {
  guest: string;
  title: string;
  timestamp: string;
  youtubeUrl: string;
  speaker: string;
  snippet: string;
}

interface SourceCardProps {
  source: Source;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  return (
    <a
      href={source.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-gradient-to-br from-gray-50 to-white hover:from-purple-50 hover:to-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 group-hover:bg-purple-200 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold transition-colors">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-purple-900 transition-colors">
            {source.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {source.speaker}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {source.timestamp}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            &ldquo;{source.snippet}&rdquo;
          </p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </div>
      </div>
    </a>
  );
}
