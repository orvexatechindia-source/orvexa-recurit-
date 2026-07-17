import React from 'react';
import { Cpu, Layers, GitBranch, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@orvexa/ui';

export const MarketingFeatures: React.FC = () => {
  const features = [
    {
      title: 'Gemini AI Engines',
      description: 'Automatically parse uploaded candidate resumes, extract matching skills, and generate fit score reviews in seconds.',
      icon: Cpu,
    },
    {
      title: 'Strict Tenant Isolation',
      description: 'Logical scoping ensures every company database, user, and candidate record is completely locked under tenant boundaries.',
      icon: Layers,
    },
    {
      title: 'Visual Pipeline Boards',
      description: 'Track and transition candidate applicants between screening stages using drag-and-drop Kanban panels.',
      icon: GitBranch,
    },
    {
      title: 'PII Encryption & GDPR',
      description: 'Encrypt candidate emails, numbers, and salaries at rest and purge records dynamically for data deletion compliance.',
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0B1220] border-t border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Built for Global Enterprise Recruitment
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Automating candidate tracking loops, scheduling, feedback reviews, and billing operations on a unified secure platform.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] hover:shadow-md transition-all duration-200 bg-[#F0F5FA]/30 dark:bg-transparent">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-lg bg-[#2563EB]/10 dark:bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB] dark:text-cyan-400 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
