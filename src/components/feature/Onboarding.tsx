'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users, Upload, X, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MemberIcon } from './MemberIcon';
import { useFamilyStore } from '@/lib/store';
import {
    MemberType,
    TYPE_LABELS,
    MEMBER_COLORS,
    Member,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OnboardingStep = 'family' | 'members' | 'complete';

// DiceBear styles
const DICEBEAR_STYLES = [
    { id: 'notionists', label: 'シンプル' },
    { id: 'lorelei', label: 'やわらか' },
    { id: 'thumbs', label: 'ポップ' },
    { id: 'adventurer', label: 'アドベンチャー' },
];

function getDiceBearUrl(name: string, style: string): string {
    const seed = encodeURIComponent(name || 'preview');
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
}

export function Onboarding() {
    const router = useRouter();
    const { createFamily, isLoading } = useFamilyStore();

    const [step, setStep] = useState<OnboardingStep>('family');
    const [familyName, setFamilyName] = useState('');

    // Local state for members accumulation before saving
    const [localMembers, setLocalMembers] = useState<Omit<Member, 'id'>[]>([]);

    // New member form state
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberType, setNewMemberType] = useState<MemberType>('adult');
    const [newMemberColor, setNewMemberColor] = useState<string>(MEMBER_COLORS[0]);
    const [newMemberStyle, setNewMemberStyle] = useState('notionists');
    const [newMemberAvatarUrl, setNewMemberAvatarUrl] = useState<string | null>(null);
    const [useCustomImage, setUseCustomImage] = useState(false);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください');
            return;
        }

        if (file.size > 500 * 1024) {
            alert('画像サイズは500KB以下にしてください');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            // Similar logic to compress image if needed, for now just setting
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
                setNewMemberAvatarUrl(compressedUrl);
                setUseCustomImage(true);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setNewMemberAvatarUrl(null);
        setUseCustomImage(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFamilySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!familyName.trim()) return;
        setStep('members');
    };

    const handleAddMember = () => {
        if (!newMemberName.trim()) return;

        const newMember: Omit<Member, 'id'> = {
            name: newMemberName.trim(),
            type: newMemberType,
            themeColor: newMemberColor,
            avatarIcon: '👤',
            avatarUrl: useCustomImage ? newMemberAvatarUrl || undefined : undefined,
            avatarStyle: useCustomImage ? undefined : newMemberStyle,
            status: 'home',
        };

        setLocalMembers([...localMembers, newMember]);

        // Reset form
        setNewMemberName('');
        setNewMemberType('adult');
        setNewMemberColor(MEMBER_COLORS[localMembers.length % MEMBER_COLORS.length] || MEMBER_COLORS[0]);
        setNewMemberStyle('notionists');
        setNewMemberAvatarUrl(null);
        setUseCustomImage(false);
        setShowMemberForm(false);
    };

    const handleComplete = async () => {
        if (localMembers.length === 0) return;
        try {
            await createFamily(familyName, localMembers);
            router.push('/');
        } catch (error: any) {
            toast.error('エラーが発生しました: ' + (error.message || '不明なエラー'));
        }
    };

    const previewUrl = useCustomImage && newMemberAvatarUrl
        ? newMemberAvatarUrl
        : getDiceBearUrl(newMemberName, newMemberStyle);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex flex-col">
            <header className="px-4 py-6 text-center relative">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-6 text-gray-400 hover:text-red-500"
                    onClick={async () => {
                        const { supabase } = await import('@/lib/supabase');
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                >
                    ログアウト
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Family Hub 🏠
                </h1>
                <p className="text-sm text-gray-500 mt-1">家族の情報共有アプリ</p>
            </header>

            <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
                {step === 'family' && (
                    <Card className="rounded-2xl shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-teal-500" />
                                グループ名を設定
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFamilySubmit} className="space-y-4">
                                <Input
                                    placeholder="例: 田中家、チームA"
                                    value={familyName}
                                    onChange={(e) => setFamilyName(e.target.value)}
                                    className="rounded-xl h-12 text-lg"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600"
                                    disabled={!familyName.trim()}
                                >
                                    次へ
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {step === 'members' && (
                    <div className="space-y-4">
                        <Card className="rounded-2xl shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-lg">メンバーを追加</CardTitle>
                                <p className="text-sm text-gray-500">
                                    家族やグループのメンバーを登録しましょう
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {localMembers.length > 0 && (
                                    <div className="flex flex-wrap gap-3 pb-4 border-b">
                                        {localMembers.map((member, idx) => (
                                            <MemberIcon
                                                key={idx}
                                                member={{ ...member, id: `preview-${idx}` }}
                                                size="md"
                                                showName
                                            />
                                        ))}
                                    </div>
                                )}

                                {showMemberForm ? (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                                        <Input
                                            placeholder="名前"
                                            value={newMemberName}
                                            onChange={(e) => setNewMemberName(e.target.value)}
                                            className="rounded-xl"
                                            autoFocus
                                        />

                                        {/* Type Selection */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">属性</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(Object.keys(TYPE_LABELS) as MemberType[]).map((type) => (
                                                    <Button
                                                        key={type}
                                                        type="button"
                                                        variant={newMemberType === type ? 'default' : 'outline'}
                                                        size="sm"
                                                        className="rounded-full"
                                                        onClick={() => setNewMemberType(type)}
                                                    >
                                                        {TYPE_LABELS[type]}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Selection */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">テーマカラー</label>
                                            <div className="flex flex-wrap gap-2">
                                                {MEMBER_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        className={cn(
                                                            'w-8 h-8 rounded-full transition-transform',
                                                            newMemberColor === color && 'ring-2 ring-offset-2 scale-110'
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => setNewMemberColor(color)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Avatar Mode Toggle */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">アイコン</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { setUseCustomImage(false); setNewMemberAvatarUrl(null); }}
                                                    className={cn(
                                                        'flex-1 py-2 px-2 rounded-xl text-xs transition-all',
                                                        !useCustomImage
                                                            ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400'
                                                            : 'bg-gray-100 text-gray-600'
                                                    )}
                                                >
                                                    🎨 自動生成
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseCustomImage(true)}
                                                    className={cn(
                                                        'flex-1 py-2 px-2 rounded-xl text-xs transition-all',
                                                        useCustomImage
                                                            ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400'
                                                            : 'bg-gray-100 text-gray-600'
                                                    )}
                                                >
                                                    📷 画像
                                                </button>
                                            </div>
                                        </div>

                                        {/* DiceBear Style Selection */}
                                        {!useCustomImage && (
                                            <div className="flex gap-2 overflow-x-auto scroolbar-hide">
                                                {DICEBEAR_STYLES.map((style) => (
                                                    <button
                                                        key={style.id}
                                                        type="button"
                                                        onClick={() => setNewMemberStyle(style.id)}
                                                        className={cn(
                                                            'flex flex-col items-center p-2 rounded-xl min-w-[60px]',
                                                            newMemberStyle === style.id
                                                                ? 'bg-gray-100 ring-2 ring-gray-800'
                                                                : 'hover:bg-gray-50'
                                                        )}
                                                    >
                                                        <img
                                                            src={getDiceBearUrl(newMemberName || 'preview', style.id)}
                                                            alt={style.label}
                                                            className="w-10 h-10 rounded-full bg-gray-100"
                                                        />
                                                        <span className="text-xs mt-1">{style.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Image Upload */}
                                        {useCustomImage && (
                                            <div>
                                                {newMemberAvatarUrl ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: newMemberColor }}>
                                                            <img src={newMemberAvatarUrl} alt="アバター" className="w-full h-full object-cover" />
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} className="text-red-500">
                                                            <X className="w-4 h-4 mr-1" /> 削除
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="onboard-avatar" />
                                                        <label htmlFor="onboard-avatar" className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50">
                                                            <Upload className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-500">アップロード</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Preview */}
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 bg-gray-100" style={{ borderColor: newMemberColor }}>
                                                <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{newMemberName || '名前...'}</p>
                                                <p className="text-xs text-gray-500">{TYPE_LABELS[newMemberType]}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowMemberForm(false)}>
                                                キャンセル
                                            </Button>
                                            <Button type="button" className="flex-1 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500" onClick={handleAddMember} disabled={!newMemberName.trim()}>
                                                追加
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" className="w-full h-14 rounded-xl border-dashed" onClick={() => setShowMemberForm(true)}>
                                        <Plus className="w-5 h-5 mr-2" />
                                        メンバーを追加
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Button
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600"
                            onClick={handleComplete}
                            disabled={localMembers.length === 0 || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : localMembers.length === 0 ? (
                                'メンバーを追加してください'
                            ) : (
                                '設定を完了'
                            )}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
