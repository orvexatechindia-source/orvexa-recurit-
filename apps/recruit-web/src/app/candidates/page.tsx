"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Users, Mail, Phone, Download, Search, SlidersHorizontal, RefreshCw, X, Award, Briefcase } from 'lucide-react';

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

interface Job {
  id: string;
  title: string;
}

export default function CandidatesPage() {
  const { accessToken, tenantId } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState('');
  const [minMatchScore, setMinMatchScore] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Fetch Jobs list to populate dropdown
  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/jobs', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setJobs(result.data);
      }
    } catch (err) {
      console.error('Failed to load vacancies for filtering:', err);
    }
  };

  const fetchCandidates = async (paramsString = '') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/candidates${paramsString}`, {
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
      fetchJobs();
      fetchCandidates();
    }
  }, [accessToken, tenantId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerFilterSearch();
  };

  const triggerFilterSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.append('query', query.trim());
    if (skills.trim()) params.append('skills', skills.trim());
    if (minMatchScore) params.append('minMatchScore', minMatchScore);
    if (selectedJobId) params.append('jobId', selectedJobId);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    fetchCandidates(queryStr);
  };

  const handleResetFilters = () => {
    setQuery('');
    setSkills('');
    setMinMatchScore('');
    setSelectedJobId('');
    fetchCandidates();
  };

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
      triggerFilterSearch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/candidates/export/csv', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'candidates_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export candidates CSV.');
    }
  };

  const hasActiveFilters = query.trim() || skills.trim() || minMatchScore || selectedJobId;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display">Candidate Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Search, filter, and audit applicant profiles in your workspace.</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleExportCsv}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1.5 h-10 px-4"
          >
            <Download className="h-4 w-4 text-[#2563EB]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* iCims-Style Advanced Search & Filters Grid */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search candidates by name, email, or summary..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="h-11 px-4 border border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span>Filters</span>
            </Button>

            <Button
              type="submit"
              className="h-11 px-6 bg-[#046bd2] hover:bg-[#035bb3] text-white font-bold"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Collapsible Advanced Filters Drawer */}
        {isFilterPanelOpen && (
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] p-5 rounded-2xl animate-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Filter 1: Skills tag input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Filter 2: Min Match Score */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Minimum Fit Score</label>
                <select
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(e.target.value)}
                  className="w-full h-10 px-2 rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Any Match Score</option>
                  <option value="90">90% + (Excellent)</option>
                  <option value="80">80% + (Very Good)</option>
                  <option value="60">60% + (Good)</option>
                </select>
              </div>

              {/* Filter 3: Associated Vacancy */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Associated Vacancy</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full h-10 px-2 rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">All Job Vacancies</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <span className="text-xs text-slate-400 font-semibold italic">Filters compile dynamically</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-3.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>Reset All</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={triggerFilterSearch}
                  className="h-9 px-4.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Filters tag bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">Active Filters:</span>
            {query.trim() && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-[#046bd2] border border-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold">
                <span>Query: "{query}"</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setQuery(''); setTimeout(triggerFilterSearch, 0); }} />
              </span>
            )}
            {skills.trim() && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-[#046bd2] border border-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold">
                <span>Skills: {skills}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSkills(''); setTimeout(triggerFilterSearch, 0); }} />
              </span>
            )}
            {minMatchScore && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-[#046bd2] border border-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold">
                <span>Match: {minMatchScore}%+</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinMatchScore(''); setTimeout(triggerFilterSearch, 0); }} />
              </span>
            )}
            {selectedJobId && (
              <span className="inline-flex items-center space-x-1 bg-blue-50 text-[#046bd2] border border-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold">
                <span>Job: {jobs.find(j => j.id === selectedJobId)?.title}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedJobId(''); setTimeout(triggerFilterSearch, 0); }} />
              </span>
            )}
          </div>
        )}
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">No candidates found</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Try resetting the search filters or check your other open job listings.</p>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} className="mt-6 bg-[#046bd2]">
                Reset search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs font-bold uppercase text-slate-400">
                  <th className="px-6 py-4">Candidate Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Applied Vacancies</th>
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
                            <span key={sIdx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-150 dark:border-transparent">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 5 && (
                            <span className="text-[10px] text-slate-455 font-semibold">+{candidate.skills.length - 5} more</span>
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
                              <span className="inline-flex items-center rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-xs font-semibold text-[#046bd2] dark:text-[#06b6d4] border border-blue-100 dark:border-blue-900/50">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {app.job.title}
                              </span>
                              {app.matchScore !== undefined && app.matchScore !== null && (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                                  app.matchScore >= 80 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                                    : app.matchScore >= 60
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400'
                                }`}>
                                  <Award className="h-2.5 w-2.5 mr-0.5 text-amber-500 fill-amber-500/20" />
                                  {app.matchScore}% Match
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No applications</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.resumeUrl ? (
                        <a
                          href={candidate.resumeUrl.startsWith('http') ? candidate.resumeUrl : `http://localhost:4000${candidate.resumeUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs text-[#046bd2] hover:underline font-semibold"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Resume.pdf</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold uppercase border border-red-100 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1.5 rounded transition-all"
                      >
                        Delete
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
