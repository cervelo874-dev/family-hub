'use client';

import { useState, useRef } from 'react';
import { Camera, Check, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MemberIcon } from './MemberIcon';
import { useFamilyStore } from '@/lib/store';
import { CustomButton } from '@/lib/types';
import { cn } from '@/lib/utils';
import { renderIcon } from '@/lib/icons';
import { toast } from 'sonner';

interface QuickLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedButton: CustomButton | null;
}

export function QuickLogModal({ isOpen, onClose, selectedButton }: QuickLogModalProps) {
    const { members, addLog } = useFamilyStore();
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleMember = (memberId: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('画像ファイルを選択してください');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('画像サイズは2MB以下にしてください');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 800;
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

                const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
                setPhotoUrl(compressedUrl);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!selectedButton || selectedMemberIds.length === 0 || !creatorId) return;
        setLoading(true);

        try {
            await addLog({
                type: 'custom_button',
                customButtonId: selectedButton.id,
                note: note || undefined,
                photoUrl: photoUrl || undefined,
                targetMemberIds: selectedMemberIds,
                createdByMemberId: creatorId,
            });

            toast.success('記録しました');
            handleClose();
        } catch (error: any) {
            toast.error('記録に失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedMemberIds([]);
        setCreatorId(null);
        setNote('');
        setPhotoUrl(null);
        setLoading(false);
        onClose();
    };

    if (!selectedButton) return null;

    // Allow any member to be the creator (not just adults)
    const creatorOptions = members;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2 text-gray-600">
                        {renderIcon(selectedButton.icon, 'w-10 h-10')}
                    </div>
                    <DialogTitle className="text-xl font-bold">
                        {selectedButton.label}を記録
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Creator Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            誰が記録？
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {creatorOptions.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => setCreatorId(member.id)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all',
                                        creatorId === member.id
                                            ? 'ring-2 ring-offset-1 shadow-sm'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    )}
                                    style={
                                        creatorId === member.id
                                            ? { backgroundColor: `${member.themeColor}30`, borderColor: member.themeColor }
                                            : undefined
                                    }
                                >
                                    <MemberIcon member={member} size="sm" showBorder={false} />
                                    {member.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Member Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                            誰の記録？（複数選択可）
                        </label>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="relative cursor-pointer"
                                    onClick={() => toggleMember(member.id)}
                                >
                                    <MemberIcon
                                        member={member}
                                        size="md"
                                        showName
                                        isSelected={selectedMemberIds.includes(member.id)}
                                    />
                                    {selectedMemberIds.includes(member.id) && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            メモ（任意）
                        </label>
                        <Input
                            placeholder="例: 公園で元気に遊びました！"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            写真（任意）
                        </label>
                        {photoUrl ? (
                            <div className="relative">
                                <img
                                    src={photoUrl}
                                    alt="添付写真"
                                    className="w-full h-40 object-cover rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="quick-log-photo"
                                />
                                <label
                                    htmlFor="quick-log-photo"
                                    className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors"
                                >
                                    <Camera className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">写真を追加</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-12"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        キャンセル
                    </Button>
                    <Button
                        className="flex-1 rounded-xl h-12 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600"
                        onClick={handleSubmit}
                        disabled={selectedMemberIds.length === 0 || !creatorId || loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        保存
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
