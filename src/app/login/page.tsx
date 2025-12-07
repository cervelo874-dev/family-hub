'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('登録確認メールを送信しました！メールを確認してください。');
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('ログインしました！');
                router.push('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-purple-50">
            <Card className="w-full max-w-md rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-md transform -rotate-3">
                        <span className="text-3xl">🏠</span>
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Family Hub
                    </CardTitle>
                    <CardDescription>
                        {isSignUp ? '新しいアカウントを作成' : 'おかえりなさい'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">メールアドレス</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-9 rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">パスワード</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="6文字以上"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-9 rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isSignUp ? (
                                'アカウント登録'
                            ) : (
                                'ログイン'
                            )}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400">または</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'すでにアカウントをお持ちの方' : '新しくアカウントを作成'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
