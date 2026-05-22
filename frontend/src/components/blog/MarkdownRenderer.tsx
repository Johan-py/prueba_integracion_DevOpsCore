'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-stone prose-amber max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-bold mb-6 text-stone-900 font-montserrat" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl font-bold mb-4 mt-8 text-stone-900 font-montserrat"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-bold mb-3 mt-6 text-stone-900 font-montserrat" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="text-base leading-8 text-stone-600 mb-6 font-inter" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 mb-6 space-y-2 text-stone-600 font-inter" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 mb-6 space-y-2 text-stone-600 font-inter" {...props} />
          ),
          li: ({ ...props }) => <li className="text-stone-600 font-inter" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-[#B45309] pl-6 italic text-stone-500 my-8 bg-amber-50/30 py-4 rounded-r-2xl"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-[#B45309] underline underline-offset-4 font-bold hover:text-[#92400E] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
