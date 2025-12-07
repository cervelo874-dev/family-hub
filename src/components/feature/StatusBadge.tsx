'use client';

import { cn } from '@/lib/utils';
import { MemberStatus, STATUS_LABELS, STATUS_ICONS } from '@/lib/types';
import { renderIcon } from '@/lib/icons';

interface StatusBadgeProps {
    status: MemberStatus;
    size?: 'sm' | 'md';
    onClick?: () => void;
}

const statusColors: Record<MemberStatus, { bg: string; text: string }> = {
    home: { bg: 'bg-green-100', text: 'text-green-700' },
    working: { bg: 'bg-blue-100', text: 'text-blue-700' },
    coming_home: { bg: 'bg-amber-100', text: 'text-amber-700' },
    out: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function StatusBadge({ status, size = 'md', onClick }: StatusBadgeProps) {
    const colors = statusColors[status];
    const iconName = STATUS_ICONS[status];

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
                colors.bg,
                colors.text,
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                onClick && 'cursor-pointer hover:opacity-80 active:scale-95 hover:shadow-sm',
                !onClick && 'cursor-default'
            )}
        >
            {renderIcon(iconName, size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')}
            {STATUS_LABELS[status]}
        </button>
    );
}
