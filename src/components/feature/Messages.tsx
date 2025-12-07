'use client';

import { useState } from 'react';
import { Plus, Send, Pin, PinOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MemberIcon } from './MemberIcon';
import { useFamilyStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Messages() {
    const { messages, members, getMemberById, addMessage, toggleMessagePin } = useFamilyStore();
    const [newMessage, setNewMessage] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [selectedSender, setSelectedSender] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedSender) return;

        addMessage(newMessage.trim(), selectedSender);
        setNewMessage('');
        setIsComposing(false);
        setSelectedSender(null);
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return '今日';
        if (d.toDateString() === yesterday.toDateString()) return '昨日';
        return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    };

    // Sort messages: pinned first, then by date
    const sortedMessages = [...messages].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 py-4 max-w-lg mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        伝言板 💬
                    </h1>
                    <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => setIsComposing(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        新規
                    </Button>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
                {/* Compose Form */}
                {isComposing && (
                    <Card className="rounded-2xl shadow-lg border-0 bg-white">
                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Sender Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">誰から？</label>
                                    <div className="flex flex-wrap gap-2">
                                        {members.map((member) => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => setSelectedSender(member.id)}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all',
                                                    selectedSender === member.id
                                                        ? 'ring-2 ring-offset-1 shadow-sm'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                )}
                                                style={
                                                    selectedSender === member.id
                                                        ? { backgroundColor: `${member.themeColor}30`, borderColor: member.themeColor }
                                                        : undefined
                                                }
                                            >
                                                <span className="text-base">{member.avatarIcon}</span>
                                                {member.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message Input */}
                                <Input
                                    placeholder="伝えたいことを入力..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="rounded-xl"
                                />

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 rounded-xl"
                                        onClick={() => {
                                            setIsComposing(false);
                                            setNewMessage('');
                                            setSelectedSender(null);
                                        }}
                                    >
                                        キャンセル
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 rounded-xl gap-1"
                                        disabled={!newMessage.trim() || !selectedSender}
                                    >
                                        <Send className="w-4 h-4" />
                                        送信
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Messages List */}
                {sortedMessages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-4xl mb-2">💬</p>
                        <p className="text-gray-400">伝言がありません</p>
                        <p className="text-sm text-gray-300 mt-1">新規ボタンから伝言を追加しましょう</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedMessages.map((message) => {
                            const creator = getMemberById(message.createdByMemberId);
                            return (
                                <Card
                                    key={message.id}
                                    className={cn(
                                        'rounded-2xl shadow-sm border-0 overflow-hidden transition-all duration-200',
                                        message.isPinned
                                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 ring-2 ring-amber-200'
                                            : 'bg-white/80 backdrop-blur'
                                    )}
                                >
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-start gap-3">
                                            {/* Creator Avatar */}
                                            {creator && (
                                                <MemberIcon member={creator} size="sm" />
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm text-gray-800">
                                                        {creator?.name || '不明'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(message.createdAt)} {formatTime(message.createdAt)}
                                                    </span>
                                                    {message.isPinned && (
                                                        <Pin className="w-3 h-3 text-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-gray-700">{message.content}</p>
                                            </div>

                                            {/* Actions */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-shrink-0 h-8 w-8 p-0"
                                                onClick={() => toggleMessagePin(message.id)}
                                            >
                                                {message.isPinned ? (
                                                    <PinOff className="w-4 h-4 text-amber-500" />
                                                ) : (
                                                    <Pin className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
