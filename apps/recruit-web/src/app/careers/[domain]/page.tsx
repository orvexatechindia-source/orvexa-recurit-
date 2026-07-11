"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Briefcase, MapPin, Calendar, Clock } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  createdAt: string;
}

export default function CareerPortalPage() {
  const params = useParams();
  const domain = params.domain as string;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicJobs = async () => {
      if (!domain) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/v1/jobs/public/${domain}`);
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to retrieve jobs for this organization.');
        }
        setJobs(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicJobs();
  }, [domain]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Portal Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#0B1220] dark:text-white font-display uppercase tracking-tight">
            Careers at <span className="text-[#2563EB] capitalize">{domain}</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Discover your next opportunity and join our global team.
          </p>
        </div>

        {/* Jobs Container */}
        {loading ? (
          <p className="text-center text-slate-500 py-12">Loading open positions...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2">
            <CardContent>
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Open Roles</h3>
              <p className="text-sm text-slate-500 mt-1">There are no published opportunities at this time. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-[#2563EB] dark:text-[#06B6D4]">Full-Time</span>
                      </span>
                    </div>
                  </div>
                  <button className="h-10 px-6 font-semibold bg-[#2563EB] text-white hover:bg-[#1d4ed8] rounded-md transition-all duration-200 active:scale-98 self-start sm:self-center">
                    Apply Now
                  </button>
                </CardHeader>
                <CardContent className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">About the Role</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                    </div>
                    {job.requirements && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Requirements</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
