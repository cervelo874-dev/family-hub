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

    // Priority: 1. User uploaded image, 2. DiceBear generated, 3. Emoji fallback
    const hasUploadedImage = !!member.avatarUrl;
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
                    'flex items-center justify-center rounded-full shadow-sm transition-all duration-200 overflow-hidden bg-gray-100',
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
                {hasUploadedImage ? (
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

// Export for use in other components
export { getDiceBearUrl, DICEBEAR_STYLES };
