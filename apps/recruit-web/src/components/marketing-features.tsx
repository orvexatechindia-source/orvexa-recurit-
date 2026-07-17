"use client";

import React from 'react';
import { Cpu, Mail, Users, Star, Plus, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@orvexa/ui';

export const MarketingFeatures: React.FC = () => {
  const integrations = [
    { name: 'Google Meet', desc: 'Auto-generate interview slots and sync room invitations.' },
    { name: 'Microsoft Teams', desc: 'Join virtual pipeline calls instantly.' },
    { name: 'Slack', desc: 'Notify recruiters on dynamic candidate signups.' },
    { name: 'LinkedIn', desc: 'Source professional CVs with one click.' },
    { name: 'Intuit Mailchimp', desc: 'Sync newsletters to active candidate talent pools.' },
    { name: 'Calendly', desc: 'Provide self-scheduling options to applicants.' },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0B1220] border-t border-b border-slate-200/50 dark:border-slate-800/60 transition-colors duration-200 space-y-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Brand logo cloud banner */}
        <div className="text-center space-y-6 mb-16">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Over 800,000 recruiters build premium teams with Orvexa
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50 dark:opacity-40 select-none">
            <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">Stellantis</span>
            <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">Bosch</span>
            <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">Deloitte</span>
            <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">SriLankan Airlines</span>
            <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">VinFast</span>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800/50 mb-16" />

        {/* Meet Gemini AI Assistant */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-[#2563EB]/10 px-3 py-1 rounded-full text-xs font-bold text-[#2563EB]">
              <Cpu className="h-4 w-4" />
              <span>Meet Gemini</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-[1.1] font-serif">
              An AI hiring assistant at every step.
            </h2>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Crafting job descriptions, parsing resume packets, drafting follow-up emails, or shortlisting candidates based on fit analysis; there’s native Gemini AI assistance mapped to every segment of the pipeline.
            </p>

            <ul className="space-y-3.5 text-xs text-slate-650 dark:text-slate-350">
              <li className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-[#2563EB] mt-0.5 shrink-0" />
                <span>**Semantic Scoring**: Extract candidate suitability scores without depending on keyword hacks.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-[#2563EB] mt-0.5 shrink-0" />
                <span>**Smart Job Descriptors**: Generate attractive job outlines in a split-second.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-[#2563EB] mt-0.5 shrink-0" />
                <span>**Interview Prep Guides**: Auto-draft custom, capability-based questions for recruiter admins.</span>
              </li>
            </ul>
          </div>

          {/* Holistic Hiring Experience Metrics */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <span className="text-4xl font-extrabold text-[#2563EB] font-display">2X</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Lesser cost of hire</h4>
              <p className="text-[10px] text-slate-400">Save hours of manual resume vetting costs.</p>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <span className="text-4xl font-extrabold text-[#2563EB] font-display">3X</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Faster time to hire</h4>
              <p className="text-[10px] text-slate-400">Move candidates through pipeline stages instantly.</p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <span className="text-4xl font-extrabold text-[#2563EB] font-display">7X</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Application rates</h4>
              <p className="text-[10px] text-slate-400">Public subdomain listing increases coverage.</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800/50 my-16" />

        {/* Integrations Module */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              We like building teams together
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Orvexa Recruit comes integrated out-of-the-box with applications your organization uses on the daily.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((app, idx) => (
              <div 
                key={idx} 
                className="p-5 border border-slate-200 dark:border-slate-800/80 bg-slate-50/20 dark:bg-[#111827]/10 rounded-2xl flex items-start space-x-4 hover:border-[#2563EB] transition-all"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-[#2563EB] shrink-0">
                  {app.name[0]}
                </div>
                <div className="space-y-1 text-left min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{app.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal truncate">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
