"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { LogOut, Calendar, Link2, FileText, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Users } from 'lucide-react';

interface Interview {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  virtualLink?: string;
}

interface Application {
  id: string;
  status: string; // "APPLIED" | "SCREENED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED"
  createdAt: string;
  offerLetter?: string;
  offerStatus?: string; // "EXTENDED" | "ACCEPTED" | "DECLINED"
  signedAt?: string;
  job: {
    id: string;
    title: string;
    location: string;
  };
  interviews: Interview[];
}

const STAGE_STEPS = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SCREENED', label: 'Screened' },
  { key: 'INTERVIEW', label: 'Interviewing' },
  { key: 'OFFER', label: 'Offer Extended' },
  { key: 'HIRED', label: 'Hired' },
];

export default function CandidateDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateEmail, setCandidateEmail] = useState('');

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('candidateToken');
    if (!token) {
      router.push(`/careers/${domain}/portal/login`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/candidate-portal/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      });
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch application statuses.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('candidateEmail');
    if (email) setCandidateEmail(email);
    fetchDashboardData();
  }, [domain]);

  const handleLogout = () => {
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('candidateEmail');
    router.push(`/careers/${domain}/portal/login`);
  };

  const handleOfferResponse = async (appId: string, status: 'ACCEPTED' | 'DECLINED') => {
    const token = localStorage.getItem('candidateToken');
    if (!token) return;

    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this offer letter?`)) return;

    try {
      const response = await fetch(`http://localhost:4000/api/v1/candidate-portal/applications/${appId}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
      } else {
        throw new Error(result.error?.message || 'Failed to process offer response.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getActiveStageIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    return STAGE_STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-[#0B1220] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Applicant Progress Portal</h2>
            <p className="text-xs text-slate-400">Signed in as <span className="font-bold text-slate-900 dark:text-slate-350">{candidateEmail}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-center py-16">Loading application dashboard...</p>
        ) : applications.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-2">
            <CardContent className="flex flex-col items-center">
              <Users className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active applications found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">Make sure you used the correct email address linked to your job application.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {applications.map((app) => {
              const activeIndex = getActiveStageIndex(app.status);
              const isRejected = app.status === 'REJECTED';

              return (
                <Card key={app.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white font-display">{app.job.title}</CardTitle>
                      <CardDescription className="text-xs">Location: {app.job.location} | Submitted on: {new Date(app.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    {isRejected && (
                      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/20 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 shrink-0 self-start sm:self-auto">
                        Application Declined
                      </span>
                    )}
                  </CardHeader>

                  <CardContent className="p-6 space-y-8 text-xs">
                    
                    {/* Stepper Pipeline Status Timeline Tracker (iCIMS Style) */}
                    {!isRejected && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hiring Pipeline Progress</h4>
                        
                        <div className="relative flex items-center justify-between">
                          {/* Background connecting progress line */}
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                          <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#2563EB] z-0 transition-all duration-500" 
                            style={{ width: `${(Math.max(0, activeIndex) / (STAGE_STEPS.length - 1)) * 100}%` }}
                          />

                          {STAGE_STEPS.map((step, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isActive = idx === activeIndex;

                            return (
                              <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isCompleted
                                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                    : 'bg-white dark:bg-[#111827] border-slate-300 dark:border-slate-700 text-slate-400'
                                } ${isActive ? 'ring-4 ring-blue-100 dark:ring-blue-950' : ''}`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4.5 w-4.5" />
                                  ) : (
                                    <span className="text-xs font-bold">{idx + 1}</span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-bold mt-2 whitespace-nowrap hidden sm:block ${
                                  isCompleted ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interview Schedulers joining widget */}
                    {app.interviews && app.interviews.length > 0 && (
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Interview Inivitations</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {app.interviews.map((slot) => (
                            <div key={slot.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                                  <Calendar className="h-3.5 w-3.5 text-[#2563EB]" />
                                  <span>{slot.title}</span>
                                </div>
                                <p className="text-[10px] text-slate-450">
                                  {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleTimeString()}
                                </p>
                              </div>

                              {slot.virtualLink && (
                                <a
                                  href={slot.virtualLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                                >
                                  <Link2 className="h-3 w-3" />
                                  <span>Join Meeting</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Offer letter signing interface */}
                    {app.offerStatus === 'EXTENDED' && app.offerLetter && (
                      <div className="pt-6 border-t border-[#2563EB]/20 space-y-4">
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-[#2563EB]" />
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">Offer Letter Extended!</h5>
                            <p className="text-[10px] text-slate-500">Please review the extended job offer contract terms below and respond.</p>
                          </div>
                        </div>

                        {/* Parchment-style container for offer letter */}
                        <div className="p-6 bg-amber-50/20 dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-300 max-h-[300px] overflow-y-auto whitespace-pre-line shadow-inner">
                          {app.offerLetter}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            onClick={() => handleOfferResponse(app.id, 'DECLINED')}
                            className="inline-flex items-center space-x-1 border border-red-200 text-red-650 hover:bg-red-50 px-4 py-2 rounded-lg font-bold"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Decline Offer</span>
                          </button>
                          
                          <button
                            onClick={() => handleOfferResponse(app.id, 'ACCEPTED')}
                            className="inline-flex items-center space-x-1 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            <span>Accept & Sign Offer</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Signed Offer Confirmation status */}
                    {app.offerStatus && app.offerStatus !== 'EXTENDED' && (
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-center py-6 bg-slate-50/30 dark:bg-slate-900/10 rounded-xl">
                        {app.offerStatus === 'ACCEPTED' ? (
                          <div className="inline-flex flex-col items-center space-y-2">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            <h4 className="font-bold text-slate-900 dark:text-white">Offer Signed & Accepted!</h4>
                            <p className="text-slate-400 max-w-sm mx-auto">You accepted this offer on {app.signedAt ? new Date(app.signedAt).toLocaleDateString() : ''}. The recruitment team will reach out with onboarding materials.</p>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center space-y-2">
                            <XCircle className="h-10 w-10 text-red-500" />
                            <h4 className="font-bold text-slate-900 dark:text-white">Offer Declined</h4>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">You declined the extended terms of the job offer letter.</p>
                          </div>
                        )}
                      </div>
                    )}

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
