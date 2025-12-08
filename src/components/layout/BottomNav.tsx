'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', icon: Home, label: 'ホーム' },
    { href: '/timeline', icon: Clock, label: 'タイムライン' },
    { href: '/messages', icon: MessageSquare, label: '伝言板' },
    { href: '/settings', icon: Settings, label: '設定' },
];

import { useFamilyStore } from '@/lib/store';

export function BottomNav() {
    const pathname = usePathname();
    const { unreadTimelineCount, unreadMessagesCount } = useFamilyStore();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    let badgeCount = 0;
                    if (item.href === '/timeline') badgeCount = unreadTimelineCount;
                    if (item.href === '/messages') badgeCount = unreadMessagesCount;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200',
                                isActive
                                    ? 'text-primary scale-105'
                                    : 'text-muted-foreground hover:text-primary/70'
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn('w-6 h-6 mb-1', isActive && 'stroke-[2.5px]')} />
                                {badgeCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                        {badgeCount > 9 ? '9+' : badgeCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
