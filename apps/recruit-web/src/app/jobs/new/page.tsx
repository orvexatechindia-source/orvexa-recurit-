"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/auth-context';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@orvexa/ui';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Layers } from 'lucide-react';

interface CustomField {
  id: string;
  fieldName: string;
  fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN';
  options: string[];
}

export default function NewJobPage() {
  const { accessToken, tenantId } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('Remote');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Prompt outline variables
  const [aiOutline, setAiOutline] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);

  // Phase 11 Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/custom-fields?entityType=JOB', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Tenant-ID': tenantId || '',
          },
        });
        const result = await response.json();
        if (result.success) {
          setCustomFields(result.data);
          const defaults: Record<string, string> = {};
          result.data.forEach((f: CustomField) => {
            defaults[f.id] = f.fieldType === 'BOOLEAN' ? 'false' : '';
          });
          setCustomValues(defaults);
        }
      } catch (err) {
        console.error('Failed to load custom fields:', err);
      }
    };

    if (accessToken) {
      fetchCustomFields();
    }
  }, [accessToken, tenantId]);

  const handleGenerateDescription = async () => {
    if (!aiOutline.trim()) return;
    setGeneratingDesc(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/v1/jobs/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ outline: aiOutline }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate job description.');
      }
      
      const expandedText = result.data.description;
      setDescription(expandedText);

      const reqHeader = '### Technical Requirements';
      const parts = expandedText.split(reqHeader);
      if (parts.length > 1) {
        setRequirements(parts[1].trim());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleCustomValueChange = (fieldId: string, val: string) => {
    setCustomValues(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Create Job opening
      const response = await fetch('http://localhost:4000/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          title,
          description,
          requirements,
          location,
          status,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create job.');
      }

      const jobId = result.data.id;

      // 2. Save Custom Field Values
      if (Object.keys(customValues).length > 0) {
        const valuesRes = await fetch('http://localhost:4000/api/v1/custom-fields/values', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Tenant-ID': tenantId || '',
          },
          body: JSON.stringify({
            entityId: jobId,
            values: customValues
          }),
        });
        const valuesResult = await valuesRes.json();
        if (!valuesResult.success) {
          console.warn('Failed to save some custom values:', valuesResult.error?.message);
        }
      }

      router.push('/jobs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button 
          onClick={() => router.push('/jobs')}
          className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vacancies</span>
        </button>
        <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display">Create New Job Opening</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Describe the role, candidate criteria, and workspace parameters.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Role Specifications</CardTitle>
                <CardDescription>Enter the title, description, and qualifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="title">
                    Job Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#046bd2] focus:border-transparent transition-all"
                  />
                </div>

                <div className="p-4 bg-[#FAF6F0] dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#046bd2] dark:text-cyan-400" />
                      <span>Help me write with AI (Gemini)</span>
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. React Developer, 3 years exp, remote, Node API knowledge"
                      value={aiOutline}
                      onChange={(e) => setAiOutline(e.target.value)}
                      className="flex-1 h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={generatingDesc}
                      onClick={handleGenerateDescription}
                      className="bg-[#046bd2] hover:bg-[#035bb3] text-white"
                    >
                      {generatingDesc ? 'Writing...' : 'Generate'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="description">
                    Job Description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={8}
                    placeholder="Describe the responsibilities and scope of this role..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#046bd2] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="requirements">
                    Qualifications & Criteria
                  </label>
                  <textarea
                    id="requirements"
                    rows={4}
                    placeholder="e.g. 5+ years React, experience with NestJS, SQL database experience..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#046bd2] focus:border-transparent transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details / Sidebar controls */}
          <div className="space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Workspace Settings</CardTitle>
                <CardDescription>Geographic location and visibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="location">
                    Location Type
                  </label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="status">
                    Initial Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
                  >
                    <option value="DRAFT">Draft (Internal view only)</option>
                    <option value="PUBLISHED">Published (Visible on Career Page)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Custom Properties Card */}
            {customFields.length > 0 && (
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Layers className="h-4.5 w-4.5 text-[#2563EB]" />
                    <span>Custom Properties</span>
                  </CardTitle>
                  <CardDescription>Custom fields configured for job openings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {field.fieldName}
                      </label>
                      
                      {field.fieldType === 'BOOLEAN' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={customValues[field.id] === 'true'}
                            onChange={(e) => handleCustomValueChange(field.id, String(e.target.checked))}
                            className="h-4 w-4 rounded border-slate-300 text-[#046bd2] focus:ring-[#046bd2]"
                          />
                          <span className="text-xs text-slate-500">Enable option</span>
                        </div>
                      ) : field.fieldType === 'DROPDOWN' ? (
                        <select
                          value={customValues[field.id] || ''}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          className="w-full h-9 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="">Select option...</option>
                          {field.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.fieldType === 'NUMBER' ? (
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          value={customValues[field.id] || ''}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          className="w-full h-9 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g. text input details"
                          value={customValues[field.id] || ''}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          className="w-full h-9 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border border-transparent bg-transparent shadow-none">
              <CardFooter className="p-0">
                <Button type="submit" disabled={loading} className="w-full bg-[#046bd2] hover:bg-[#035bb3] h-10 text-sm font-bold">
                  {loading ? 'Creating vacancy...' : 'Save vacancy'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
