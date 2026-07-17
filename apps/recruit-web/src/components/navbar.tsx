"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useTheme } from './theme-provider';
import { Sun, Moon, LogOut, Bell, Menu } from 'lucide-react';
import { Button } from '@orvexa/ui';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, companyName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Job Application', body: 'Siva Sridharan applied for Senior Node Developer', time: '2 mins ago', read: false },
    { id: 2, title: 'AI Parsing Completed', body: 'Gemini CV Parser completed analysis for Siva Sridharan (Fit Score: 85%)', time: '5 mins ago', read: false },
    { id: 3, title: 'Workspace Upgraded', body: 'Workspace billing upgraded to Pro Plan successfully.', time: '1 hour ago', read: false },
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] flex items-center justify-between px-6 sticky top-0 z-30 font-sans">
      <div className="flex items-center space-x-4">
        {/* Mobile sandwich hamburger bar */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search / Org Breadcrumbs */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Workspace:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            {companyName || 'Recruit'}
          </span>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              if (!notificationsOpen) markAllRead();
            }}
            className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all relative"
            aria-label="View Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0B1220]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xl z-50 overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
                <span className="font-bold text-slate-900 dark:text-white font-display">System Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-955/30 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all space-y-1 text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {notif.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Profile info / Log Out */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="h-9 px-3 flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Log Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
