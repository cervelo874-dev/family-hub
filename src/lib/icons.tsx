import {
    Utensils,
    Cookie,
    Moon,
    Bath,
    Car,
    ShoppingCart,
    Sparkles,
    PartyPopper,
    Plane,
    FileText,
    Home,
    Briefcase,
    CarFront,
    DoorOpen,
    Users,
    Baby,
    PawPrint,
    Pin,
    CheckCircle2,
    Circle,
    MessageSquare,
    Calendar,
    Clock,
    Settings,
    Plus,
    Trash2,
    LucideIcon,
} from 'lucide-react';

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
    Utensils,
    Cookie,
    Moon,
    Bath,
    Car,
    ShoppingCart,
    Sparkles,
    PartyPopper,
    Plane,
    FileText,
    Home,
    Briefcase,
    CarFront,
    DoorOpen,
    Users,
    Baby,
    PawPrint,
    Pin,
    CheckCircle2,
    Circle,
    MessageSquare,
    Calendar,
    Clock,
    Settings,
    Plus,
    Trash2,
};

// Get Lucide icon component by name
export function getIcon(name: string): LucideIcon | null {
    return iconMap[name] || null;
}

// Render icon with className
export function renderIcon(name: string, className: string = 'w-5 h-5') {
    const Icon = iconMap[name];
    if (Icon) {
        return <Icon className={className} />;
    }
    // Fallback to text if not found in map
    return <span className={className}>{name}</span>;
}
