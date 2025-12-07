'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MemberIcon } from './MemberIcon';
import { useFamilyStore } from '@/lib/store';

interface TaskAddModalProps {
    trigger?: React.ReactNode;
}

export function TaskAddModal({ trigger }: TaskAddModalProps) {
    const { members, addTask } = useFamilyStore();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!title.trim()) return;

        addTask(title.trim(), assignedTo || undefined);
        setTitle('');
        setAssignedTo(null);
        setIsOpen(false);
    };

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
            <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        ✅ タスクを追加
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Task Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            タスク内容
                        </label>
                        <Input
                            placeholder="例: ゴミ出し、買い物"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="rounded-xl"
                            autoFocus
                        />
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            担当者（任意）
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setAssignedTo(null)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${assignedTo === null
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                未定
                            </button>
                            {members.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => setAssignedTo(member.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all ${assignedTo === member.id
                                            ? 'ring-2 ring-offset-1'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    style={
                                        assignedTo === member.id
                                            ? { backgroundColor: `${member.themeColor}30`, borderColor: member.themeColor }
                                            : undefined
                                    }
                                >
                                    <span>{member.avatarIcon}</span>
                                    {member.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-11"
                        onClick={() => setIsOpen(false)}
                    >
                        キャンセル
                    </Button>
                    <Button
                        className="flex-1 rounded-xl h-11 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600"
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                    >
                        追加
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
