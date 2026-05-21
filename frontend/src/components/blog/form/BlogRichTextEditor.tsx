"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Bold, Italic, List, Quote, Link as LinkIcon, Eraser } from "lucide-react";
import { useEffect, useState } from "react";

interface BlogRichTextEditorProps {
  contenido: string;
  setContenido: (val: string) => void;
  onEditorReady?: (editor: Editor) => void;
  onLink?: (selectedText: string) => void;
}

export default function BlogRichTextEditor({
  contenido,
  setContenido,
  onEditorReady,
  onLink
}: BlogRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Comienza a escribir tu historia aquí...",
      }),
      Markdown,
    ],
    immediatelyRender: false,
    content: contenido,
    onUpdate: ({ editor }) => {
      // @ts-ignore
      setContenido(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone prose-amber max-w-none focus:outline-none min-h-[500px] px-8 py-8 text-lg text-[#44403C]",
      },
    },
  });

  // Forzar re-renderizado cuando cambia la selección para actualizar los botones
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (editor) {
      editor.on("transaction", () => {
        forceUpdate((s) => s + 1);
      });
    }
  }, [editor]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sync editor content if it changes externally
  useEffect(() => {
    // @ts-ignore
    if (editor && contenido !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(contenido);
    }
  }, [contenido, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col rounded-b-[32px] bg-white dark:bg-[#111] overflow-hidden border-t border-[#F5F5F4] dark:border-[#333]">
      {/* Mini Toolbar Interna */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-[#F5F5F4] dark:border-[#333] bg-[#FAFAFA]/50 dark:bg-[#0a0a0a]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition ${editor.isActive("bold") ? "bg-[#FEF3C7] text-[#B45309]" : "text-[#78716C] hover:bg-white"}`}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition ${editor.isActive("italic") ? "bg-[#FEF3C7] text-[#B45309]" : "text-[#78716C] hover:bg-white"}`}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-[#F5F5F4] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition ${editor.isActive("bulletList") ? "bg-[#FEF3C7] text-[#B45309]" : "text-[#78716C] hover:bg-white"}`}
          title="Lista de puntos"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition ${editor.isActive("blockquote") ? "bg-[#FEF3C7] text-[#B45309]" : "text-[#78716C] hover:bg-white"}`}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-[#F5F5F4] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded transition text-[#78716C] hover:bg-red-50 hover:text-red-600"
          title="Limpiar todo el formato"
        >
          <Eraser className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else if (onLink) {
              const { from, to } = editor.state.selection;
              const text = editor.state.doc.textBetween(from, to, " ");
              onLink(text);
            }
          }}
          className={`p-1.5 rounded transition ${editor.isActive("link") ? "bg-[#FEF3C7] text-[#B45309]" : "text-[#78716C] hover:bg-white"}`}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />

      <style jsx global>{`
        .prose blockquote {
          border-left: 4px solid #B45309 !important;
          padding-left: 1rem !important;
          font-style: italic !important;
          color: #78716C !important;
        }
        .prose a { color: #B45309 !important; text-decoration: underline !important; cursor: pointer !important; }
        .prose ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }
        .prose ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }
        .prose li { margin-bottom: 0.5rem !important; }
        .prose p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #A8A29E;
          pointer-events: none;
          height: 0;
        }
        .prose p { margin-bottom: 1.25em !important; }
        .prose h1 { color: #1C1917 !important; font-weight: 700 !important; font-size: 1.875rem !important; }
        .prose h2 { color: #1C1917 !important; font-weight: 700 !important; font-size: 1.5rem !important; }
        .prose h3 { color: #1C1917 !important; font-weight: 700 !important; font-size: 1.25rem !important; }
        html.dark .prose h1,
        html.dark .prose h2,
        html.dark .prose h3 { color: #ffffff !important; }
        html.dark .prose p { color: #cbd5e1 !important; }
        html.dark .prose blockquote { border-left-color: #e68b25 !important; color: #cbd5e1 !important; }
        html.dark .prose a { color: #e68b25 !important; }
      `}</style>
    </div>
  );
}
