"use client"

import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  content: string
  className?: string
}

export default function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  return (
    <div
      className={
        className ??
        "prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-stone-900 prose-p:text-stone-700 prose-p:leading-8 prose-strong:text-stone-900 prose-a:text-amber-700 prose-a:no-underline hover:prose-a:text-amber-800 prose-blockquote:border-amber-500 prose-blockquote:text-stone-600 prose-code:text-stone-800 prose-pre:bg-stone-900 prose-pre:text-stone-100"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="mb-4 text-3xl font-bold text-[#1C1917]" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="mb-3 text-2xl font-bold text-[#1C1917]" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="mb-2 text-xl font-bold text-[#1C1917]" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-4 text-base leading-relaxed text-[#44403C]" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="mb-4 list-disc space-y-2 pl-5 text-[#44403C]" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="mb-4 list-decimal space-y-2 pl-5 text-[#44403C]" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="text-[#44403C]" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-4 border-l-4 border-[#B45309] pl-4 italic text-[#78716C]"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-[#B45309] underline transition-colors hover:text-[#92400E]"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
