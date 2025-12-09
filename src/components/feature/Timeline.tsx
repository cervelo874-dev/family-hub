'use client';

import { useState } from 'react';
import { Filter, Trash2, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberIcon } from './MemberIcon';
import { useFamilyStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { renderIcon } from '@/lib/icons';
import { toast } from 'sonner';

export function Timeline() {
    const { logs, members, customButtons, getMemberById, deleteLog } = useFamilyStore();
    const [filterMemberId, setFilterMemberId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const filteredLogs = filterMemberId
        ? logs.filter((log) => log.targetMemberIds.includes(filterMemberId))
        : logs;

    const getButtonInfo = (buttonId?: string) => {
        if (!buttonId) return null;
        return customButtons.find((btn) => btn.id === buttonId);
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'たった今';
        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    };

    const handleDelete = async (logId: string) => {
        if (!confirm('この記録を削除しますか？')) return;

        setDeletingId(logId);
        try {
            await deleteLog(logId);
            toast.success('削除しました');
        } catch (error) {
            toast.error('削除に失敗しました');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 py-4 max-w-lg mx-auto">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        タイムライン
                    </h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                {/* Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <Button
                        variant={filterMemberId === null ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full flex-shrink-0"
                        onClick={() => setFilterMemberId(null)}
                    >
                        <Filter className="w-4 h-4 mr-1" />
                        すべて
                    </Button>
                    {members.map((member) => (
                        <Button
                            key={member.id}
                            variant={filterMemberId === member.id ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full flex-shrink-0 gap-1 pl-1"
                            onClick={() => setFilterMemberId(member.id)}
                            style={
                                filterMemberId === member.id
                                    ? { backgroundColor: member.themeColor }
                                    : undefined
                            }
                        >
                            <MemberIcon member={member} size="sm" showBorder={false} />
                            {member.name}
                        </Button>
                    ))}
                </div>

                {/* Log List */}
                <div className="space-y-3">
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">記録がありません</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const buttonInfo = getButtonInfo(log.customButtonId);
                            const targetMembers = log.targetMemberIds
                                .map((id) => getMemberById(id))
                                .filter(Boolean);
                            const creator = getMemberById(log.createdByMemberId);
                            const primaryMember = targetMembers[0];
                            const isDeleting = deletingId === log.id;

                            return (
                                <Card
                                    key={log.id}
                                    className={cn(
                                        'rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur overflow-hidden transition-opacity',
                                        'border-l-4',
                                        isDeleting && 'opacity-50 pointer-events-none'
                                    )}
                                    style={{
                                        borderLeftColor: primaryMember?.themeColor || '#ccc',
                                    }}
                                >
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-600">
                                                {buttonInfo ? renderIcon(buttonInfo.icon, 'w-5 h-5') : renderIcon('FileText', 'w-5 h-5')}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-800">
                                                            {buttonInfo?.label || 'ログ'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatTime(log.createdAt)}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-300 hover:text-red-500 hover:bg-red-50 -mr-2"
                                                        onClick={() => handleDelete(log.id)}
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                {log.note && (
                                                    <p className="text-sm text-gray-600 mb-2">{log.note}</p>
                                                )}

                                                {/* Photo */}
                                                {log.photoUrl && (
                                                    <img
                                                        src={log.photoUrl}
                                                        alt="添付写真"
                                                        className="w-full h-32 object-cover rounded-xl mb-2 cursor-zoom-in hover:opacity-95 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setZoomedImage(log.photoUrl!);
                                                        }}
                                                    />
                                                )}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {targetMembers.map((member) => (
                                                        member && (
                                                            <Badge
                                                                key={member.id}
                                                                variant="secondary"
                                                                className="rounded-full text-xs gap-1 pl-0.5"
                                                                style={{
                                                                    backgroundColor: `${member.themeColor}20`,
                                                                    color: member.themeColor,
                                                                }}
                                                            >
                                                                <MemberIcon member={member} size="sm" showBorder={false} />
                                                                {member.name}
                                                            </Badge>
                                                        )
                                                    ))}
                                                </div>

                                                {/* Creator */}
                                                {creator && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                                        <MemberIcon member={creator} size="sm" showBorder={false} />
                                                        <span>{creator.name}が記録</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Image Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        onClick={() => setZoomedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={zoomedImage}
                        alt="拡大表示"
                        className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
