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
                                                onClick={() => deleteMember(member.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Danger Zone removed */}

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
