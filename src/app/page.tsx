'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/feature/Dashboard';
import { Onboarding } from '@/components/feature/Onboarding';
import { BottomNav } from '@/components/layout/BottomNav';
import { useFamilyStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isOnboarded = useFamilyStore((state) => state.isOnboarded);
  const setSessionUser = useFamilyStore((state) => state.setSessionUser);
  const isLoading = useFamilyStore((state) => state.isLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setSessionUser(user.id);
    }
  }, [user, authLoading, router, setSessionUser]);

  // Show loading state while checking auth or fetching initial data
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but not onboarded (no family linked), show onboarding
  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <>
      <Dashboard />
      <BottomNav />
    </>
  );
}
