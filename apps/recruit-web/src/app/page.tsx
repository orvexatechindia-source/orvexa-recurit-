"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { DashboardLayout } from '../components/dashboard-layout';
import { MarketingHero } from '../components/marketing-hero';
import { MarketingFeatures } from '../components/marketing-features';
import { MarketingPricing } from '../components/marketing-pricing';

export default function HomePage() {
  const { user, loading, accessToken, tenantId } = useAuth();
  const router = useRouter();
  const [jobsCount, setJobsCount] = useState<number>(0);
  const [candidatesCount, setCandidatesCount] = useState<number>(0);
  const [interviewsCount, setInterviewsCount] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user && user.role === 'SUPER_ADMIN') {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    if (!accessToken) return;
    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Tenant-ID': tenantId || '',
      };

      const jobsRes = await fetch('http://localhost:4000/api/v1/jobs', { headers });
      const jobsResult = await jobsRes.json();
      if (jobsResult.success) {
        setJobsCount(jobsResult.data.length);
      }

      const candidatesRes = await fetch('http://localhost:4000/api/v1/candidates', { headers });
      const candidatesResult = await candidatesRes.json();
      if (candidatesResult.success) {
        setCandidatesCount(candidatesResult.data.length);
      }

      const interviewsRes = await fetch('http://localhost:4000/api/v1/interviews', { headers });
      const interviewsResult = await interviewsRes.json();
      if (interviewsResult.success) {
        setInterviewsCount(interviewsResult.data.length);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  useEffect(() => {
    if (accessToken && user) {
      fetchStats();
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [accessToken, user, tenantId]);

  // If loading session, show loading spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1220] transition-colors duration-200">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const FAQS = [
    {
      q: "What is Orvexa Recruit?",
      a: "Orvexa Recruit is a cloud-based hiring platform that gives HR teams and recruitment agencies the digital tools needed to fill roles quickly and efficiently. It's free to try, and it requires no local database configuration or software downloads. From parsing candidates with Google Gemini AI to extending secure, electronically signed offer letters, Orvexa helps you manage your entire talent pipeline from a single app."
    },
    {
      q: "What's the difference between an ATS and a recruitment CRM?",
      a: "An Applicant Tracking System (ATS) manages candidate applications throughout the hiring process. A recruitment CRM is candidate-centric, helping recruiters build and nurture talent pools for future roles. Orvexa Recruit combines both functionalities, giving you an end-to-end CRM-ATS loop."
    },
    {
      q: "Why do I need hiring software for recruitment?",
      a: "Recruiting manually with spreadsheets and emails leads to slow response times, lost candidate data, and compliance risks. Hiring software automates candidate pipelines, schedules panel interviews, records audit logs, and handles secure digital contract signatures instantly."
    },
    {
      q: "What makes Orvexa Recruit stand out from other service providers?",
      a: "Unlike legacy platforms that rely on outdated keyword filters, Orvexa Recruit features native Google Gemini AI parsing to score candidates semantically. Additionally, Orvexa offers built-in hand-drawn e-signatures, strict multi-tenant boundary isolation, and instant custom careers pages out of the box."
    }
  ];

  // If user is NOT logged in, show the Corporate Landing Page (par with iCIMS/Gusto/Zoho)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] transition-colors duration-200">
        <MarketingHero />
        <MarketingFeatures />
        <MarketingPricing />
        
        {/* Dynamic Accordion FAQ Section */}
        <section className="py-20 bg-white dark:bg-[#0B1220] border-t border-slate-200/50 dark:border-slate-800/60 transition-colors duration-200">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-slate-900 dark:text-white font-display mb-12">
              Frequently asked questions
            </h2>
            
            <div className="space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 text-sm py-3 focus:outline-none cursor-pointer bg-transparent border-0"
                    >
                      <span>{faq.q}</span>
                      <span className="text-slate-400 text-lg">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 pl-1 whitespace-pre-line">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Corporate Detailed Footer */}
        <footer className="bg-slate-50 dark:bg-slate-950 py-16 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-850/60 transition-colors">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3.5 text-left">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Orvexa Recruit</h3>
              <p className="leading-relaxed">All-in-one recruitment and talent acquisition CRM-ATS software mapped for high-growth corporate teams and staffing agencies.</p>
              <p className="text-[10px] font-bold text-slate-500">support@orvexarecruit.com</p>
            </div>
            
            <div className="space-y-3 text-left">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Integrations</h4>
              <ul className="space-y-2 text-slate-500">
                <li>Slack Integration</li>
                <li>LinkedIn XML Sync</li>
                <li>Google Calendar sync</li>
                <li>Microsoft Teams Hub</li>
              </ul>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Compliance</h4>
              <ul className="space-y-2 text-slate-500">
                <li>GDPR Readiness</li>
                <li>Data Isolation bounds</li>
                <li>PII Encryption protocols</li>
                <li>Audit trail logging</li>
              </ul>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Quick Links</h4>
              <ul className="space-y-2 text-slate-500">
                <li>Anti-spam policy</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Cookie Policies</li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 border-t border-slate-200/50 dark:border-slate-800/40 pt-8 text-center flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Orvexa Recruit. All Rights Reserved. Choose Privacy.</p>
            <div className="flex justify-center space-x-4">
              <span>Security</span>
              <span>•</span>
              <span>Anti-Spam</span>
              <span>•</span>
              <span>GDPR</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // If user IS logged in, render the internal Recruiter Dashboard
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Recruitment Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome to your talent acquisition command center.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
          <CardHeader>
            <CardTitle className="text-[#1E293B] dark:text-white">Active Jobs</CardTitle>
            <CardDescription className="text-slate-400 dark:text-slate-500">Job listings currently receiving applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-[#046bd2] dark:text-cyan-400 font-display">{jobsCount}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Manage listings under the Jobs panel</p>
          </CardContent>
        </Card>
 
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
          <CardHeader>
            <CardTitle className="text-[#1E293B] dark:text-white">Candidates</CardTitle>
            <CardDescription className="text-slate-400 dark:text-slate-500">Total parsed and tracked applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-cyan-500 dark:text-cyan-400 font-display">{candidatesCount}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Audits profiles under the Candidates tab</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
          <CardHeader>
            <CardTitle className="text-[#1E293B] dark:text-white">Interviews Scheduled</CardTitle>
            <CardDescription className="text-slate-400 dark:text-slate-500">Interviews scheduled for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white font-display">{interviewsCount}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Configure scheduling blocks in Phase 8</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <section className="mt-12">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-display mb-4">Core Systems Status</h3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Multi-Tenant Isolation Database</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scoped database connection via Prisma Client</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Google Gemini API integration</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI parsing, scoring, and questions service module</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                Active (API Key loaded)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Hostinger Domain integration</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Subdomain registration and DNS verification service</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                Ready (API Key loaded)
              </span>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
