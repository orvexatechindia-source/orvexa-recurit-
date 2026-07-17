"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Layers, MapPin, CreditCard, Users, Briefcase, Calendar, Shield } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  country: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
  _count: {
    users: number;
    jobs: number;
    candidates: number;
    applications: number;
  };
}

export default function AdminTenantsPage() {
  const { accessToken, user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:4000/api/v1/onboarding/tenants', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setTenants(result.data);
        } else {
          setError(result.error?.message || 'Failed to retrieve tenants.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch organizations list.');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && user?.role === 'SUPER_ADMIN') {
      fetchTenants();
    } else {
      setLoading(false);
    }
  }, [accessToken, user]);

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
          <Shield className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-sm text-slate-500">Only Super Admins can access this portal.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Tenant Organizations
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5">
            Overview of SaaS organization clients registered on the Orvexa platform.
          </p>
        </div>

        {/* Tenants List Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]/70">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white font-display">
              <Layers className="h-5 w-5 text-[#2563EB] dark:text-[#06B6D4]" />
              <span>Registered Tenants</span>
            </CardTitle>
            <CardDescription>
              Client list with database usage counters and region metadata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                Loading organizations list...
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg">
                {error}
              </div>
            ) : tenants.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                No onboarded tenant organizations found.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/10 text-xs uppercase font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Domain slug</th>
                      <th className="px-6 py-4">Country</th>
                      <th className="px-6 py-4">Subscription</th>
                      <th className="px-6 py-4 text-center">Users</th>
                      <th className="px-6 py-4 text-center">Jobs</th>
                      <th className="px-6 py-4 text-center">Candidates</th>
                      <th className="px-6 py-4">Onboarded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/5 transition-all">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {tenant.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {tenant.domain || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center space-x-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{tenant.country}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tenant.subscriptionPlan === 'PRO' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                          }`}>
                            {tenant.subscriptionPlan} ({tenant.subscriptionStatus.toLowerCase()})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-900 dark:text-white">
                          {tenant._count.users}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-900 dark:text-white">
                          {tenant._count.jobs}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-900 dark:text-white">
                          {tenant._count.candidates}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
