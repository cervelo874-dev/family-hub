'use client';

import { useState, useRef } from 'react';
import { Plus, Upload, X, Palette, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFamilyStore } from '@/lib/store';
import { MEMBER_COLORS, MemberType, TYPE_LABELS, TYPE_ICONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { renderIcon } from '@/lib/icons';
import { toast } from 'sonner';

interface MemberAddModalProps {
    trigger?: React.ReactNode;
}

// DiceBear styles
const DICEBEAR_STYLES = [
    { id: 'notionists', label: 'シンプル', preview: 'https://api.dicebear.com/9.x/notionists/svg?seed=preview' },
    { id: 'lorelei', label: 'やわらか', preview: 'https://api.dicebear.com/9.x/lorelei/svg?seed=preview' },
    { id: 'thumbs', label: 'ポップ', preview: 'https://api.dicebear.com/9.x/thumbs/svg?seed=preview' },
    { id: 'adventurer', label: 'アドベンチャー', preview: 'https://api.dicebear.com/9.x/adventurer/svg?seed=preview' },
];

function getDiceBearUrl(name: string, style: string): string {
    const seed = encodeURIComponent(name || 'preview');
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
}

export function MemberAddModal({ trigger }: MemberAddModalProps) {
    const { addMember } = useFamilyStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [type, setType] = useState<MemberType>('adult');
    const [themeColor, setThemeColor] = useState<string>(MEMBER_COLORS[0]);
    const [avatarStyle, setAvatarStyle] = useState('notionists');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [useCustomImage, setUseCustomImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('画像ファイルを選択してください');
            return;
        }

        if (file.size > 500 * 1024) {
            toast.error('画像サイズは500KB以下にしてください');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
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
                setAvatarUrl(compressedUrl);
                setUseCustomImage(true);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setAvatarUrl(null);
        setUseCustomImage(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            await addMember({
                name: name.trim(),
                type,
                themeColor,
                avatarIcon: '👤', // Legacy fallback
                avatarUrl: useCustomImage ? avatarUrl || undefined : undefined,
                avatarStyle: useCustomImage ? undefined : avatarStyle,
                status: 'home',
            });

            toast.success('メンバーを追加しました');

            // Reset form
            setName('');
            setType('adult');
            setThemeColor(MEMBER_COLORS[0]);
            setAvatarStyle('notionists');
            setAvatarUrl(null);
            setUseCustomImage(false);
            setIsOpen(false);
        } catch (error: any) {
            toast.error('追加に失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setLoading(false);
        }
    };

    const memberTypes: MemberType[] = ['adult', 'child', 'pet', 'other'];
    const previewUrl = useCustomImage && avatarUrl ? avatarUrl : getDiceBearUrl(name, avatarStyle);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="ghost" className="text-teal-600">
                        <Plus className="w-4 h-4 mr-1" />
                        追加
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        👥 メンバーを追加
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">名前</label>
                        <Input
                            placeholder="例: パパ、ママ、ポチ"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl"
                            autoFocus
                        />
                    </div>

                    {/* Member Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">属性</label>
                        <div className="flex flex-wrap gap-2">
                            {memberTypes.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all',
                                        type === t
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    )}
                                >
                                    {renderIcon(TYPE_ICONS[t], 'w-4 h-4')}
                                    {TYPE_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Color */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">テーマカラー</label>
                        <div className="flex flex-wrap gap-2">
                            {MEMBER_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setThemeColor(color)}
                                    className={cn(
                                        'w-8 h-8 rounded-full transition-all',
                                        themeColor === color && 'ring-2 ring-offset-2 scale-110'
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Avatar Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">アイコン</label>

                        {/* Toggle: Auto vs Custom */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setUseCustomImage(false); setAvatarUrl(null); }}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm transition-all',
                                    !useCustomImage
                                        ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                )}
                            >
                                <Palette className="w-4 h-4" />
                                自動生成
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseCustomImage(true)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm transition-all',
                                    useCustomImage
                                        ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                )}
                            >
                                <Camera className="w-4 h-4" />
                                画像アップロード
                            </button>
                        </div>

                        {/* Auto-generated styles */}
                        {!useCustomImage && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {DICEBEAR_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => setAvatarStyle(style.id)}
                                        className={cn(
                                            'flex flex-col items-center p-2 rounded-xl transition-all min-w-[70px]',
                                            avatarStyle === style.id
                                                ? 'bg-gray-100 ring-2 ring-gray-800'
                                                : 'hover:bg-gray-50'
                                        )}
                                    >
                                        <img
                                            src={getDiceBearUrl(name || 'preview', style.id)}
                                            alt={style.label}
                                            className="w-12 h-12 rounded-full bg-gray-100"
                                        />
                                        <span className="text-xs mt-1">{style.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Custom image upload */}
                        {useCustomImage && (
                            <div>
                                {avatarUrl ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 bg-gray-100" style={{ borderColor: themeColor }}>
                                            <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRemoveImage}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            削除
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors"
                                        >
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-500">画像をアップロード</span>
                                        </label>
                                        <p className="text-xs text-gray-400 text-center mt-1">500KB以下のJPG/PNG</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">プレビュー</p>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-14 h-14 rounded-full overflow-hidden border-2 bg-gray-100"
                                style={{ borderColor: themeColor }}
                            >
                                <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-medium">{name || '名前を入力...'}</p>
                                <p className="text-xs text-gray-500">{TYPE_LABELS[type]}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-11"
                        onClick={() => setIsOpen(false)}
                        disabled={loading}
                    >
                        キャンセル
                    </Button>
                    <Button
                        className="flex-1 rounded-xl h-11 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600"
                        onClick={handleSubmit}
                        disabled={!name.trim() || loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        追加
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
