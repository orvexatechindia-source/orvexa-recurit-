"use client";

import React, { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if user session is not authenticated after loading completes
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA] dark:bg-[#0B1220] transition-colors duration-200">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading Orvexa...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering dashboard shell elements during redirection
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F5FA] dark:bg-[#0B1220] transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
