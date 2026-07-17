"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@orvexa/ui';
import { Check } from 'lucide-react';

export const MarketingPricing: React.FC = () => {
  const router = useRouter();

  const plans = [
    {
      name: 'Starter',
      price: '$99',
      description: 'Perfect for fast-growing startups.',
      features: [
        'Up to 10 active job postings',
        '200 candidate profiles tracking',
        '3 recruiter workspace seats',
        'Basic multi-tenancy custom subdomains',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$249',
      description: 'Ideal for professional search agencies.',
      features: [
        'Up to 50 active job postings',
        '2,000 candidate profiles tracking',
        '10 recruiter workspace seats',
        'Gemini AI Resume Parsing (Basic)',
        'Scorecards & dynamic feedback',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For global brands needing massive scale.',
      features: [
        'Unlimited active job postings',
        'Unlimited candidate profiles',
        'Unlimited seat allocations',
        'Full Gemini AI Ranking & Prep Questions',
        'Custom Fields & Dynamic forms',
        'Dedicated account support',
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-[#F0F5FA]/40 dark:bg-[#0B1220]/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Predictable Plans for Dynamic Scaling
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Select a plan to start your free 14-day trial. Cancel or upgrade at any time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card 
              key={idx} 
              className={`border transition-all duration-200 flex flex-col justify-between ${
                plan.popular 
                  ? 'border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/10 scale-102 bg-white dark:bg-[#111827]' 
                  : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-transparent'
              }`}
            >
              <CardHeader className="pb-6">
                {plan.popular && (
                  <span className="inline-flex items-center rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-semibold text-[#2563EB] dark:text-cyan-400 self-start mb-4">
                    Most Popular
                  </span>
                )}
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-4xl font-extrabold tracking-tight font-display">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-sm font-semibold text-slate-500">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3.5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="h-4 w-4 text-[#2563EB] dark:text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-8">
                <Button 
                  onClick={() => {
                    if (plan.price === 'Custom') {
                      window.location.href = 'mailto:sales@orvexarecruit.com?subject=Enterprise Plan Inquiry - Orvexa Recruit';
                    } else {
                      router.push('/register');
                    }
                  }}
                  variant={plan.popular ? 'primary' : 'outline'} 
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white cursor-pointer border-0 font-bold"
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
