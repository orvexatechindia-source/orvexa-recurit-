"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Briefcase, Eye, Edit, Trash, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  title: string;
  location: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export default function JobsPage() {
  const { accessToken, tenantId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/jobs', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch jobs.');
      }
      setJobs(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchJobs();
    }
  }, [accessToken, tenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const response = await fetch(`http://localhost:4000/api/v1/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete job.');
      }
      // Reload list
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePublish = async (job: Job) => {
    const nextStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      const response = await fetch(`http://localhost:4000/api/v1/jobs/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update job status.');
      }
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display">Job Openings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your active job postings and syndications.</p>
        </div>
        <Button onClick={() => router.push('/jobs/new')} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Vacancy</span>
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-12">Loading jobs...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2">
          <CardContent className="flex flex-col items-center">
            <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No jobs listed yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Get started by creating your first job opening to collect candidate applications.</p>
            <Button onClick={() => router.push('/jobs/new')} variant="outline" className="mt-6">
              Create New Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs font-semibold uppercase text-slate-400">
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Applications</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{job.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{job.location}</td>
                    <td className="px-6 py-4 font-medium">{job._count?.applications || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        job.status === 'PUBLISHED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' 
                          : job.status === 'CLOSED'
                          ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
                      }`}>
                        {job.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => togglePublish(job)}>
                        {job.status === 'PUBLISHED' ? 'De-publish' : 'Publish'}
                      </Button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all inline-flex items-center"
                        title="Delete"
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
