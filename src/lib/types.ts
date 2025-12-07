// Member Type
export type MemberType = 'adult' | 'child' | 'pet' | 'other';

// Member Status (for adults only)
export type MemberStatus = 'home' | 'working' | 'coming_home' | 'out';

// Theme Colors for members
export const MEMBER_COLORS = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Teal
    '#45B7D1', // Sky Blue
    '#96CEB4', // Sage Green
    '#FFEAA7', // Soft Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Lavender
    '#85C1E9', // Light Blue
] as const;

// Member Icons (Cute Japanese-style Kawaii Emoji) - Fallback
export const MEMBER_ICONS = [
    // 大人 (Adults) - Cute faces
    '🧑‍🦰', '👨‍🦱', '👩‍🦳', '🧔', '👸', '🤴', '👲', '🧕',
    // 子供 (Kids) - Playful
    '👧', '👦', '🧒', '👶', '🧒🏻',
    // ペット (Pets) - Kawaii animals  
    '🐶', '🐱', '🐰', '🐹', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯',
    '🐸', '🐷', '🐵', '🦄', '🐢', '🐠', '🦜', '🐦',
    // かわいい系 (Cute decorative)
    '🌸', '🌺', '🌻', '🌷', '🍀', '⭐', '🌈', '💖', '🎀', '🍓',
    '🍰', '🧁', '🍩', '🍡', '🍭', '🎂'
] as const;

// Illustrated Avatar Images (Line art style)
export const AVATAR_IMAGES = {
    dad: '/avatars/dad.png',
    mom: '/avatars/mom.png',
    boy: '/avatars/boy.png',
    girl: '/avatars/girl.png',
    dog: '/avatars/dog.png',
    cat: '/avatars/cat.png',
} as const;

export type AvatarImageKey = keyof typeof AVATAR_IMAGES;

// Status Labels - icon names for Lucide rendering
export const STATUS_ICONS: Record<MemberStatus, string> = {
    home: 'Home',
    working: 'Briefcase',
    coming_home: 'CarFront',
    out: 'DoorOpen',
};

export const STATUS_LABELS: Record<MemberStatus, string> = {
    home: '在宅',
    working: '仕事中',
    coming_home: '帰宅中',
    out: '外出中',
};

// Member Type Icons and Labels
export const TYPE_ICONS: Record<MemberType, string> = {
    adult: 'Users',
    child: 'Baby',
    pet: 'PawPrint',
    other: 'Sparkles',
};

export const TYPE_LABELS: Record<MemberType, string> = {
    adult: '大人',
    child: '子供',
    pet: 'ペット',
    other: 'その他',
};

// Member Interface (UI)
export interface Member {
    id: string;
    name: string;
    type: MemberType;
    themeColor: string;
    avatarIcon: string; // Emoji fallback
    avatarUrl?: string; // Custom uploaded image
    avatarStyle?: string; // DiceBear style
    status: MemberStatus;
    isAuthUser?: boolean; // True if this profile is linked to the current auth user
}

// Database Interfaces (Supabase)
export interface DBProfile {
    id: string;
    family_id: string;
    user_id?: string; // Auth user ID
    name: string;
    type: MemberType;
    avatar_url?: string;
    theme_color: string;
    status: MemberStatus;
    is_auth_user: boolean;
    created_at: string;
}

export interface DBLog {
    id: string;
    family_id: string;
    type: LogType;
    custom_button_id?: string;
    note?: string;
    photo_url?: string;
    created_by_member_id: string;
    target_member_ids: string[];
    created_at: string;
}

export interface DBTask {
    id: string;
    family_id: string;
    title: string;
    assigned_to_member_id?: string;
    is_completed: boolean;
    created_at: string;
}

// Family Interface
export interface Family {
    id: string;
    name: string;
    inviteCode?: string;
}

// Message Interface
export interface Message {
    id: string;
    familyId: string;
    content: string;
    createdByMemberId: string;
    isPinned: boolean;
    createdAt: Date;
}

// Task Interface
export interface Task {
    id: string;
    familyId: string;
    title: string;
    assignedToMemberId: string | null;
    isCompleted: boolean;
    createdAt: Date;
}

// Custom Button Interface
export interface CustomButton {
    id: string;
    familyId: string;
    label: string;
    icon: string;
}

// Log Type
export type LogType = 'custom_button' | 'message' | 'task_completed';

// Log Interface
export interface Log {
    id: string;
    familyId: string;
    type: LogType;
    customButtonId?: string;
    note?: string;
    photoUrl?: string;
    targetMemberIds: string[];
    createdByMemberId: string;
    createdAt: Date;
}

// Default Custom Buttons using Lucide icon names
export const DEFAULT_CUSTOM_BUTTONS: Omit<CustomButton, 'id' | 'familyId'>[] = [
    { label: 'ごはん', icon: 'Utensils' },
    { label: 'おやつ', icon: 'Cookie' },
    { label: 'ねんね', icon: 'Moon' },
    { label: 'おふろ', icon: 'Bath' },
    { label: 'おでかけ', icon: 'Car' },
    { label: 'おかいもの', icon: 'ShoppingCart' },
    { label: 'おてつだい', icon: 'Sparkles' },
    { label: 'イベント', icon: 'PartyPopper' },
    { label: '旅行', icon: 'Plane' },
    { label: 'メモ', icon: 'FileText' },
];
