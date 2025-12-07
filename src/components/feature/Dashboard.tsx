'use client';

import { useState } from 'react';
import { Pin, CheckCircle2, Circle, Home, Briefcase, CarFront, DoorOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberIcon } from './MemberIcon';
import { StatusBadge } from './StatusBadge';
import { QuickLogModal } from './QuickLogModal';
import { TaskAddModal } from './TaskAddModal';
import { useFamilyStore } from '@/lib/store';
import { CustomButton, MemberStatus, DEFAULT_CUSTOM_BUTTONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { renderIcon } from '@/lib/icons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusOptions: { value: MemberStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'home', label: '在宅', icon: <Home className="w-4 h-4" /> },
    { value: 'working', label: '仕事中', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'coming_home', label: '帰宅中', icon: <CarFront className="w-4 h-4" /> },
    { value: 'out', label: '外出中', icon: <DoorOpen className="w-4 h-4" /> },
];

export function Dashboard() {
    const {
        family,
        members,
        customButtons,
        getAdultMembers,
        getPinnedMessage,
        getIncompleteTasks,
        getMemberById,
        updateMemberStatus,
        toggleTaskComplete,
    } = useFamilyStore();

    // Sort buttons based on DEFAULT_CUSTOM_BUTTONS order
    const sortedButtons = [...customButtons].sort((a, b) => {
        const indexA = DEFAULT_CUSTOM_BUTTONS.findIndex(btn => btn.label === a.label);
        const indexB = DEFAULT_CUSTOM_BUTTONS.findIndex(btn => btn.label === b.label);
        // If both found, sort by index. If not found, put at the end.
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
    });

    const [selectedButton, setSelectedButton] = useState<CustomButton | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const adultMembers = getAdultMembers();
    const pinnedMessage = getPinnedMessage();
    const incompleteTasks = getIncompleteTasks();
    const pinnedMessageCreator = pinnedMessage
        ? getMemberById(pinnedMessage.createdByMemberId)
        : null;

    const handleButtonClick = (button: CustomButton) => {
        setSelectedButton(button);
        setIsModalOpen(true);
    };

    const handleStatusChange = (memberId: string, status: MemberStatus) => {
        updateMemberStatus(memberId, status);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 py-4 max-w-lg mx-auto">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {family?.name || 'Family Hub'} 🏠
                    </h1>
                </div>
            </header>

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                {/* Daily Sync Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                        リアルタイム・ボード
                    </h2>

                    {/* Member Status */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                👨‍👩‍👧‍👦 家族のステータス
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                {adultMembers.map((member) => (
                                    <div key={member.id} className="flex flex-col items-center gap-2">
                                        <MemberIcon member={member} size="md" />
                                        <span className="text-xs font-medium text-gray-600">{member.name}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div>
                                                    <StatusBadge status={member.status} size="sm" onClick={() => { }} />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="center">
                                                {statusOptions.map((option) => (
                                                    <DropdownMenuItem
                                                        key={option.value}
                                                        onClick={() => handleStatusChange(member.id, option.value)}
                                                        className="gap-2"
                                                    >
                                                        {option.icon}
                                                        {option.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pinned Message */}
                    {pinnedMessage && (
                        <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-r from-amber-50 to-orange-50">
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    <Pin className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-gray-800 font-medium">{pinnedMessage.content}</p>
                                        {pinnedMessageCreator && (
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <span>{pinnedMessageCreator.avatarIcon}</span>
                                                {pinnedMessageCreator.name}より
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tasks */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    ✅ 今日のタスク
                                    <span className="text-xs font-normal text-gray-500">
                                        ({incompleteTasks.length}件)
                                    </span>
                                </span>
                                <TaskAddModal />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {incompleteTasks.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    タスクはありません 🎉
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {incompleteTasks.slice(0, 5).map((task) => {
                                        const assignee = task.assignedToMemberId
                                            ? getMemberById(task.assignedToMemberId)
                                            : null;
                                        return (
                                            <li
                                                key={task.id}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => toggleTaskComplete(task.id)}
                                            >
                                                <Circle className="w-5 h-5 text-gray-300" />
                                                <span className="flex-1 text-sm text-gray-700">{task.title}</span>
                                                {assignee && (
                                                    <MemberIcon member={assignee} size="sm" />
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Quick Log Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-400 rounded-full" />
                        ワンタップ・ログ
                    </h2>

                    <div className="grid grid-cols-5 gap-2">
                        {sortedButtons.map((button) => (
                            <Button
                                key={button.id}
                                variant="outline"
                                className={cn(
                                    'h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5',
                                    'bg-white/80 backdrop-blur border-gray-200 hover:bg-gray-50',
                                    'hover:scale-105 active:scale-95 transition-all duration-200',
                                    'shadow-sm hover:shadow-md'
                                )}
                                onClick={() => handleButtonClick(button)}
                            >
                                <span className="text-gray-600">{renderIcon(button.icon, 'w-6 h-6')}</span>
                                <span className="text-xs font-medium text-gray-600">{button.label}</span>
                            </Button>
                        ))}
                    </div>
                </section>
            </main>

            {/* Quick Log Modal */}
            <QuickLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedButton={selectedButton}
            />
        </div>
    );
}
