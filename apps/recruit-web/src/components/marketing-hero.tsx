"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@orvexa/ui';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Star } from 'lucide-react';

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
    id: 'e-sign',
    label: 'E-Sign Offers',
    title: 'Secure Contract Acceptance & Hand-drawn E-Signatures',
    description: 'Extend formal offers with dynamic cursive or mouse-drawn signature canvases. Legally binding agreement checkboxes simplify offer contracts without third-party integrations.',
    mockup: {
      type: 'esign',
      name: 'Sarah Jenkins',
      date: 'July 17, 2026',
    }
  }
];

export const MarketingHero: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ai-parser');
  const [hiringAs, setHiringAs] = useState('Corporate HR Team');
  const [emailInput, setEmailInput] = useState('');
  const [agreeCheck, setAgreeCheck] = useState(false);

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeCheck) {
      alert("Please agree to our Terms of Service and Privacy Policy.");
      return;
    }
    router.push(`/register?email=${encodeURIComponent(emailInput)}&hiringAs=${hiringAs}`);
  };

  return (
    <div className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1220] transition-colors duration-200 text-slate-900 dark:text-slate-200">
      {/* Background abstract radial decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-10">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#2563EB] blur-[150px]" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] blur-[120px]" />
      </div>

      {/* Public Header/Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 h-24 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Orvexa <span className="text-[#2563EB] dark:text-cyan-400">Recruit</span>
          </h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-white transition-all cursor-pointer bg-transparent border-0"
          >
            Log In
          </button>
          <Button 
            onClick={() => router.push('/register')} 
            className="rounded-full bg-[#2563EB] hover:bg-blue-700 text-white border-0 font-bold px-6 h-11 cursor-pointer"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Body Content */}
      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 sm:pt-16 sm:pb-24 flex flex-col lg:flex-row items-center gap-16 z-10">
        
        {/* Slogans & Booking Form */}
        <div className="flex-1 space-y-6 max-w-2xl text-left">
          <div className="inline-flex items-center space-x-2 bg-[#2563EB]/10 dark:bg-[#2563EB]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#2563EB] dark:text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-POWERED APPLICANT TRACKING & ATS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.1] font-serif">
            Hire the best talent. Scale your team.
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            The modern applicant tracking system and candidate relationship CRM built for high-growth corporate HR teams and staffing agencies.
          </p>

          {/* Lead conversion card */}
          <form onSubmit={handleSignupSubmit} className="bg-white dark:bg-[#111827] p-6 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md space-y-4 max-w-lg w-full">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Start your 90-day free trial</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">I am a</label>
                <select
                  value={hiringAs}
                  onChange={(e) => setHiringAs(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Corporate HR Team">Corporate HR Team</option>
                  <option value="Staffing Agency">Staffing Agency</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeCheck}
                  onChange={(e) => setAgreeCheck(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-[9px] text-slate-400 leading-tight select-none">
                  I agree to the Terms of Service and Privacy Policy. All recruiter and candidate data is protected under logical isolation standards.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-11 text-xs rounded-lg cursor-pointer flex items-center justify-center border-0"
              >
                Start Free Trial
              </Button>
              <button
                type="button"
                onClick={() => window.location.href = 'mailto:sales@orvexarecruit.com?subject=Book a Demo Request - Orvexa Recruit'}
                className="w-full sm:w-auto px-6 h-11 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center text-slate-800 dark:text-slate-200 bg-transparent"
              >
                Request Demo
              </button>
            </div>
          </form>
        </div>

        {/* Visual Mockup - Interactive Tabs Display */}
        <div className="flex-1 w-full max-w-xl relative">
          {/* Tabs header */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative min-h-[380px] flex flex-col justify-between">
            {/* Dynamic display block */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
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
                      <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-slate-850 flex items-center justify-center font-bold text-[#2563EB]">
                        S
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{currentTab.mockup.name}</h5>
                        <p className="text-[10px] text-slate-400">{currentTab.mockup.title}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      94% AI Match
                    </span>
                  </div>
                  
                  {/* Extracted skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {['TypeScript', 'Next.js', 'PostgreSQL', 'AWS', 'Docker'].map((s, idx) => (
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
                      <span className="text-xl font-extrabold text-[#2563EB] dark:text-cyan-400 block my-1">{col.count}</span>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-medium">{col.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Renders E-Sign Offer mockup */}
              {currentTab.mockup.type === 'esign' && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-blue-50/30 dark:bg-blue-955/10 border border-blue-150 dark:border-blue-900/40 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      <span>Offer Contract: {currentTab.mockup.name}</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase font-bold">Signed & Accepted</span>
                    </div>
                    <div className="mt-2 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl flex items-center justify-center">
                      <span className="font-serif italic text-xl text-slate-750 dark:text-slate-300 font-medium tracking-wide select-none" style={{ fontFamily: 'Georgia, cursive' }}>
                        {currentTab.mockup.name}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 text-center">Verified signature on {currentTab.mockup.date}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions info */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Dynamic workspace preview</span>
              <button 
                onClick={() => router.push('/register')}
                className="font-bold text-[#2563EB] hover:underline flex items-center space-x-1 cursor-pointer bg-transparent border-0"
              >
                <span>Try this feature</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Trust Metrics ratings grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/50 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="p-5 bg-white dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800 rounded-2xl flex flex-col justify-between items-center h-full">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">G2 Crowd 2026</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white my-2.5">High Performer</span>
          <div className="flex items-center space-x-1">
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">4.8</span>
            <div className="flex text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /></div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800 rounded-2xl flex flex-col justify-between items-center h-full">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Capterra 2026</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white my-2.5">Shortlist Leader</span>
          <div className="flex items-center space-x-1">
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">4.7</span>
            <div className="flex text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /></div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-850 rounded-2xl flex flex-col justify-between items-center h-full">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Software Advice 2026</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white my-2.5">Front Runners</span>
          <div className="flex items-center space-x-1">
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">4.6</span>
            <div className="flex text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /></div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800 rounded-2xl flex flex-col justify-between items-center h-full">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">GetApp 2026</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white my-2.5">Category Leader</span>
          <div className="flex items-center space-x-1">
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">4.9</span>
            <div className="flex text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};
