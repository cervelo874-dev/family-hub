'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberIcon } from '@/components/feature/MemberIcon';
import { MemberAddModal } from '@/components/feature/MemberAddModal';
import { useFamilyStore } from '@/lib/store';
import { BottomNav } from '@/components/layout/BottomNav';
import { TYPE_LABELS } from '@/lib/types';
import { toast } from 'sonner';

export default function SettingsPage() {
    const router = useRouter();
    const { family, members, deleteMember } = useFamilyStore();
    const [confirmReset, setConfirmReset] = useState(false);

    // function removed

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 pb-24">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100">
                    <div className="px-4 py-4 max-w-lg mx-auto">
                        <h1 className="text-xl font-bold text-gray-800">
                            設定
                        </h1>
                    </div>
                </header>

                <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                    {/* Family Info */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">グループ情報</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold text-gray-800">
                                {family?.name || '-'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Members */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center justify-between">
                                <span>メンバー ({members.length}人)</span>
                                <MemberAddModal />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {members.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">メンバーがいません</p>
                            ) : (
                                <ul className="space-y-3">
                                    {members.map((member) => (
                                        <li
                                            key={member.id}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
                                        >
                                            <MemberIcon member={member} size="sm" />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{member.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {TYPE_LABELS[member.type]}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-red-500"
                                                onClick={async () => {
                                                    if (!confirm(`${member.name}を削除しますか？\n(過去のログなどは残ります)`)) return;
                                                    try {
                                                        await deleteMember(member.id);
                                                        // toast.success('削除しました'); // Realtime will remove it
                                                    } catch (e) {
                                                        toast.error('削除に失敗しました。関連データがある可能性があります。');
                                                        console.error(e);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="rounded-2xl shadow-sm border-2 border-red-100 bg-red-50/50 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-red-600 flex items-center gap-2">
                                ⚠️ 危険エリア
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-500 mb-4">
                                グループと全てのデータを完全に削除します。この操作は取り消せません。
                            </p>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-100 bg-white"
                                onClick={async () => {
                                    if (!confirm('本当に全てのデータを削除しますか？\nメンバー、ログ、設定など全てが消去されます。')) return;
                                    if (!confirm('この操作は絶対に取り消せません。\n本当によろしいですか？')) return;

                                    try {
                                        const { useFamilyStore } = await import('@/lib/store');
                                        await useFamilyStore.getState().resetFamily();
                                        toast.success('データを初期化しました');
                                        router.push('/');
                                    } catch (e) {
                                        toast.error('初期化に失敗しました');
                                        console.error(e);
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                グループを削除して初期化
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Account */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">アカウント</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                onClick={async () => {
                                    const { supabase } = await import('@/lib/supabase');
                                    await supabase.auth.signOut();
                                    router.push('/login');
                                }}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                ログアウト
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
            <BottomNav />
        </>
    );
}
