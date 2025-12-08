'use client';

import { Timeline } from '@/components/feature/Timeline';
import { BottomNav } from '@/components/layout/BottomNav';

import { useEffect } from 'react';
import { useFamilyStore } from '@/lib/store';

export default function TimelinePage() {
    const { markTimelineAsRead } = useFamilyStore();

    useEffect(() => {
        markTimelineAsRead();
    }, [markTimelineAsRead]);

    return (
        <>
            <Timeline />
            <BottomNav />
        </>
    );
}
