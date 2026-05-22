"use client";

import type { Editor } from "@tiptap/react";
import BlogRichTextEditor from "./BlogRichTextEditor";

interface BlogEditorSectionProps {
  contenido: string;
  setContenido: (val: string) => void;
  insertLink: (text: string) => void;
  error?: string;
  editorRef?: (editor: Editor) => void;
}

export default function BlogEditorSection({
  contenido,
  setContenido,
  insertLink,
  error,
  editorRef
}: BlogEditorSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E] dark:text-[#999]">
          Contenido del artículo(Editor Visual)
        </span>
      </div>

      <div className="flex flex-col rounded-[32px] bg-white dark:bg-[#111] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all duration-300">
        <BlogRichTextEditor
          contenido={contenido}
          setContenido={setContenido}
          onEditorReady={editorRef}
          onLink={insertLink}
        />
      </div>

      {error && <p className="px-2 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
