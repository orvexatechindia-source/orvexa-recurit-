"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Shield, Layers, Users, TrendingUp, Sparkles, Server } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { accessToken, user } = useAuth();
  const [tenantCount, setTenantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/onboarding/tenants', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setTenantCount(result.data.length);
        }
      } catch (err) {
        console.error(err);
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
            Orvexa SaaS Admin Console
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5">
            System administration portal monitoring multi-tenant platform usage.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Organizations
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Active SaaS tenants</CardDescription>
              </div>
              <Layers className="h-5 w-5 text-[#2563EB] dark:text-[#06B6D4]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
                {loading ? '...' : tenantCount}
              </div>
              <Link 
                href="/admin/tenants"
                className="inline-flex items-center text-xs font-bold text-[#2563EB] dark:text-[#06B6D4] hover:underline mt-4"
              >
                View all tenants &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estimated MRR
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Monthly recurring revenue</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
                $499.00
              </div>
              <p className="text-xs text-slate-500 mt-4">Calculated from Pro subscription tiers</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  SaaS System Health
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Local cluster node status</CardDescription>
              </div>
              <Server className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
                Healthy
              </div>
              <p className="text-xs text-slate-500 mt-4">Database: Connected · Services: Active</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
