"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { UserPlus, Mail, Shield, ShieldAlert, Sparkles, Check, AlertCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamSettingsPage() {
  const { accessToken, tenantId } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('RECRUITER');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/v1/interviews/team', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch team members.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load team list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchMembers();
    }
  }, [accessToken, tenantId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/interviews/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ name, email, role }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccessMsg(`Successfully added ${name} to the team!`);
        setName('');
        setEmail('');
        setRole('RECRUITER');
        fetchMembers();
      } else {
        setError(result.error?.message || 'Failed to add team member.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add team member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Team Settings
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5">
              Manage organization users, recruiters, and hiring managers.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Add Team Member Card */}
          <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]/70">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white font-display">
                <UserPlus className="h-5 w-5 text-[#2563EB] dark:text-[#06B6D4]" />
                <span>Add Team Member</span>
              </CardTitle>
              <CardDescription>
                Create a new user profile with pre-configured role scopes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#06B6D4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#06B6D4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Saas Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="RECRUITER">Recruiter</option>
                    <option value="HIRING_MANAGER">Hiring Manager</option>
                    <option value="CLIENT_ADMIN">Client Admin</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2 font-medium">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 bg-[#2563EB] hover:bg-blue-700 text-white font-medium"
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Team Members List Table */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220]/70">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white font-display">
                <Shield className="h-5 w-5 text-[#2563EB] dark:text-[#06B6D4]" />
                <span>Active Workspace Members</span>
              </CardTitle>
              <CardDescription>
                Authorized accounts mapped under this multi-tenant workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                  Loading team directory...
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No active team members found.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/10 text-xs uppercase font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/5 transition-all">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {member.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 capitalize">
                              {member.role.toLowerCase().replace('_', ' ')}
                            </span>
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
      </div>
    </DashboardLayout>
  );
}
