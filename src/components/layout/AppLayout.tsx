import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { useNotifications } from '@/hooks/useNotifications';

export const AppLayout: React.FC = () => {
  // Initialize notification monitoring
  useNotifications();

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <Header />
      <main className="flex-1 px-4 pb-24 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
