"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@orvexa/ui';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Check, Users, Kanban, Settings } from 'lucide-react';

const TABS = [
  {
    id: 'ai-parser',
    label: 'Gemini AI Parser',
    title: 'Automated Candidate Extraction & Scoring',
    description: 'Upload any resume PDF/DOCX and let Google Gemini AI instantly parse contact details, map skills, score alignment against job requirements, and generate tailored gap-analysis interview questions.',
    mockup: {
      type: 'ai',
      match: 94,
      name: 'Sarah Jenkins',
      title: 'Principal Full Stack Developer',
      skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'AWS', 'Docker'],
      questions: [
        'How do you manage complex DB schema migrations in team environments?',
        'Describe your experience configuring multi-tenant boundary middlewares.'
      ]
    }
  },
  {
    id: 'kanban',
    label: 'Kanban Pipelines',
    title: 'Visual Drag-and-Drop Hiring Pipelines',
    description: 'Track candidate progress with fluid Kanban columns mapped to recruitment milestones (Applied, Screening, Interview, Offer, Hired). Perform stage transitions instantly with auto-generated compliance audit trails.',
    mockup: {
      type: 'kanban',
      columns: [
        { label: 'Screening', count: 3, name: 'Alex Rivera' },
        { label: 'Interviewing', count: 1, name: 'Sarah Jenkins' },
        { label: 'Offer', count: 2, name: 'David Kim' }
      ]
    }
  },
  {
    id: 'compliance',
    label: 'Global Compliance',
    title: 'Strict Data Isolation & GDPR Sanitization',
    description: 'Run secure recruiting operations across international regions. Benefit from automated tenant isolation bounds, PII encryption at rest, and one-click compliance deletion tools for global privacy regulations.',
    mockup: {
      type: 'compliance',
      logs: [
        { action: 'ENCRYPT_PII', status: 'Secure', label: 'Candidate records encrypted' },
        { action: 'TENANT_CHECK', status: 'Passed', label: 'Logical query boundaries enforced' },
        { action: 'COMPLIANCE_PURGE', status: 'Ready', label: 'One-click candidate audit deletion' }
      ]
    }
  }
];

export const MarketingHero: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ai-parser');

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="relative overflow-hidden bg-[#FAF6F0] dark:bg-[#0B1220] transition-colors duration-200 text-[#2E2C2A] dark:text-slate-200">
      {/* Background abstract radial decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-10">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#046bd2] blur-[150px]" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#E57A5D] blur-[120px]" />
      </div>

      {/* Public Header/Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 h-24 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2C2A] dark:text-white font-display">
            Orvexa <span className="text-[#046bd2] dark:text-cyan-400">Recruit</span>
          </h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => router.push('/login')}
            className="text-sm font-bold text-[#2E2C2A] dark:text-slate-300 hover:text-[#046bd2] dark:hover:text-white transition-all"
          >
            Log In
          </button>
          <Button 
            onClick={() => router.push('/register')} 
            className="rounded-full bg-[#E57A5D] hover:bg-[#d0674a] text-white border-0 font-bold px-6 h-11"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Body Content */}
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 flex flex-col lg:flex-row items-center gap-16 z-10">
        
        {/* Slogans & Buttons */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-[#046bd2]/10 dark:bg-[#046bd2]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#046bd2] dark:text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-POWERED RECRUITING & TALENT MANAGEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2E2C2A] dark:text-white font-display leading-[1.1] font-serif">
            The all-in-one hiring platform for <span className="text-[#046bd2] dark:text-cyan-400">growing businesses.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            Orvexa Recruit helps you source, parse, rank, and hire the best talent globally. Integrate your pipelines, schedule interviews automatically, and ensure strict compliance in one unified system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Button 
              onClick={() => router.push('/register')} 
              size="lg" 
              className="w-full sm:w-auto rounded-full bg-[#046bd2] hover:bg-[#035bb3] text-white font-bold px-8 h-12 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.location.href = 'mailto:sales@orvexarecruit.com?subject=Book a Demo Request - Orvexa Recruit'}
              className="w-full sm:w-auto rounded-full border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-[#2E2C2A] dark:text-white font-bold px-8 h-12"
            >
              Book a Demo
            </Button>
          </div>

          {/* Compliance features badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-8 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#046bd2] dark:text-cyan-400" />
              <span>GDPR & PII Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-[#046bd2] dark:text-cyan-400" />
              <span>Gemini 1.5 Pro Matching</span>
            </div>
          </div>
        </div>

        {/* Visual Mockup - Interactive Tabs Display (like Gusto's product tour) */}
        <div className="flex-1 w-full max-w-xl relative">
          {/* Tabs header */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-[#046bd2] text-white border-[#046bd2] shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative min-h-[380px] flex flex-col justify-between">
            {/* Dynamic display block */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#2E2C2A] dark:text-white font-display">
                {currentTab.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentTab.description}
              </p>

              {/* Renders AI parser card mockup */}
              {currentTab.mockup.type === 'ai' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-[#046bd2]/10 flex items-center justify-center font-bold text-[#046bd2]">
                        {currentTab.mockup.name?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{currentTab.mockup.name}</h5>
                        <p className="text-[10px] text-slate-400">{currentTab.mockup.title}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      {currentTab.mockup.match}% AI Match
                    </span>
                  </div>
                  
                  {/* Extracted skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {currentTab.mockup.skills?.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Renders Kanban Columns mockups */}
              {currentTab.mockup.type === 'kanban' && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {currentTab.mockup.columns?.map((col, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 rounded-xl p-3 text-center">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{col.label}</h5>
                      <span className="text-xl font-extrabold text-[#046bd2] dark:text-cyan-400 block my-1">{col.count}</span>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-medium">{col.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Renders Compliance checklists */}
              {currentTab.mockup.type === 'compliance' && (
                <div className="space-y-2 pt-2">
                  {currentTab.mockup.logs?.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-[11px]">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{log.label}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{log.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions info */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Dynamic workspace preview</span>
              <button 
                onClick={() => router.push('/register')}
                className="font-bold text-[#046bd2] hover:underline flex items-center space-x-1"
              >
                <span>Try this feature</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
