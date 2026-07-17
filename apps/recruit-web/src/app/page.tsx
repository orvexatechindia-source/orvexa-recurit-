"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { DashboardLayout } from '../components/dashboard-layout';
import { MarketingHero } from '../components/marketing-hero';
import { MarketingFeatures } from '../components/marketing-features';
import { MarketingPricing } from '../components/marketing-pricing';

export default function HomePage() {
  const { user, loading, accessToken, tenantId } = useAuth();
  const [jobsCount, setJobsCount] = useState<number>(0);
  const [candidatesCount, setCandidatesCount] = useState<number>(0);
  const [interviewsCount, setInterviewsCount] = useState<number>(0);

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
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA] dark:bg-[#0B1220] transition-colors duration-200">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show the Corporate Landing Page (par with iCIMS/Gusto/Zoho)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F0F5FA] dark:bg-[#0B1220]">
        <MarketingHero />
        <MarketingFeatures />
        <MarketingPricing />
        
        {/* Footer */}
        <footer className="bg-white dark:bg-[#0B1220] py-8 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <p>&copy; {new Date().getFullYear()} Orvexa Recruit. All rights reserved.</p>
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
