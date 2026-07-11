"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { Settings, Plus, LayoutGrid, CheckSquare, Award, ArrowRight, ToggleLeft, ListFilter, Trash2 } from 'lucide-react';

interface CustomField {
  id: string;
  entityType: 'JOB' | 'CANDIDATE';
  fieldName: string;
  fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN';
  options: string[];
  createdAt: string;
}

export default function SettingsPage() {
  const { accessToken, tenantId } = useAuth();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [activeTab, setActiveTab] = useState<'JOB' | 'CANDIDATE'>('CANDIDATE');
  const [loading, setLoading] = useState(true);

  // Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN'>('TEXT');
  const [dropdownOptions, setDropdownOptions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/custom-fields?entityType=${activeTab}`, {
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

  useEffect(() => {
    if (accessToken) {
      fetchFields();
    }
  }, [activeTab, accessToken, tenantId]);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;
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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0B1220] dark:text-white font-display flex items-center space-x-2">
          <Settings className="h-6 w-6 text-[#2563EB]" />
          <span>Workspace Settings</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure custom form fields for job boards and candidates intake forms.</p>
      </div>

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
          {/* Glassmorphic Tabs switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('CANDIDATE')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'CANDIDATE'
                  ? 'border-[#2563EB] text-[#2563EB] dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              Candidate Profile Fields
            </button>
            <button
              onClick={() => setActiveTab('JOB')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'JOB'
                  ? 'border-[#2563EB] text-[#2563EB] dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              Job Vacancy Fields
            </button>
          </div>

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
    </DashboardLayout>
  );
}
