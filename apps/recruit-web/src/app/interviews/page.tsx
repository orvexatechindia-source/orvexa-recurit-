"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@orvexa/ui';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  Video, 
  Clock, 
  Trash2, 
  X, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';

interface Interview {
  id: string;
  startTime: string;
  endTime: string;
  meetingUrl?: string;
  status: string;
  application: {
    id: string;
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
    };
    job: {
      title: string;
    };
  };
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface CandidateApplication {
  id: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    title: string;
  };
}

export default function InterviewsPage() {
  const { accessToken, tenantId } = useAuth();
  
  // Data lists
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Scheduler Form State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedInterviewerId, setSelectedInterviewerId] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [durationMins, setDurationMins] = useState('45');
  const [meetingUrl, setMeetingUrl] = useState('');

  // Team Member Form State
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken, tenantId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'X-Tenant-ID': tenantId || '',
    };
    try {
      // 1. Fetch scheduled interviews
      const intRes = await fetch('http://localhost:4000/api/v1/interviews', { headers });
      const intData = await intRes.json();
      if (intData.success) setInterviews(intData.data);

      // 2. Fetch active team members
      const teamRes = await fetch('http://localhost:4000/api/v1/interviews/team', { headers });
      const teamData = await teamRes.json();
      if (teamData.success) setTeamMembers(teamData.data);

      // 3. Fetch applications
      const appRes = await fetch('http://localhost:4000/api/v1/applications', { headers });
      const appData = await appRes.json();
      if (appData.success) setApplications(appData.data);
    } catch (err: any) {
      setError('Failed to connect to the recruitment schedule servers.');
    } finally {
      setLoading(false);
    }
  };

  // Schedule new interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const startDateTime = new Date(`${startDateStr}T${startTimeStr}:00`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(durationMins, 10) * 60000);

    try {
      const response = await fetch('http://localhost:4000/api/v1/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          applicationId: selectedAppId,
          interviewerId: selectedInterviewerId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          meetingUrl: meetingUrl || undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Interview scheduled and invitation dispatched successfully.');
        setShowScheduleModal(false);
        // Reset fields
        setSelectedAppId('');
        setSelectedInterviewerId('');
        setStartDateStr('');
        setMeetingUrl('');
        fetchData();
      } else {
        setError(result.error?.message || 'Failed to schedule interview.');
      }
    } catch (err) {
      setError('Communication error with schedule server.');
    }
  };

  // Add interviewer team member
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('http://localhost:4000/api/v1/interviews/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          name: newTeamName,
          email: newTeamEmail,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Team member registered as active interviewer.');
        setShowAddTeamModal(false);
        setNewTeamName('');
        setNewTeamEmail('');
        fetchData();
      } else {
        setError(result.error?.message || 'Failed to add team member.');
      }
    } catch (err) {
      setError('Communication error with team module.');
    }
  };

  // Cancel interview
  const handleCancelInterview = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this interview slot? The candidate will be notified.')) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/interviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Interview slot cancelled and removed from active pipelines.');
        fetchData();
      } else {
        setError(result.error?.message || 'Failed to cancel interview.');
      }
    } catch (err) {
      setError('Communication error with cancellation server.');
    }
  };

  // Month calculation helpers
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  const getInterviewsForDay = (day: number) => {
    return interviews.filter(item => {
      const d = new Date(item.startTime);
      return d.getDate() === day && d.getMonth() === monthIndex && d.getFullYear() === year;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Interview Scheduler & Planner
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage slots, assign interviewers, and view calendar layouts.
            </p>
          </div>

          <div className="flex space-x-3 shrink-0">
            <Button
              onClick={() => setShowAddTeamModal(true)}
              className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1"
            >
              <UserCheck className="h-4 w-4 text-[#2563EB]" />
              <span>Add Interviewer</span>
            </Button>
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold flex items-center space-x-1 border-0"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Slot</span>
            </Button>
          </div>
        </div>

        {/* Action Banners */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center space-x-2 text-sm text-red-700 dark:text-red-400">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center space-x-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Calendar Grid - takes 3 columns */}
          <Card className="lg:col-span-3 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-display">
                {monthName} {year}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-slate-250 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white border-0 bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-slate-250 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white border-0 bg-transparent cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center font-bold text-[10px] text-slate-400 uppercase py-2 bg-slate-50/10">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 grid-flow-row auto-rows-[110px] bg-slate-100/30 dark:bg-slate-950/10">
              {/* Padding block cells for calendar offsets */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="border-r border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/20" />
              ))}

              {/* Day cells */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const day = idx + 1;
                const dayInterviews = getInterviewsForDay(day);
                return (
                  <div key={`day-${day}`} className="border-r border-b border-slate-200 dark:border-slate-800/80 p-2 flex flex-col justify-between overflow-y-auto">
                    <span className="font-bold text-xs text-slate-400 dark:text-slate-600 self-start">{day}</span>
                    <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
                      {dayInterviews.map(item => (
                        <div
                          key={item.id}
                          className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-1 text-[9px] text-blue-700 dark:text-blue-400 cursor-pointer hover:bg-blue-100 transition-all flex flex-col group relative"
                        >
                          <div className="font-bold truncate">
                            {item.application.candidate.firstName} {item.application.candidate.lastName.charAt(0)}.
                          </div>
                          <div className="text-[8px] text-slate-405 dark:text-slate-500 truncate mt-0.5">
                            {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          
                          {/* Cancel slot hover helper */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelInterview(item.id);
                            }}
                            className="absolute right-1 top-1 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 bg-white dark:bg-slate-900 rounded p-0.5 border-0 cursor-pointer shadow-sm transition-opacity"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Interviewers list side panel - 1 column */}
          <div className="space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Interviewer Pool</h3>
              {teamMembers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active team members registered.
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center space-x-3 text-xs bg-slate-50 dark:bg-slate-900/30 p-2.5 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{member.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* Quick stats details summary card */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm p-4 bg-slate-50/20 dark:bg-slate-900/10">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics Snapshot</h4>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Scheduled</span>
                  <span className="text-xl font-extrabold text-[#2563EB] mt-1 block">{interviews.length}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Hiring Pool</span>
                  <span className="text-xl font-extrabold text-emerald-500 mt-1 block">{teamMembers.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* MODAL: SCHEDULE NEW SLOT */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Candidate Loop</h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Select Candidate Application</label>
                  <select
                    required
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0B1220] focus:outline-none"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.candidate.firstName} {app.candidate.lastName} ({app.job.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Select Interviewer</label>
                  <select
                    required
                    value={selectedInterviewerId}
                    onChange={(e) => setSelectedInterviewerId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0B1220] focus:outline-none"
                  >
                    <option value="">-- Choose Interviewer --</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Date</label>
                    <input
                      type="date"
                      required
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Time</label>
                    <input
                      type="time"
                      required
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Duration</label>
                    <select
                      value={durationMins}
                      onChange={(e) => setDurationMins(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0B1220] focus:outline-none"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Meeting Room</label>
                    <input
                      type="url"
                      placeholder="Mock Meeting URL"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 rounded-lg font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-[#2563EB] hover:bg-blue-700 text-white border-0 font-bold px-6 h-10"
                  >
                    Schedule Loop
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD INTERVIEWER */}
        {showAddTeamModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl p-6 text-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Interviewer</h3>
                <button onClick={() => setShowAddTeamModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddTeamMember} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Interviewer Name</label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={newTeamEmail}
                    onChange={(e) => setNewTeamEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-850 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowAddTeamModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 rounded-lg font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-[#2563EB] hover:bg-blue-700 text-white border-0 font-bold px-6 h-10"
                  >
                    Save Interviewer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
