"use client";

import React, { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-[#F0F5FA] dark:bg-[#0B1220] transition-colors duration-200 font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar className="hidden lg:flex" />

      {/* Sidebar - Mobile drawer backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Mobile drawer slide-out */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0B1220] z-50 transform transition-transform duration-300 ease-in-out lg:hidden border-r border-slate-200 dark:border-slate-800 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Close button inside mobile sidebar header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h2 className="text-base font-bold tracking-tight text-[#0B1220] dark:text-white font-display">
              Orvexa <span className="text-[#2563EB]">Recruit</span>
            </h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar className="w-full border-r-0" onItemClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

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
