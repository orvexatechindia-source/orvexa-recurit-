"use client";

import React from 'react';
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
        {/* Notifications Icon (Placeholder) */}
        <button className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
          <Bell className="h-5 w-5" />
        </button>

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
