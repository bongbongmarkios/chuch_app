'use client';

import BottomNavigationBar from '@/components/layout/BottomNavigationBar';
import { Toaster } from '@/components/ui/toaster';
import { ActivityProvider } from '@/hooks/useActivityTracker';
import { UpdateNotification } from '@/components/UpdateNotification';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActivityProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex-grow pb-20 relative">
          <div className="w-full">
            {children}
          </div>
        </div>
        <BottomNavigationBar />
      </div>
      <Toaster />
      <UpdateNotification position="top-right" autoHide={true} autoHideDelay={10000} />
    </ActivityProvider>
  );
}
