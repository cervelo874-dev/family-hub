'use client';

import { cn } from '@/lib/utils';
import { Member } from '@/lib/types';

interface MemberIconProps {
    member: Member;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    showBorder?: boolean;
    onClick?: () => void;
    isSelected?: boolean;
}

// ... imports
import { AVATAR_PRESETS } from '@/lib/constants';

const sizeClasses = {
    sm: { container: 'w-8 h-8', text: 'text-lg', imgSize: 32 },
    md: { container: 'w-12 h-12', text: 'text-2xl', imgSize: 48 },
    lg: { container: 'w-16 h-16', text: 'text-3xl', imgSize: 64 },
};

// DiceBear avatar styles
const DICEBEAR_STYLES = {
    notionists: 'notionists',  // シンプルな線画
    lorelei: 'lorelei',        // 柔らかい雰囲気
    thumbs: 'thumbs',          // かわいいサムズアップ
    bottts: 'bottts',          // ロボット風
} as const;

// Generate DiceBear URL
function getDiceBearUrl(name: string, style: string = 'notionists'): string {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
}

export function MemberIcon({
    member,
    size = 'md',
    showName = false,
    showBorder = true,
    onClick,
    isSelected = false,
}: MemberIconProps) {
    const sizeConfig = sizeClasses[size];
    const hasUploadedImage = !!member.avatarUrl;

    // Check if it's a preset
    const preset = member.avatarUrl?.startsWith('preset:')
        ? AVATAR_PRESETS.find(p => p.id === member.avatarUrl?.replace('preset:', ''))
        : null;

    const diceBearUrl = getDiceBearUrl(member.name, member.avatarStyle || 'notionists');

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-1',
                onClick && 'cursor-pointer'
            )}
            onClick={onClick}
        >
            <div
                className={cn(
                    'flex items-center justify-center rounded-full shadow-sm transition-all duration-200 overflow-hidden bg-white', // changed bg to white for transparent jpgs
                    sizeConfig.container,
                    showBorder && 'ring-2 ring-offset-2',
                    isSelected && 'ring-4 ring-offset-0 scale-110',
                    onClick && 'hover:scale-105 active:scale-95'
                )}
                style={{
                    borderColor: member.themeColor,
                    ...(showBorder && { '--tw-ring-color': member.themeColor } as React.CSSProperties),
                }}
            >
                {preset ? (
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${preset.src})`,
                            backgroundPosition: preset.pos,
                            backgroundSize: preset.size,
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                ) : hasUploadedImage ? (
                    <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <img
                        src={diceBearUrl}
                        alt={member.name}
                        className="object-cover w-full h-full p-0.5"
                    />
                )}
            </div>
            {showName && (
                <span className="text-xs font-medium text-gray-700 truncate max-w-[60px]">
                    {member.name}
                </span>
            )}
        </div>
    );
}

export { getDiceBearUrl, DICEBEAR_STYLES };
