'use client';

import { Messages } from '@/components/feature/Messages';
import { BottomNav } from '@/components/layout/BottomNav';

import { useEffect } from 'react';
import { useFamilyStore } from '@/lib/store';

export default function MessagesPage() {
    const { markMessagesAsRead } = useFamilyStore();

    useEffect(() => {
        markMessagesAsRead();
    }, [markMessagesAsRead]);

    return (
        <>
            <Messages />
            <BottomNav />
        </>
    );
}
