const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g
const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g
const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
const INLINE_CODE_PATTERN = /`([^`]+)`/g
const HEADING_PATTERN = /^\s{0,3}#{1,6}\s+/gm
const BLOCKQUOTE_PATTERN = /^\s{0,3}>\s?/gm
const LIST_PATTERN = /^\s*([-*+]|\d+\.)\s+/gm
const EMPHASIS_PATTERN = /(\*\*|__|\*|_|~~)/g
const HARD_BREAK_PATTERN = /\\\r?\n/g

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(CODE_BLOCK_PATTERN, " ")
    .replace(MARKDOWN_IMAGE_PATTERN, "$1")
    .replace(MARKDOWN_LINK_PATTERN, "$1")
    .replace(INLINE_CODE_PATTERN, "$1")
    .replace(HEADING_PATTERN, "")
    .replace(BLOCKQUOTE_PATTERN, "")
    .replace(LIST_PATTERN, "")
    .replace(EMPHASIS_PATTERN, "")
    .replace(HARD_BREAK_PATTERN, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+\n/g, "\n")
    .trim()
}

export function createPlainTextExcerpt(
  markdown: string,
  maxLength: number = 150,
): string {
  const plainText = stripMarkdown(markdown)

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
}
