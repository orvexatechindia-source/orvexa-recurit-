"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@orvexa/ui';
import { Mail, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CandidatePortalLoginPage() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/candidate-portal/request-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, domain }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to dispatch magic passcode.');
      }
      setMessage('A secure 6-digit access passcode has been sent to your email.');
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/candidate-portal/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, domain }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Invalid passcode entered.');
      }

      // Store candidate session token locally
      localStorage.setItem('candidateToken', result.data.accessToken);
      localStorage.setItem('candidateEmail', result.data.email);
      router.push(`/careers/${domain}/portal/dashboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-[#0B1220] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full space-y-4">
        
        <button 
          onClick={() => router.push(`/careers/${domain}`)}
          className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Open Positions</span>
        </button>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#111827]">
          <CardHeader className="text-center">
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/20 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-3">
              {step === 'REQUEST' ? <Mail className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white font-display">Applicant Status Portal</CardTitle>
            <CardDescription className="text-xs">Log in securely to view active applications, upcoming interviews, and offer letters.</CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs mb-4">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs mb-4">
                {message}
              </div>
            )}

            {step === 'REQUEST' ? (
              <form onSubmit={handleRequestPasscode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide" htmlFor="email">
                    Enter Application Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. candidate@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] hover:bg-blue-750 text-white font-bold h-10 text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>{loading ? 'Sending Code...' : 'Request Access Code'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center block" htmlFor="code">
                    Enter 6-Digit Passcode
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-12 text-center text-lg font-bold tracking-widest rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('REQUEST')}
                    className="flex-1 h-10 text-xs border border-slate-200"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#2563EB] hover:bg-blue-750 text-white font-bold h-10 text-xs"
                  >
                    {loading ? 'Verifying...' : 'Access Dashboard'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="bg-slate-50/50 dark:bg-slate-900/10 py-3 text-center border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium">Passwordless Magic-Passcode Access</span>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
