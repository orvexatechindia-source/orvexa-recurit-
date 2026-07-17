"use client";

import React from 'react';
import { useAuth } from '../context/auth-context';
import { 
  Briefcase, 
  Users, 
  Settings, 
  Layers, 
  Calendar, 
  FileText, 
  Shield, 
  LayoutDashboard,
  User,
  GitBranch
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onItemClick }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Define role-specific navigation menus
  const menuItems = {
    SUPER_ADMIN: [
      { label: 'System Admin', icon: Shield, path: '/admin' },
      { label: 'Organizations', icon: Layers, path: '/admin/tenants' },
    ],
    CLIENT_ADMIN: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Pipeline', icon: GitBranch, path: '/pipeline' },
      { label: 'Jobs', icon: Briefcase, path: '/jobs' },
      { label: 'Candidates', icon: Users, path: '/candidates' },
      { label: 'Team settings', icon: User, path: '/settings/team' },
      { label: 'Workspace settings', icon: Settings, path: '/settings' },
    ],
    RECRUITER: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Pipeline', icon: GitBranch, path: '/pipeline' },
      { label: 'Jobs', icon: Briefcase, path: '/jobs' },
      { label: 'Candidates', icon: Users, path: '/candidates' },
      { label: 'Interviews', icon: Calendar, path: '/interviews' },
    ],
    HIRING_MANAGER: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Pipeline', icon: GitBranch, path: '/pipeline' },
      { label: 'Candidates', icon: Users, path: '/candidates' },
      { label: 'Scorecards', icon: FileText, path: '/reviews' },
    ],
    CANDIDATE: [
      { label: 'My Applications', icon: Briefcase, path: '/' },
      { label: 'Profile settings', icon: User, path: '/profile' },
    ]
  };

  const activeRole = (user.role || 'CANDIDATE') as keyof typeof menuItems;
  const items = menuItems[activeRole] || menuItems.CANDIDATE;

  return (
    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 bg-card flex flex-col h-full ${className}`}>
      {/* Brand Header */}
      <div className="h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800 hidden lg:flex">
        <h2 className="text-lg font-bold tracking-tight text-[#0B1220] dark:text-white font-display">
          Orvexa <span className="text-[#2563EB]">Recruit</span>
        </h2>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <a
              key={idx}
              href={item.path}
              onClick={onItemClick}
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#2563EB] dark:hover:text-[#06B6D4] transition-all group"
            >
              <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-[#2563EB] dark:group-hover:text-[#06B6D4] transition-all" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer / Tenant Metadata */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#2563EB]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
