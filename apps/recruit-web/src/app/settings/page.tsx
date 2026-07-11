"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Settings, Plus, LayoutGrid, CheckSquare, Award, ArrowRight, ToggleLeft, ListFilter, CreditCard, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface CustomField {
  id: string;
  entityType: 'JOB' | 'CANDIDATE';
  fieldName: string;
  fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN';
  options: string[];
  createdAt: string;
}

interface BillingStatus {
  id: string;
  name: string;
  country: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionId?: string;
  billingProvider?: string;
}

export default function SettingsPage() {
  const { accessToken, tenantId } = useAuth();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [activeTab, setActiveTab] = useState<'JOB' | 'CANDIDATE' | 'BILLING'>('CANDIDATE');
  const [loading, setLoading] = useState(true);

  // Form State for Custom Fields
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN'>('TEXT');
  const [dropdownOptions, setDropdownOptions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // SaaS Billing State
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [updatingCountry, setUpdatingCountry] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Mock Payment Modals state
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [activeOrderData, setActiveOrderData] = useState<any>(null);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/custom-fields?entityType=${activeTab === 'BILLING' ? 'CANDIDATE' : activeTab}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setFields(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/billing/status', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setBillingStatus(result.data);
      }
    } catch (err) {
      console.error('Failed to load billing status:', err);
    }
  };

  useEffect(() => {
    if (accessToken) {
      if (activeTab === 'BILLING') {
        fetchBillingStatus();
      } else {
        fetchFields();
      }
    }
  }, [activeTab, accessToken, tenantId]);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || activeTab === 'BILLING') return;
    setSubmitting(true);

    const parsedOptions = fieldType === 'DROPDOWN'
      ? dropdownOptions.split(',').map(o => o.trim()).filter(Boolean)
      : [];

    try {
      const response = await fetch('http://localhost:4000/api/v1/custom-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          entityType: activeTab,
          fieldName: fieldName.trim(),
          fieldType,
          options: parsedOptions
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFieldName('');
        setDropdownOptions('');
        setFieldType('TEXT');
        fetchFields();
      } else {
        throw new Error(result.error?.message || 'Failed to create field.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Switch Country (Triggers Gateway router redirect criteria)
  const handleCountryChange = async (country: string) => {
    setUpdatingCountry(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/billing/country', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ country }),
      });
      const result = await response.json();
      if (result.success) {
        fetchBillingStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingCountry(false);
    }
  };

  // Launch simulated checkouts
  const handleCheckoutInit = async (plan: string) => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ plan }),
      });
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        setActiveOrderData({ ...data, targetPlan: plan });
        
        if (data.gateway === 'RAZORPAY') {
          setShowRzpModal(true);
        } else if (data.gateway === 'STRIPE') {
          setShowStripeModal(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Complete Simulated Callback webhook to update tenant active subscription levels
  const handleMockWebhookCompletion = async (provider: string, plan: string, orderOrSessionId: string) => {
    try {
      const webhookUrl = `http://localhost:4000/api/v1/billing/webhooks/${provider.toLowerCase()}`;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          plan,
          status: 'ACTIVE',
          transactionId: orderOrSessionId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowRzpModal(false);
        setShowStripeModal(false);
        setShowPaypalModal(false);
        fetchBillingStatus();
      } else {
        alert('Simulation callback failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriceText = (plan: string, country: string) => {
    const isIndia = country === 'IN';
    if (plan === 'PRO') {
      return isIndia ? '₹3,999 / mo' : '$49 / mo';
    }
    if (plan === 'ENTERPRISE') {
      return isIndia ? '₹9,999 / mo' : '$149 / mo';
    }
    return 'Free Starter';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display flex items-center space-x-2">
          <Settings className="h-6 w-6 text-[#2563EB]" />
          <span>Workspace Settings</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure custom form fields and subscriptions packages parameters.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('CANDIDATE')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'CANDIDATE'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Candidate Profile Fields
        </button>
        <button
          onClick={() => setActiveTab('JOB')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'JOB'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Job Vacancy Fields
        </button>
        <button
          onClick={() => setActiveTab('BILLING')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'BILLING'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Billing & Plan</span>
        </button>
      </div>

      {activeTab === 'BILLING' ? (
        <div className="space-y-6">
          
          {/* Subscription Status Card */}
          {billingStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Plan Metadata info */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Active Subscription</CardTitle>
                    <CardDescription className="text-xs">Your workspace parameters limits and package pricing info.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pricing Tier</span>
                        <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                          <span>{billingStatus.subscriptionPlan} PLAN</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Billing Gateway</span>
                        <div className="font-bold text-[#2563EB]">
                          {billingStatus.billingProvider || 'NONE (FREE)'}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Gateway Status</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/50">
                          {billingStatus.subscriptionStatus}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Agreement ID</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[100px] block" title={billingStatus.subscriptionId || 'N/A'}>
                          {billingStatus.subscriptionId || 'None'}
                        </span>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Country Selector (Switches Payment Processor) */}
              <div className="lg:col-span-1">
                <Card className="border border-slate-200 dark:border-slate-800 bg-[#FAF6F0]/40 dark:bg-slate-900/20 p-5 rounded-2xl h-full flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Billing Region</h4>
                    <p className="text-xs text-slate-500">Adapts pricing currency and active gateway routing rules dynamically.</p>
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select billing region</label>
                    <select
                      value={billingStatus.country}
                      disabled={updatingCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full h-10 px-2 rounded-md border border-slate-350 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none text-xs"
                    >
                      <option value="US">US & Europe (Stripe / PayPal Router)</option>
                      <option value="IN">India (Razorpay Local UPI Router)</option>
                      <option value="GB">United Kingdom (Stripe Gateway)</option>
                      <option value="DE">Germany (PayPal Router)</option>
                    </select>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* Pricing Comparison Grid */}
          <div className="pt-4 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Upgrade Subscription Tiers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Plan 1: Free */}
              <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between relative">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase">Starter Trial</h4>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Free Tier</h2>
                    <p className="text-xs text-slate-500">Great for exploring core functionalities.</p>
                  </div>
                  
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>1 Active Job Opening</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Up to 10 Candidate Profiles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Basic scorecards reviews</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold h-10"
                  >
                    Current Plan
                  </Button>
                </div>
              </div>

              {/* Plan 2: PRO */}
              <div className="p-6 bg-white dark:bg-[#111827] border-2 border-[#2563EB] rounded-2xl flex flex-col justify-between relative shadow-md">
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#2563EB] text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#2563EB] uppercase">Pro Recruiter</h4>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {billingStatus ? getPriceText('PRO', billingStatus.country) : '$49 / mo'}
                    </h2>
                    <p className="text-xs text-slate-500">Complete toolset for fast growing organizations.</p>
                  </div>

                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">Unlimited Active Jobs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Gemini AI fit score checks</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>AWS SES transactional email notifications</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Polymorphic Custom Fields Manager</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleCheckoutInit('PRO')}
                    disabled={checkoutLoading || billingStatus?.subscriptionPlan === 'PRO'}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold h-10 flex items-center justify-center space-x-1"
                  >
                    <span>{billingStatus?.subscriptionPlan === 'PRO' ? 'Active' : 'Upgrade to Pro'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between relative">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase">Enterprise Scale</h4>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {billingStatus ? getPriceText('ENTERPRISE', billingStatus.country) : '$149 / mo'}
                    </h2>
                    <p className="text-xs text-slate-500">Dedicated capacity for large staffing corporations.</p>
                  </div>

                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">Everything in Pro</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Multiple workspaces/teams setup</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Custom recruitment pipelines</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Dedicated Account Manager & SLA</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleCheckoutInit('ENTERPRISE')}
                    disabled={checkoutLoading || billingStatus?.subscriptionPlan === 'ENTERPRISE'}
                    className="w-full bg-[#111827] dark:bg-slate-850 hover:bg-slate-800 text-white text-xs font-bold h-10 flex items-center justify-center space-x-1"
                  >
                    <span>{billingStatus?.subscriptionPlan === 'ENTERPRISE' ? 'Active' : 'Upgrade to Enterprise'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Razorpay Simulation Modal Overlay */}
          {showRzpModal && activeOrderData && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden p-6 space-y-6 text-xs shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Razorpay Payment Gateway (IN UPI)</h3>
                  <p className="text-slate-400">Simulating UPI / Netbanking payments validation for India region.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{activeOrderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Plan:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeOrderData.targetPlan} PLAN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Price:</span>
                    <span className="font-bold text-[#2563EB]">₹{activeOrderData.amount / 100} INR</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRzpModal(false)}
                    className="flex-1 h-10 font-bold border border-slate-200 text-slate-600 dark:text-slate-300"
                  >
                    Cancel Order
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleMockWebhookCompletion('RAZORPAY', activeOrderData.targetPlan, activeOrderData.orderId)}
                    className="flex-1 h-10 bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
                  >
                    Simulate Payment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stripe / PayPal Simulation Redirect Modal Overlay */}
          {showStripeModal && activeOrderData && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden p-6 space-y-6 text-xs shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Stripe / PayPal Gateway Simulator</h3>
                  <p className="text-slate-400">Redirecting to checkout session on international endpoints.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2.5 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session ID:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{activeOrderData.sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Checkout Link:</span>
                    <a href={activeOrderData.url} className="text-indigo-500 hover:underline truncate max-w-[150px]" target="_blank" rel="noreferrer">
                      stripe.com/checkout
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Plan:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeOrderData.targetPlan} PLAN</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Stripe Simulator Button */}
                  <Button
                    type="button"
                    onClick={() => handleMockWebhookCompletion('STRIPE', activeOrderData.targetPlan, activeOrderData.sessionId)}
                    className="flex-1 h-10 bg-indigo-650 hover:bg-indigo-700 text-white font-bold"
                  >
                    Simulate Stripe Card
                  </Button>
                  
                  {/* PayPal Simulator Button */}
                  <Button
                    type="button"
                    onClick={() => handleMockWebhookCompletion('PAYPAL', activeOrderData.targetPlan, `paypal_agreement_${Date.now()}`)}
                    className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                  >
                    Simulate PayPal Flow
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <button onClick={() => setShowStripeModal(false)} className="text-slate-400 hover:text-slate-600 hover:underline">
                    Cancel Checkout
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Create Custom Field */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827]">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Add Custom Field</CardTitle>
                <CardDescription className="text-xs">Define a new field on {activeTab.toLowerCase()} forms.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddField} className="space-y-4 text-xs">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Field Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Notice Period, Expected Salary"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Field Format Type</label>
                    <select
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value as any)}
                      className="w-full h-10 px-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="TEXT">Text input</option>
                      <option value="NUMBER">Number value</option>
                      <option value="BOOLEAN">Checkbox / Switch</option>
                      <option value="DROPDOWN">Dropdown option list</option>
                    </select>
                  </div>

                  {fieldType === 'DROPDOWN' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Dropdown Choices (comma-separated)</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Immediate, 30 Days, 90 Days"
                        value={dropdownOptions}
                        onChange={(e) => setDropdownOptions(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs h-10 font-bold flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{submitting ? 'Creating...' : 'Create Custom Field'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Tab Panel & Listing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fields list */}
            {loading ? (
              <p className="text-center py-16 text-slate-500 text-sm">Loading field configurations...</p>
            ) : fields.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <LayoutGrid className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">No custom fields defined</h4>
                <p className="text-xs text-slate-555 mt-1 max-w-sm mx-auto">Create customized fields on the left to request additional data from applicants.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.id} className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{field.fieldName}</h4>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-[#2563EB] font-bold bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded uppercase">
                          {field.fieldType}
                        </span>
                        {field.options && field.options.length > 0 && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            ({field.options.length} options)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Icon Representation */}
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                      {field.fieldType === 'BOOLEAN' ? (
                        <ToggleLeft className="h-4.5 w-4.5" />
                      ) : field.fieldType === 'DROPDOWN' ? (
                        <ListFilter className="h-4.5 w-4.5" />
                      ) : field.fieldType === 'NUMBER' ? (
                        <Award className="h-4.5 w-4.5" />
                      ) : (
                        <CheckSquare className="h-4.5 w-4.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </DashboardLayout>
  );
}
