"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Users, FileText, Trash, Mail, Phone, Download } from 'lucide-react';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  skills: string[];
  summary?: string;
  createdAt: string;
  applications: Array<{
    id: string;
    matchScore?: number;
    fitExplanation?: string;
    job: {
      title: string;
    };
  }>;
}

export default function CandidatesPage() {
  const { accessToken, tenantId } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/candidates', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch candidate directory.');
      }
      setCandidates(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCandidates();
    }
  }, [accessToken, tenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate? This will cascade and delete all associated job applications.')) return;
    try {
      const response = await fetch(`http://localhost:4000/api/v1/candidates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete candidate.');
      }
      fetchCandidates();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display">Candidate Directory</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track and audit applicant files and contact profiles.</p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-12">Loading candidates...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md">
          {error}
        </div>
      ) : candidates.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2">
          <CardContent className="flex flex-col items-center">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No candidates yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Once candidates apply through your public Career Portal, they will be listed here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs font-semibold uppercase text-slate-400">
                  <th className="px-6 py-4">Candidate Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Applied Jobs</th>
                  <th className="px-6 py-4">Resume</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {candidate.firstName} {candidate.lastName}
                      </div>
                      {candidate.summary && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md italic truncate" title={candidate.summary}>
                          "{candidate.summary}"
                        </p>
                      )}
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 max-w-sm">
                          {candidate.skills.slice(0, 5).map((skill, sIdx) => (
                            <span key={sIdx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 5 && (
                            <span className="text-[10px] text-slate-400">+{candidate.skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.applications && candidate.applications.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {candidate.applications.map((app) => (
                            <div key={app.id} className="flex items-center flex-wrap gap-1.5">
                              <span className="inline-flex items-center rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-xs font-medium text-[#046bd2] dark:text-[#06b6d4] border border-blue-100 dark:border-blue-900/50">
                                {app.job.title}
                              </span>
                              {app.matchScore !== undefined && app.matchScore !== null && (
                                <span 
                                  title={app.fitExplanation || 'No description available'} 
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border cursor-help ${
                                    app.matchScore >= 80 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                      : app.matchScore >= 60
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
                                  }`}
                                >
                                  {app.matchScore}% Match
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No applications</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.resumeUrl ? (
                        <a 
                          href={`http://localhost:4000${candidate.resumeUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 font-semibold text-[#046bd2] hover:text-[#045cb4] hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(candidate.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all inline-flex items-center"
                        title="Delete Profile"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
