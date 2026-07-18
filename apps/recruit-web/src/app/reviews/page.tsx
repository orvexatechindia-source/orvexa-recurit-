"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { 
  FileText, 
  Star, 
  MessageSquare, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  X, 
  Award, 
  AlertCircle 
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  notes: string;
  createdAt: string;
  interviewer: {
    name: string;
    email: string;
  };
  application: {
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
    };
    job: {
      title: string;
    };
  };
}

interface PendingEvaluation {
  id: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    title: string;
  };
}

export default function ReviewsPage() {
  const { accessToken, tenantId } = useAuth();
  
  // Data lists
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Scorecard Submission Drawer State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [targetAppId, setTargetAppId] = useState('');
  const [rating, setRating] = useState(3);
  const [recommendation, setRecommendation] = useState<'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE'>('HIRE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken, tenantId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'X-Tenant-ID': tenantId || '',
    };
    try {
      // 1. Fetch completed reviews
      const revRes = await fetch('http://localhost:4000/api/v1/reviews', { headers });
      const revData = await revRes.json();
      if (revData.success) setReviews(revData.data);

      // 2. Fetch pending evaluations (candidates in INTERVIEWING stage)
      const appRes = await fetch('http://localhost:4000/api/v1/applications', { headers });
      const appData = await appRes.json();
      if (appData.success) {
        // Filter applications in INTERVIEWING stage
        const interviewingApps = appData.data.filter((app: any) => app.status === 'INTERVIEWING');
        setPendingEvaluations(interviewingApps);
      }
    } catch (err: any) {
      setError('Failed to connect to the scorecard evaluation servers.');
    } finally {
      setLoading(false);
    }
  };

  // Submit new review scorecard
  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          applicationId: targetAppId,
          rating,
          recommendation,
          notes,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Scorecard submitted and registered to the candidate dossier.');
        setShowSubmitModal(false);
        // Reset fields
        setTargetAppId('');
        setRating(3);
        setRecommendation('HIRE');
        setNotes('');
        fetchData();
      } else {
        setError(result.error?.message || 'Failed to submit scorecard.');
      }
    } catch (err) {
      setError('Communication error with scorecard module.');
    }
  };

  // Statistics calculations
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? Math.round((reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews) * 10) / 10 
    : 0;

  const hireCount = reviews.filter(r => r.recommendation === 'HIRE' || r.recommendation === 'STRONG_HIRE').length;
  const hireRatio = totalReviews > 0 ? Math.round((hireCount / totalReviews) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Candidate Scorecards & Reviews
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Audit interview evaluations, ratings, and hiring recommendations.
            </p>
          </div>
        </div>

        {/* Action Banners */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center space-x-2 text-sm text-red-700 dark:text-red-400">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center space-x-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Analytical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Reviews</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalReviews}</h3>
            </div>
            <div className="h-10 w-10 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#2563EB]" />
            </div>
          </Card>
          
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center">
                {avgRating} <span className="text-xs text-amber-500 font-semibold ml-2">★ average</span>
              </h3>
            </div>
            <div className="h-10 w-10 bg-amber-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            </div>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hire Approval Ratio</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{hireRatio}%</h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-555" />
            </div>
          </Card>
        </div>

        {/* Main Work Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Completed Evaluations list */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                <CardTitle className="text-sm font-bold text-slate-950 dark:text-white">Evaluation Scorecards</CardTitle>
                <CardDescription>Comprehensive feedback records from completed technical screening loops</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                {reviews.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    No scorecard evaluations submitted yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-850">
                    {reviews.map(item => (
                      <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs hover:bg-slate-50/20 dark:hover:bg-slate-900/5 transition-all text-left">
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.application.candidate.firstName} {item.application.candidate.lastName}
                            </span>
                            <span className="text-slate-400">for</span>
                            <span className="bg-blue-50 dark:bg-slate-800 text-[#2563EB] px-2 py-0.5 rounded font-semibold text-[10px]">
                              {item.application.job.title}
                            </span>
                          </div>
                          
                          {/* Rating visual stars */}
                          <div className="flex items-center space-x-1 py-0.5">
                            {Array.from({ length: 5 }).map((_, starIdx) => (
                              <Star
                                key={starIdx}
                                className={`h-3 w-3 ${
                                  starIdx < item.rating 
                                    ? 'text-amber-500 fill-amber-500' 
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] text-slate-400 ml-1.5">Rating: {item.rating}/5</span>
                          </div>

                          <div className="text-slate-600 dark:text-slate-400 italic bg-slate-50/80 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-850 mt-2">
                            "{item.notes}"
                          </div>

                          <p className="text-[10px] text-slate-400 pt-1">
                            Evaluated by <span className="font-semibold text-slate-500">{item.interviewer.name}</span> ({item.interviewer.email})
                          </p>
                        </div>

                        <div className="flex flex-col items-end shrink-0 justify-between gap-4">
                          <span className={`status-tag inline-flex items-center ${
                            item.recommendation === 'STRONG_HIRE' || item.recommendation === 'HIRE'
                              ? 'status-active'
                              : 'status-pending'
                          }`}>
                            {item.recommendation.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Candidates awaiting reviews panel */}
          <div className="space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Awaiting Evaluations</h3>
              {pendingEvaluations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>All interview reviews completed!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingEvaluations.map(app => (
                    <div key={app.id} className="text-xs bg-slate-50 dark:bg-slate-900/30 p-3 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-left">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                          {app.candidate.firstName} {app.candidate.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{app.job.title}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setTargetAppId(app.id);
                          setShowSubmitModal(true);
                        }}
                        className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-7 py-0.5 rounded-lg flex items-center justify-center space-x-1 border-0"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Submit Review</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

        {/* MODAL: SUBMIT REVIEW SCORECARD */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Candidate Scorecard</h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitScorecard} className="space-y-4 text-xs">
                
                {/* Visual Star rating selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Numerical Score Rating</label>
                  <div className="flex space-x-2 py-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starVal = idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="bg-transparent border-0 cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`h-7 w-7 transition-all ${
                              starVal <= rating 
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Hiring Recommendation</label>
                  <select
                    value={recommendation}
                    onChange={(e: any) => setRecommendation(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0B1220] focus:outline-none"
                  >
                    <option value="STRONG_HIRE">STRONG HIRE</option>
                    <option value="HIRE">HIRE</option>
                    <option value="NO_HIRE">NO HIRE</option>
                    <option value="STRONG_NO_HIRE">STRONG NO HIRE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Notes & Feedback Comments</label>
                  <textarea
                    required
                    placeholder="Describe candidate technical performance, alignment with target skills, and reasoning for recommendation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-28 p-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-transparent focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-855">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 rounded-lg font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-[#2563EB] hover:bg-blue-700 text-white border-0 font-bold px-6 h-10"
                  >
                    Submit Scorecard
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
