/**
 * Elimina etiquetas comunes de Markdown para mostrar texto plano en resúmenes.
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return ''

  return (
    markdown
      // Eliminar enlaces: [texto](url) -> texto
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Eliminar negrita y cursiva: **texto**, __texto__, *texto*, _texto_
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Eliminar encabezados: # Texto
      .replace(/^#+\s+/gm, '')
      // Eliminar blockquotes: > Texto
      .replace(/^\>\s+/gm, '')
      // Eliminar listas: * Texto o - Texto
      .replace(/^[\*\-\+]\s+/gm, '')
      // Eliminar código: `texto`
      .replace(/`(.*?)`/g, '$1')
      // Eliminar saltos de línea múltiples
      .replace(/\n+/g, ' ')
      .trim()
  )
}
