"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { GitBranch, MapPin, User, ChevronRight, ChevronLeft, Award, X, FileText, Download, CheckCircle2, AlertTriangle, HelpCircle, Calendar, Video } from 'lucide-react';

interface Job {
  id: string;
  title: string;
}

interface Interview {
  id: string;
  startTime: string;
  endTime: string;
  meetingUrl?: string;
  status: string;
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
}

interface Review {
  id: string;
  rating: number;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  notes: string;
  createdAt: string;
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
}

interface Application {
  id: string;
  status: string;
  matchScore?: number;
  fitExplanation?: string;
  suggestedQuestions: string[];
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    skills: string[];
    summary?: string;
    customValues?: {
      id: string;
      value: string;
      field: {
        fieldName: string;
        fieldType: string;
      };
    }[];
  };
  job: {
    title: string;
    description: string;
    customValues?: {
      id: string;
      value: string;
      field: {
        fieldName: string;
        fieldType: string;
      };
    }[];
  };
  interviews?: Interview[];
  reviews?: Review[];
  offerLetter?: string;
  offerStatus?: string;
  signedAt?: string;
  signature?: string;
}

const STAGES = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SCREENING', label: 'Screening' },
  { key: 'INTERVIEWING', label: 'Interviewing' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'HIRED', label: 'Hired' },
  { key: 'REJECTED', label: 'Rejected / Archived' }
];

export default function PipelinePage() {
  const { accessToken, tenantId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Candidate Details Drawer states
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // AI Question Generator states
  const [focusTopic, setFocusTopic] = useState('');
  const [customAiQuestions, setCustomAiQuestions] = useState<string[]>([]);
  const [loadingAiQuestions, setLoadingAiQuestions] = useState(false);

  // Phase 8: Interviewer Team state
  const [team, setTeam] = useState<any[]>([]);
  const [interviewerId, setInterviewerId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Phase 9: Candidate Scorecard states
  const [rating, setRating] = useState<number>(5);
  const [recommendation, setRecommendation] = useState<'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE'>('HIRE');
  const [notes, setNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Phase 14: Offer extensions states
  const [offerLetter, setOfferLetter] = useState('');
  const [extendingOffer, setExtendingOffer] = useState(false);

  // 1. Fetch Tenant Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch('http://localhost:4000/api/v1/jobs', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Tenant-ID': tenantId || '',
          },
        });
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setJobs(result.data);
          setSelectedJobId(result.data[0].id); // Auto-select first job
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (accessToken) {
      fetchJobs();
    }
  }, [accessToken, tenantId]);

  // 2. Fetch Applications for Selected Job
  const fetchApplications = async (silent = false) => {
    if (!selectedJobId) return;
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/applications?jobId=${selectedJobId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(false);

    const interval = setInterval(() => {
      fetchApplications(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedJobId, accessToken, tenantId]);

  // 3. Fetch Team Members (Interviewers) for Dropdowns
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/interviews/team', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Tenant-ID': tenantId || '',
          },
        });
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setTeam(result.data);
          setInterviewerId(result.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (accessToken) {
      fetchTeam();
    }
  }, [accessToken, tenantId]);

  // 4. Fetch Single Application details for Drawer
  const loadApplicationDetails = async (appId: string) => {
    setLoadingDetails(true);
    setSelectedAppId(appId);
    setFocusTopic('');
    setCustomAiQuestions([]);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/applications/${appId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setSelectedApp(result.data);
        if (!result.data.offerLetter) {
          setOfferLetter(
            `Dear ${result.data.candidate.firstName} ${result.data.candidate.lastName},\n\nWe are pleased to offer you the position of "${result.data.job.title}" with Orvexatech. We were impressed by your skills and look forward to welcoming you to the team.\n\nSalary: $85,000 / year\nStart Date: August 1, 2026\n\nBest regards,\nRecruitment Team`
          );
        } else {
          setOfferLetter(result.data.offerLetter);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Extend Job Offer letter handler (Phase 14)
  const handleExtendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !offerLetter.trim()) return;
    setExtendingOffer(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/candidate-portal/recruiter/extend-offer/${selectedAppId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ offerLetter }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Job offer letter has been extended to the applicant portal successfully.');
        loadApplicationDetails(selectedAppId);
        fetchApplications();
      } else {
        throw new Error(result.error?.message || 'Failed to extend offer letter.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExtendingOffer(false);
    }
  };

  // Generate Custom Interview Questions with Gemini
  const handleGenerateAiQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    setLoadingAiQuestions(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/applications/${selectedAppId}/ai-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ focusTopic: focusTopic || undefined }),
      });
      const result = await response.json();
      if (result.success) {
        setCustomAiQuestions(result.data);
      } else {
        alert(result.error?.message || 'Failed to generate prep questions.');
      }
    } catch (err: any) {
      alert('Communication error with AI questions module.');
    } finally {
      setLoadingAiQuestions(false);
    }
  };

  // 5. Schedule Interview submit handler
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !interviewerId || !startTime || !endTime) return;
    setSchedulingLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          applicationId: selectedAppId,
          interviewerId,
          startTime,
          endTime,
          meetingUrl: meetingUrl.trim() || undefined,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to schedule interview.');
      }
      
      // Reload Details and sync parent listings
      loadApplicationDetails(selectedAppId);
      fetchApplications();
      
      setStartTime('');
      setEndTime('');
      setMeetingUrl('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSchedulingLoading(false);
    }
  };

  // 6. Cancel Interview submit handler
  const handleCancelInterview = async (interviewId: string) => {
    if (!selectedAppId) return;
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      const response = await fetch(`http://localhost:4000/api/v1/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        loadApplicationDetails(selectedAppId);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Phase 9: Submit scorecard review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !notes.trim()) return;
    setSubmittingReview(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          applicationId: selectedAppId,
          rating,
          recommendation,
          notes: notes.trim(),
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit scorecard.');
      }

      loadApplicationDetails(selectedAppId);
      setNotes('');
      setRating(5);
      setRecommendation('HIRE');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // 7. HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('applicationId', id);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('applicationId');
    if (!id) return;

    const prevApps = [...applications];
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus } : app));

    try {
      const response = await fetch(`http://localhost:4000/api/v1/applications/${id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update pipeline stage.');
      }
      
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message);
      setApplications(prevApps);
    }
  };

  const transitionStage = async (id: string, currentStatus: string, direction: 'prev' | 'next') => {
    const currentIndex = STAGES.findIndex(s => s.key === currentStatus);
    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= STAGES.length) return;

    const newStatus = STAGES[targetIndex].key;
    const prevApps = [...applications];
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus } : app));

    try {
      const response = await fetch(`http://localhost:4000/api/v1/applications/${id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to transition stage.');
      }
      
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message);
      setApplications(prevApps);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display">Recruitment Pipeline</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Drag and drop candidates to manage interviews and screening loops.</p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Job:</span>
          {loadingJobs ? (
            <span className="text-sm text-slate-400">Loading vacancies...</span>
          ) : jobs.length === 0 ? (
            <span className="text-sm text-slate-400 italic">No vacancies found</span>
          ) : (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingJobs ? (
        <p className="text-center py-12 text-slate-500">Loading pipeline vacancies...</p>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2">
          <CardContent className="flex flex-col items-center">
            <GitBranch className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active jobs</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Please create and publish a job posting first to activate the recruitment pipeline board.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-thin">
          {STAGES.map((stage) => {
            const stageApps = applications.filter(app => app.status === stage.key);
            
            return (
              <div 
                key={stage.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage.key)}
                className="w-80 shrink-0 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 flex flex-col h-[600px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                    <span>{stage.label}</span>
                    <span className="h-5 w-5 bg-slate-200/60 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {stageApps.length}
                    </span>
                  </h3>
                </div>

                {/* Candidate stack list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onClick={() => loadApplicationDetails(app.id)}
                      className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm cursor-pointer hover:border-[#046bd2] transition-all group relative"
                    >
                      <div className="flex items-center space-x-2 mb-1.5">
                        <User className="h-4 w-4 text-slate-400" />
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                          {app.candidate.firstName} {app.candidate.lastName}
                        </h4>
                      </div>
                      
                      {/* Match rating badge */}
                      {app.matchScore !== undefined && app.matchScore !== null ? (
                        <div className="mb-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                            app.matchScore >= 80 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                              : app.matchScore >= 60
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
                          }`}>
                            {app.matchScore}% Match
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 truncate mb-2">{app.candidate.email}</p>
                      )}

                      {/* Small calendar notice if interview is scheduled */}
                      {app.interviews && app.interviews.length > 0 && (
                        <div className="flex items-center space-x-1.5 text-[10px] text-[#046bd2] dark:text-cyan-400 font-semibold mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>Interview Scheduled</span>
                        </div>
                      )}

                      {/* Card foot quick actions */}
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/60 pt-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => transitionStage(app.id, app.status, 'prev')}
                          className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                          disabled={stage.key === STAGES[0].key}
                          title="Move Left"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
                          <Award className="h-3 w-3 text-cyan-400" />
                          <span>Gemini Rated</span>
                        </span>

                        <button 
                          onClick={() => transitionStage(app.id, app.status, 'next')}
                          className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                          disabled={stage.key === STAGES[STAGES.length - 1].key}
                          title="Move Right"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {stageApps.length === 0 && (
                    <div className="h-20 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg flex items-center justify-center text-xs text-slate-400 italic">
                      Drag candidates here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Details Sliding Drawer Panel (Phase 7, 8 & 9) */}
      {selectedAppId && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => { setSelectedAppId(null); setSelectedApp(null); }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          />

          {/* Sliding panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#0B1220] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto z-50 transform transition-transform duration-300 p-6 space-y-6">
            
            {/* Header / Top controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-[#046bd2]" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Candidate Insights</span>
              </div>
              <button 
                onClick={() => { setSelectedAppId(null); setSelectedApp(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetails ? (
              <p className="text-center py-24 text-slate-500">Retrieving parsed profiles...</p>
            ) : !selectedApp ? (
              <p className="text-center py-24 text-red-500">Failed to load details.</p>
            ) : (
              <div className="space-y-6">
                
                {/* Profile Overview */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    {selectedApp.candidate.firstName} {selectedApp.candidate.lastName}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-slate-500 font-medium">
                    <span>{selectedApp.candidate.email}</span>
                    {selectedApp.candidate.phone && <span>{selectedApp.candidate.phone}</span>}
                    <span className="font-bold text-[#046bd2] uppercase tracking-wider">{selectedApp.status}</span>
                  </div>
                  
                  {/* Resume trigger button */}
                  {selectedApp.candidate.resumeUrl && (
                    <div className="pt-2">
                      <a
                        href={selectedApp.candidate.resumeUrl.startsWith('http') ? selectedApp.candidate.resumeUrl : `http://localhost:4000${selectedApp.candidate.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-[#046bd2] hover:text-[#035bb3] border border-blue-200 dark:border-blue-900/65 rounded-lg px-3 py-1.5 bg-blue-50/50 dark:bg-blue-950/10 hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Candidate Resume</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* AI Scorecard panel */}
                {selectedApp.matchScore !== undefined && selectedApp.matchScore !== null && (
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FAF6F0]/40 dark:bg-slate-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-cyan-400" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250 font-display">Gemini Fit Assessment</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        selectedApp.matchScore >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                          : selectedApp.matchScore >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
                      }`}>
                        {selectedApp.matchScore}% Match
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350">Strengths & Gap Details</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{selectedApp.fitExplanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parsed Summary & Skill badges */}
                {selectedApp.candidate.summary && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Professional Summary</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      "{selectedApp.candidate.summary}"
                    </p>
                  </div>
                )}

                {selectedApp.candidate.skills && selectedApp.candidate.skills.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Extracted Skills Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.candidate.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-medium border border-slate-200/50 dark:border-transparent">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidate Custom Properties (Phase 11) */}
                {selectedApp.candidate.customValues && selectedApp.candidate.customValues.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Workspace Metadata</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {selectedApp.candidate.customValues.map((v) => (
                        <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{v.field.fieldName}</span>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {v.field.fieldType === 'BOOLEAN'
                              ? (v.value === 'true' ? 'Yes / Enabled' : 'No / Disabled')
                              : v.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom interview questions (Gemini) */}
                {selectedApp.suggestedQuestions && selectedApp.suggestedQuestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="h-4.5 w-4.5 text-[#046bd2] dark:text-cyan-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Suggested Gap-Analysis Questions</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Gemini generated these specific questions to test this candidate's experience gaps:</p>
                    
                    <div className="space-y-3">
                      {selectedApp.suggestedQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="flex gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                          <span className="font-bold text-[#046bd2] dark:text-cyan-400 shrink-0">Q{qIdx + 1}:</span>
                          <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Gemini AI Prep Question Generator */}
                <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4.5 w-4.5 text-[#046bd2] dark:text-cyan-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">AI Interview Prep Co-Pilot</h4>
                  </div>

                  <form onSubmit={handleGenerateAiQuestions} className="p-4 bg-blue-50/10 dark:bg-blue-950/5 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-3 text-left">
                    <p className="text-xs text-slate-400 font-medium">
                      Generate tailored interview questions targeting specific topics or technologies.
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. AWS Lambda, System Design"
                        value={focusTopic}
                        onChange={(e) => setFocusTopic(e.target.value)}
                        className="flex-1 h-9 px-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2]"
                      />
                      <Button
                        type="submit"
                        disabled={loadingAiQuestions}
                        className="bg-[#046bd2] hover:bg-blue-600 text-white font-bold h-9 px-3 border-0 text-xs shrink-0"
                      >
                        {loadingAiQuestions ? 'Analyzing...' : 'Generate'}
                      </Button>
                    </div>
                  </form>

                  {customAiQuestions.length > 0 && (
                    <div className="space-y-3 mt-3 animate-fade-in">
                      {customAiQuestions.map((q, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2.5 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/5 text-xs text-left">
                          <div className="flex gap-2">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">AI Q{idx + 1}:</span>
                            <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{q}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(q);
                              alert('Question copied to clipboard.');
                            }}
                            className="text-slate-400 hover:text-[#046bd2] bg-transparent border-0 cursor-pointer shrink-0"
                            title="Copy to Clipboard"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phase 8: Interview Scheduler section */}
                <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4.5 w-4.5 text-[#046bd2] dark:text-cyan-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Interview Management</h4>
                  </div>

                  {/* Schedule Form */}
                  <form onSubmit={handleScheduleInterview} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Interviewer</label>
                        <select
                          value={interviewerId}
                          onChange={(e) => setInterviewerId(e.target.value)}
                          className="w-full h-9 px-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2]"
                        >
                          {team.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Meeting Link</label>
                        <input
                          type="text"
                          placeholder="Auto-generated if blank"
                          value={meetingUrl}
                          onChange={(e) => setMeetingUrl(e.target.value)}
                          className="w-full h-9 px-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full h-9 px-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">End Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full h-9 px-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={schedulingLoading || team.length === 0}
                      className="w-full bg-[#046bd2] hover:bg-[#035bb3] text-white text-xs h-9 font-bold"
                    >
                      {schedulingLoading ? 'Scheduling...' : 'Schedule Interview'}
                    </Button>
                  </form>

                  {/* Scheduled list */}
                  {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Slots</h5>
                      <div className="space-y-2">
                        {selectedApp.interviews.map((int) => (
                          <div key={int.id} className="p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white">
                                Interviewer: {int.interviewer.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {new Date(int.startTime).toLocaleString()} - {new Date(int.endTime).toLocaleTimeString()}
                              </div>
                              {int.meetingUrl && (
                                <a
                                  href={int.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-[#046bd2] hover:underline font-semibold flex items-center space-x-1"
                                >
                                  <Video className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[200px]">{int.meetingUrl}</span>
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => handleCancelInterview(int.id)}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase shrink-0 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded-md transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phase 9: Scorecard Form & Evaluation Logs */}
                <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4.5 w-4.5 text-[#E57A5D] fill-[#E57A5D]/20" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Evaluation & Reviews</h4>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmitReview} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Hiring Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Award 
                              className={`h-5 w-5 ${
                                star <= rating 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-slate-350 dark:text-slate-700'
                              } transition-all`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Hiring Recommendation</label>
                      <select
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value as any)}
                        className="w-full h-9 px-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="STRONG_HIRE">Strong Hire</option>
                        <option value="HIRE">Hire</option>
                        <option value="NO_HIRE">No Hire</option>
                        <option value="STRONG_NO_HIRE">Strong No Hire</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Feedback Evaluation Notes</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write detailed assessment feedback notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-[#E57A5D] hover:bg-[#d0674a] text-white text-xs h-9 font-bold"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Scorecard'}
                    </Button>
                  </form>

                  {/* Logs list */}
                  {selectedApp.reviews && selectedApp.reviews.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluation Logs</h5>
                      <div className="space-y-3">
                        {selectedApp.reviews.map((rev) => (
                          <div key={rev.id} className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{rev.interviewer.name}</span>
                                <span className="text-[10px] text-slate-400 ml-2">{new Date(rev.createdAt).toLocaleDateString()}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                                rev.recommendation.includes('HIRE') && !rev.recommendation.includes('NO_HIRE')
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
                              }`}>
                                {rev.recommendation.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="flex space-x-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Award
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= rev.rating 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-slate-200 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic mt-1.5">
                              "{rev.notes}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Offer Letter & Digital Signatures Management Module (Phase 14) */}
                <div className="space-y-4 pt-6 border-t border-slate-150 dark:border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4.5 w-4.5 text-[#2563EB]" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Job Offer Management</h4>
                  </div>
                  
                  {!selectedApp.offerStatus ? (
                    <form onSubmit={handleExtendOffer} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Draft Offer Letter Terms</label>
                        <textarea
                          required
                          rows={6}
                          value={offerLetter}
                          onChange={(e) => setOfferLetter(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={extendingOffer}
                        className="w-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs h-9 font-bold"
                      >
                        {extendingOffer ? 'Extending Job Offer...' : 'Extend Job Offer'}
                      </Button>
                    </form>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Offer Letter Extended</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                          selectedApp.offerStatus === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : selectedApp.offerStatus === 'DECLINED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {selectedApp.offerStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic leading-relaxed">
                        {selectedApp.offerStatus === 'ACCEPTED'
                          ? `Signed & accepted by candidate on ${selectedApp.signedAt ? new Date(selectedApp.signedAt).toLocaleDateString() : ''}`
                          : selectedApp.offerStatus === 'DECLINED'
                          ? 'Declined by candidate'
                          : 'Awaiting candidate response inside applicant portal'}
                      </p>
                      {selectedApp.offerStatus === 'ACCEPTED' && selectedApp.signature && (
                        <div className="mt-3 p-3 border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] rounded-xl flex flex-col items-center">
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold mb-1.5 font-display">Candidate Signature Record</span>
                          {selectedApp.signature.startsWith('data:image/') ? (
                            <img src={selectedApp.signature} alt="Candidate Signature" className="max-h-10 object-contain" />
                          ) : (
                            <span className="font-serif italic text-lg select-none text-slate-750 dark:text-slate-300" style={{ fontFamily: 'Georgia, cursive' }}>
                              {selectedApp.signature}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </>
      )}

    </DashboardLayout>
  );
}
