'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
    MessageSquare,
    Search,
    Send,
    MoreVertical,
    Trash2,
    Check,
    CheckCheck,
    User,
    Car,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Conversation {
    id: string
    contact: {
        name: string
        avatar?: string
        isDealer: boolean
    }
    listing: {
        id: string
        title: string
        image: string
    }
    lastMessage: string
    lastMessageTime: string
    unread: number
    isOnline: boolean
}

interface Message {
    id: string
    senderId: string
    content: string
    timestamp: string
    status: 'sent' | 'delivered' | 'read'
}

// Sample conversations
const sampleConversations: Conversation[] = [
    {
        id: '1',
        contact: { name: 'Auto Prima Motor', avatar: null, isDealer: true },
        listing: {
            id: '1',
            title: 'Toyota Avanza 1.5 G CVT 2024',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100',
        },
        lastMessage: 'Baik, kapan bisa lihat mobilnya?',
        lastMessageTime: '10:30',
        unread: 2,
        isOnline: true,
    },
    {
        id: '2',
        contact: { name: 'Budi Santoso', avatar: null, isDealer: false },
        listing: {
            id: '2',
            title: 'Honda HR-V 1.5 SE CVT 2023',
            image: 'https://images.unsplash.com/photo-1568844293986-8c10f13f0969?w=100',
        },
        lastMessage: 'Siap, saya kasih harga spesial untuk Anda',
        lastMessageTime: 'Kemarin',
        unread: 0,
        isOnline: false,
    },
    {
        id: '3',
        contact: { name: 'Mobilindo Jaya', avatar: null, isDealer: true },
        listing: {
            id: '3',
            title: 'Mitsubishi Xpander Cross 2024',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100',
        },
        lastMessage: 'Unit ready stock, bisa langsung proses.',
        lastMessageTime: '2 hari lalu',
        unread: 0,
        isOnline: true,
    },
]

// Sample messages for selected conversation
const sampleMessages: Message[] = [
    { id: '1', senderId: 'other', content: 'Halo, saya tertarik dengan mobil ini. Masih tersedia?', timestamp: '10:00', status: 'read' },
    { id: '2', senderId: 'me', content: 'Halo! Iya masih tersedia. Ada yang mau ditanyakan?', timestamp: '10:05', status: 'read' },
    { id: '3', senderId: 'other', content: 'Bisa lihat langsung mobilnya kapan ya?', timestamp: '10:15', status: 'read' },
    { id: '4', senderId: 'me', content: 'Bisa hari ini atau besok. Kebetulan saya di showroom sampai jam 5 sore.', timestamp: '10:20', status: 'read' },
    { id: '5', senderId: 'other', content: 'Baik, kapan bisa lihat mobilnya?', timestamp: '10:30', status: 'delivered' },
]

export default function MessagesPage() {
    const [conversations, setConversations] = useState(sampleConversations)
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState(sampleMessages)
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredConversations = conversations.filter((c) =>
        c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConvo) return

        const msg: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
        }

        setMessages([...messages, msg])
        setNewMessage('')
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-140px)]">
                <Card className="h-full overflow-hidden">
                    <div className="flex h-full">
                        {/* Conversation List */}
                        <div className={cn(
                            'w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col',
                            selectedConvo && 'hidden md:flex'
                        )}>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100">
                                <h1 className="text-xl font-bold text-secondary flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Pesan
                                </h1>
                                <div className="relative mt-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari percakapan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Tidak ada percakapan</p>
                                    </div>
                                ) : (
                                    filteredConversations.map((convo) => (
                                        <button
                                            key={convo.id}
                                            onClick={() => setSelectedConvo(convo)}
                                            className={cn(
                                                'w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50',
                                                selectedConvo?.id === convo.id && 'bg-primary/5'
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-gray-400" />
                                                </div>
                                                {convo.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="font-medium text-secondary truncate">
                                                        {convo.contact.name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{convo.lastMessageTime}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">{convo.listing.title}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm text-gray-600 truncate">{convo.lastMessage}</p>
                                                    {convo.unread > 0 && (
                                                        <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                                            {convo.unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={cn(
                            'flex-1 flex flex-col',
                            !selectedConvo && 'hidden md:flex'
                        )}>
                            {selectedConvo ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedConvo(null)}
                                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            ←
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-semibold text-secondary">
                                                    {selectedConvo.contact.name}
                                                </h2>
                                                {selectedConvo.contact.isDealer && (
                                                    <Badge variant="primary" size="sm">Dealer</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {selectedConvo.isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Listing Info */}
                                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={selectedConvo.listing.image}
                                                alt=""
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-secondary truncate">
                                                    {selectedConvo.listing.title}
                                                </p>
                                                <p className="text-xs text-gray-500">Tentang iklan ini</p>
                                            </div>
                                            <Car className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    'flex',
                                                    msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'max-w-[70%] px-4 py-2 rounded-2xl',
                                                        msg.senderId === 'me'
                                                            ? 'bg-primary text-white rounded-br-md'
                                                            : 'bg-gray-100 text-secondary rounded-bl-md'
                                                    )}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <div className={cn(
                                                        'flex items-center justify-end gap-1 mt-1',
                                                        msg.senderId === 'me' ? 'text-white/70' : 'text-gray-400'
                                                    )}>
                                                        <span className="text-xs">{msg.timestamp}</span>
                                                        {msg.senderId === 'me' && (
                                                            msg.status === 'read' ? (
                                                                <CheckCheck className="w-3 h-3" />
                                                            ) : (
                                                                <Check className="w-3 h-3" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                placeholder="Ketik pesan..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Empty State */
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h2 className="text-xl font-semibold text-secondary mb-2">
                                            Pilih Percakapan
                                        </h2>
                                        <p className="text-gray-500">
                                            Pilih percakapan untuk mulai chat
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}
