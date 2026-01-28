'use client'

import { Editor } from '@tiptap/react'
import {
    Heading1,
    Heading2,
    Heading3,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from 'lucide-react'

interface EditorToolbarProps {
    editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) {
        return null
    }

    const ToolbarButton = ({
        onClick,
        active,
        children,
        title,
    }: {
        onClick: () => void
        active?: boolean
        children: React.ReactNode
        title: string
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded transition-colors ${
                active
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
        >
            {children}
        </button>
    )

    const ToolbarSeparator = () => <div className="w-px h-6 bg-gray-700 mx-1" />

    const addLink = () => {
        const url = window.prompt('Masukkan URL:')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    const addImage = () => {
        const url = window.prompt('Masukkan URL gambar:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className="flex items-center flex-wrap gap-1 p-3 bg-gray-800 border-b border-gray-700 rounded-t-lg">
            {/* Undo/Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo (Ctrl+Z)"
                disabled={!editor.can().undo()}
            >
                <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo (Ctrl+Y)"
                disabled={!editor.can().redo()}
            >
                <Redo className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Basic Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
            >
                <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive('code')}
                title="Inline Code"
            >
                <Code className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                title="Blockquote"
            >
                <Quote className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Alignment */}
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                active={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                active={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                active={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarSeparator />

            {/* Insert */}
            <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Insert Link">
                <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Insert Image">
                <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
        </div>
    )
}
