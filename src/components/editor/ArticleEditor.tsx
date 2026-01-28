'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorToolbar } from './EditorToolbar'

interface ArticleEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export function ArticleEditor({
    content,
    onChange,
    placeholder = 'Mulai menulis artikel Anda...',
}: ArticleEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }).configure({
                // Exclude extensions that we add separately
                link: false,
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline hover:text-primary/80',
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
    })

    return (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
            <EditorToolbar editor={editor} />
            <div className="bg-gray-800">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
