"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@orvexa/ui';
import { CreditCard, Mail, Building, Key, ShieldAlert, CheckCircle } from 'lucide-react';

function RegisterForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Onboarding wizard steps: 1 = Account Credentials, 2 = Email OTP check, 3 = Stripe card verification
  const [step, setStep] = useState(1);
  
  // Account state
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Card state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill email query param from Hero signup input
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Step 1 -> Step 2
  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    // Generate simulated verification OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
    setStep(2);
  };

  // Step 2 -> Step 3
  const handleStepTwoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (otpInput.trim() !== otpCode) {
      setOtpError('Invalid verification passcode. For simulation purposes, use the OTP shown in the card info banner.');
      return;
    }
    setStep(3);
  };

  // Step 3 (Final submit)
  const handleStepThreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    setError(null);

    // Validate mock card info
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setCardError('Please enter a valid 16-digit credit card number.');
      return;
    }
    if (cardCvc.length < 3) {
      setCardError('Please enter a valid CVC security code.');
      return;
    }

    setLoading(true);
    try {
      // Call onboarding service
      await signup(companyName, adminName, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Onboarding failed. The domain name check or server returned an error.');
      // Rollback step if root onboarding fails (e.g. MX record invalid domain)
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Dynamic Wizard Steps indicator */}
      <div className="flex items-center justify-between mb-6 px-4 text-xs font-bold text-slate-400 select-none">
        <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-[#2563EB]' : ''}`}>
          <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-955/20' : 'border-slate-300'}`}>1</span>
          <span>Profile</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-[#2563EB]' : ''}`}>
          <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-955/20' : 'border-slate-300'}`}>2</span>
          <span>Verify Mail</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-[#2563EB]' : ''}`}>
          <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-955/20' : 'border-slate-300'}`}>3</span>
          <span>Card Check</span>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-md">
        {/* STEP 1: Account Info Form */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Onboard Your Organization</CardTitle>
              <CardDescription>Enter details to provision your isolated workspace</CardDescription>
            </CardHeader>
            <form onSubmit={handleStepOneSubmit}>
              <CardContent className="space-y-4 text-xs">
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="companyName">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="adminName">
                    Your Full Name
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                    Work Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    Workspace Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="•••••••• (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full font-bold h-11 text-xs">
                  Continue to Verification
                </Button>
                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have a workspace?{' '}
                  <a href="/login" className="font-semibold text-[#2563EB] hover:underline">
                    Sign In
                  </a>
                </div>
              </CardFooter>
            </form>
          </>
        )}

        {/* STEP 2: Email OTP verification Form */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-[#2563EB]" />
                <span>Verify Work Email</span>
              </CardTitle>
              <CardDescription>Confirm your address is active and legitimate</CardDescription>
            </CardHeader>
            <form onSubmit={handleStepTwoSubmit}>
              <CardContent className="space-y-4 text-xs">
                {/* Banner listing dynamic generated simulator OTP */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-955/20 border border-blue-150 dark:border-blue-900/40 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
                    <CheckCircle className="h-4 w-4 text-[#2563EB]" />
                    <span>Security OTP Dispatched</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    A dynamic code has been generated. For local validation: **{otpCode}**
                  </p>
                </div>

                {otpError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    {otpError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="otp">
                    Enter 6-Digit Passcode
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    placeholder="e.g. 549302"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full h-11 text-center text-lg font-mono tracking-widest px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full font-bold h-11 text-xs">
                  Verify Email Address
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-650 hover:underline bg-transparent border-0"
                >
                  Go Back
                </button>
              </CardFooter>
            </form>
          </>
        )}

        {/* STEP 3: Identity & Card Hold Verification Form */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-[#2563EB]" />
                <span>Fraud Prevention Checklist</span>
              </CardTitle>
              <CardDescription>Confirm card info to launch trial workspace</CardDescription>
            </CardHeader>
            <form onSubmit={handleStepThreeSubmit}>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>90-Day Free Trial Authorization</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    A standard credit card verification check ($0.00) is required to prevent bot subdomains spam. No money will be charged.
                    Use Stripe test card: **4242 4242 4242 4242**
                  </p>
                </div>

                {cardError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-955/30 p-3 text-red-655 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    {cardError}
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-955/30 p-3 text-red-655 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="cardName">
                    Cardholder Name
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="cardNumber">
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(val);
                    }}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="cardExpiry">
                      Expiration Date
                    </label>
                    <input
                      id="cardExpiry"
                      type="text"
                      required
                      placeholder="MM / YY"
                      maxLength={7}
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\s?/g, '').replace(/\/+/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + ' / ' + val.substring(2);
                        }
                        setCardExpiry(val);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="cardCvc">
                      Security Code (CVC)
                    </label>
                    <input
                      id="cardCvc"
                      type="password"
                      required
                      placeholder="123"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" disabled={loading} className="w-full font-bold h-11 text-xs bg-[#2563EB] hover:bg-blue-700 border-0 flex items-center justify-center">
                  {loading ? 'Activating Workspace...' : 'Verify & Launch Workspace'}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-400 hover:text-slate-655 hover:underline bg-transparent border-0"
                >
                  Go Back
                </button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1220] px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0B1220] dark:text-white font-display">
            Orvexa <span className="text-[#2563EB]">Recruit</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Set up your organization's talent acquisition workspace
          </p>
        </div>

        <Suspense fallback={
          <div className="w-full max-w-md p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl">
            <p className="text-sm text-slate-500">Loading registration form...</p>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
