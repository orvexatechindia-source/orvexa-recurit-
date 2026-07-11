"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@orvexa/ui';
import { Upload, ArrowLeft, CheckCircle2, File, Layers } from 'lucide-react';

interface CustomField {
  id: string;
  fieldName: string;
  fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN';
  options: string[];
}

export default function CareerApplyPage() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;
  const jobId = params.jobId as string;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 11 Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/custom-fields/public/${domain}?entityType=CANDIDATE`);
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
        console.error('Failed to load candidate custom fields:', err);
      }
    };

    if (domain) {
      fetchCustomFields();
    }
  }, [domain]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
      setError('Only PDF and Word documents (.doc/.docx) are allowed.');
      setResume(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      setResume(null);
      return;
    }
    setError(null);
    setResume(file);
  };

  const handleCustomValueChange = (fieldId: string, val: string) => {
    setCustomValues(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      setError('Please upload your resume document to apply.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('jobId', jobId);
      formData.append('resume', resume);
      
      // Append serialized custom field values for candidates
      if (Object.keys(customValues).length > 0) {
        formData.append('customValues', JSON.stringify(customValues));
      }

      const response = await fetch('http://localhost:4000/api/v1/candidates/apply', {
        method: 'POST',
        headers: {
          'X-Tenant-Domain': domain,
        },
        body: formData,
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit application.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F0F5FA] dark:bg-[#0B1220] flex items-center justify-center py-16 px-4">
        <Card className="max-w-md w-full border border-slate-200 dark:border-slate-800 text-center py-8">
          <CardContent className="flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Application Submitted!</h2>
            <p className="text-sm text-slate-500 mt-2">
              Thank you for applying. Our talent acquisition team will review your credentials and get back to you shortly.
            </p>
            <Button onClick={() => router.push(`/careers/${domain}`)} className="mt-8">
              Back to Career Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-[#0B1220] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <button 
          onClick={() => router.push(`/careers/${domain}`)}
          className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Open Positions</span>
        </button>

        <form onSubmit={handleSubmit}>
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white font-display">Submit Application</CardTitle>
              <CardDescription>Enter your contact details and upload your professional resume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder="Siva"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Sridharan"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="siva@orvexatech.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#046bd2] transition-all"
                />
              </div>

              {/* Dynamic Candidate Custom Fields */}
              {customFields.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 font-display">
                    <Layers className="h-4 w-4 text-[#2563EB]" />
                    <span>Additional Information</span>
                  </h3>
                  
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-1.5 text-xs">
                      <label className="text-sm font-medium text-slate-750 dark:text-slate-300">
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
                          <span className="text-xs text-slate-500">I confirm / agree</span>
                        </div>
                      ) : field.fieldType === 'DROPDOWN' ? (
                        <select
                          required
                          value={customValues[field.id] || ''}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          className="w-full h-10 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="">Select option...</option>
                          {field.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.fieldType === 'NUMBER' ? (
                        <input
                          type="number"
                          required
                          placeholder="Enter numerical response"
                          value={customValues[field.id] || ''}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="Provide details..."
                          value={customValues[field.id] || ''}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* File upload resume */}
              <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Upload Resume Document
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    dragging 
                      ? 'border-[#046bd2] bg-blue-50/20' 
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-750'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  {resume ? (
                    <div className="flex flex-col items-center space-y-2">
                      <File className="h-10 w-10 text-[#046bd2]" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                        {resume.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({(resume.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-10 w-10 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Drag and drop your resume file here
                      </span>
                      <span className="text-xs text-slate-400">
                        Supports PDF, DOC, or DOCX (Max 5MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
              <Button type="submit" disabled={loading} className="w-full bg-[#046bd2] hover:bg-[#035bb3] h-11 text-sm font-bold">
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
