import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  MessageSquare, 
  Star, 
  HelpCircle, 
  Award, 
  Bell, 
  Check, 
  Heart,
  ChevronRight,
  Terminal,
  Activity,
  Edit3
} from 'lucide-react';
import { MockInterview } from '../types';

interface CareerInterviewSchedulerProps {
  interviews: MockInterview[];
  onUpdateInterviews: (interviews: MockInterview[]) => void;
  onXpGained?: (xp: number, badgeId?: string) => void;
}

export default function CareerInterviewScheduler({
  interviews = [],
  onUpdateInterviews,
  onXpGained
}: CareerInterviewSchedulerProps) {
  
  // Tab/filter for interviews
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  // Add mock interview form states
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Technical' | 'HR' | 'English Speaking' | 'System Design' | 'Other'>('Technical');
  const [newDatetime, setNewDatetime] = useState(() => {
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [newInterviewer, setNewInterviewer] = useState('');
  const [newFeedback, setNewFeedback] = useState('');
  const [newQuestionsText, setNewQuestionsText] = useState('');

  // Editing state for feedback notes
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingScore, setEditingScore] = useState<number>(0);
  const [editingQuestions, setEditingQuestions] = useState<string>('');

  // Selected interview for details view
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(() => {
    return interviews.length > 0 ? interviews[0].id : '';
  });

  const selectedInterview = interviews.find(i => i.id === selectedInterviewId) || interviews[0] || null;

  // Add interview function
  const handleAddInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Please provide an interview topic or company title.");
      return;
    }

    const questionsArray = newQuestionsText
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const newInterview: MockInterview = {
      id: `mi-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      datetime: newDatetime,
      interviewer: newInterviewer.trim() || 'Self-Guided Simulator',
      status: 'scheduled',
      remindersEnabled: true,
      feedbackNotes: newFeedback.trim() || 'No feedback logged yet. Complete the interview to log core metrics.',
      performanceScore: 0,
      keyQuestionsAsked: questionsArray
    };

    const nextInterviews = [newInterview, ...interviews];
    onUpdateInterviews(nextInterviews);
    setSelectedInterviewId(newInterview.id);

    // Reset form states
    setNewTitle('');
    setNewInterviewer('');
    setNewFeedback('');
    setNewQuestionsText('');

    if (onXpGained) {
      onXpGained(20); // Minor boost for setting milestones
    }
  };

  // Toggle feedback editor
  const handleStartEdit = (interv: MockInterview) => {
    setEditingInterviewId(interv.id);
    setEditingNotes(interv.feedbackNotes);
    setEditingScore(interv.performanceScore);
    setEditingQuestions(interv.keyQuestionsAsked.join('\n'));
  };

  // Save feedback edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterviewId) return;

    const questionsArray = editingQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const updated = interviews.map(i => {
      if (i.id === editingInterviewId) {
        return {
          ...i,
          feedbackNotes: editingNotes.trim(),
          performanceScore: editingScore,
          keyQuestionsAsked: questionsArray
        };
      }
      return i;
    });

    onUpdateInterviews(updated);
    setEditingInterviewId(null);
    if (onXpGained) {
      onXpGained(15);
    }
  };

  // Toggle status complete / scheduled
  const handleToggleStatus = (id: string, currentStatus: 'scheduled' | 'completed' | 'canceled') => {
    const nextStatus = currentStatus === 'completed' ? 'scheduled' : 'completed';
    
    const updated = interviews.map(i => {
      if (i.id === id) {
        const score = nextStatus === 'completed' ? (i.performanceScore || 7) : 0;
        return {
          ...i,
          status: nextStatus as 'scheduled' | 'completed' | 'canceled',
          performanceScore: score
        };
      }
      return i;
    });

    onUpdateInterviews(updated);
    
    if (nextStatus === 'completed' && onXpGained) {
      onXpGained(40); // Standard interview completion Reward
    }
  };

  // Toggle reminders
  const handleToggleReminders = (id: string) => {
    const updated = interviews.map(i => {
      if (i.id === id) {
        return { ...i, remindersEnabled: !i.remindersEnabled };
      }
      return i;
    });
    onUpdateInterviews(updated);
  };

  // Delete interview
  const handleDeleteInterview = (id: string) => {
    if (confirm("Are you sure you want to remove this interview session?")) {
      const remaining = interviews.filter(i => i.id !== id);
      onUpdateInterviews(remaining);
      if (remaining.length > 0) {
        setSelectedInterviewId(remaining[0].id);
      } else {
        setSelectedInterviewId('');
      }
    }
  };

  // Filtered lists
  const filteredInterviews = interviews.filter(i => {
    if (filter === 'scheduled') return i.status === 'scheduled';
    if (filter === 'completed') return i.status === 'completed';
    return true;
  });

  // Highlight badge count or overall score averages
  const completedCount = interviews.filter(i => i.status === 'completed').length;
  const scheduledCount = interviews.filter(i => i.status === 'scheduled').length;
  const completedWithScore = interviews.filter(i => i.status === 'completed' && i.performanceScore > 0);
  const avgScore = completedWithScore.length > 0
    ? (completedWithScore.reduce((sum, i) => sum + i.performanceScore, 0) / completedWithScore.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8 animate-pulse">
          <Calendar className="h-64 w-64 text-teal-100" />
        </div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="bg-teal-500/30 text-teal-200 border border-teal-500/50 font-mono font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Mock Placement Tracker
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Career interview Prep &amp; Feedback Ledger</h1>
          <p className="text-xs md:text-sm text-teal-200/90 leading-relaxed font-medium">
            Plan realistic recruitment mock sessions—from core Technical assessments to rigorous HR behaviors and spoken English testing. Store reviewer feedback remarks, catalog critical questions asked, and measure your preparation status!
          </p>
        </div>

        {/* METRIC BADGES CARD */}
        <div className="mt-6 border-t border-teal-800/60 pt-5 flex flex-wrap items-center gap-4 text-xs">
          <div className="bg-white/10 text-white px-3 py-2 rounded-xl border border-white/10 font-medium">
            📅 Scheduled Sessions: <strong className="text-yellow-300 font-extrabold">{scheduledCount}</strong>
          </div>
          <div className="bg-white/10 text-white px-3 py-2 rounded-xl border border-white/10 font-medium">
            ✅ Completed &amp; Reviewed: <strong className="text-emerald-400 font-extrabold">{completedCount}</strong>
          </div>
          <div className="bg-white/10 text-white px-3 py-2 rounded-xl border border-white/10 font-medium whitespace-nowrap">
            📈 Prep Strength Index: <strong className="text-teal-300 font-extrabold">{avgScore} / 10</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: FORM & LIST LOG */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CREATE SCHEDULER BLOCK */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-2xs">
            <h2 className="font-extrabold text-gray-950 text-xs flex items-center gap-2 uppercase tracking-wide text-gray-500">
              <Plus className="h-4 w-4 text-teal-600" />
              Schedule Mock Interview
            </h2>

            <form onSubmit={handleAddInterview} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Session Title / Aim</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS Technical - React Framework"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Focus Syllabus Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-55 border border-gray-200 rounded-xl px-2 py-2 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="Technical">Technical (React/Node)</option>
                    <option value="HR">HR Behavioral (STAR)</option>
                    <option value="English Speaking">Spoken English Session</option>
                    <option value="System Design">System Design &amp; Architecture</option>
                    <option value="Other">General / Placement Drill</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={newDatetime}
                    onChange={(e) => setNewDatetime(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-55 border border-gray-200 rounded-xl px-2 py-1.5 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-semibold">Mock Interviewer (Name or Platform)</label>
                <input
                  type="text"
                  placeholder="e.g. Saurabh Kumar or Self-Prep Simulator"
                  value={newInterviewer}
                  onChange={(e) => setNewInterviewer(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preconditions / Target Questions (One per line)</label>
                <textarea
                  placeholder="Explain React lifecycle mechanics&#10;What are CMMI levels?&#10;STAR behavioral explanation"
                  value={newQuestionsText}
                  onChange={(e) => setNewQuestionsText(e.target.value)}
                  rows={2}
                  className="w-full text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Save Interview Milestone
              </button>

            </form>
          </div>

          {/* SESSIONS DIRECTORY CONTAINER */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                Mock Sessions Directory
              </h3>
              
              <div className="flex gap-1 text-[10px]">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                    filter === 'all' ? 'bg-teal-50 text-teal-700 border border-teal-200 font-extrabold' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('scheduled')}
                  className={`px-2 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                    filter === 'scheduled' ? 'bg-amber-50 text-amber-700 border border-amber-200 font-extrabold' : 'text-gray-500 hover:bg-gray-55'
                  }`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-2 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                    filter === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'text-gray-500 hover:bg-gray-55'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {filteredInterviews.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6 font-medium">No sessions match this category query.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredInterviews.map((item) => {
                  const isSelected = item.id === selectedInterviewId;
                  const isCompleted = item.status === 'completed';
                  const isAlert = item.remindersEnabled;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInterviewId(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected 
                          ? 'bg-teal-50/60 border-teal-200 shadow-3xs ring-1 ring-teal-100/50' 
                          : 'bg-gray-50/50 border-gray-150 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          {/* Complete toggle checkbox wrapper */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(item.id, item.status);
                            }}
                            className="mt-0.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                          >
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'bg-white border-gray-300 hover:border-teal-500'
                            }`}>
                              {isCompleted && <Check className="h-3 w-3 stroke-[3px]" />}
                            </div>
                          </button>

                          <div>
                            <p className={`text-xs font-bold leading-relaxed ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 font-extrabold'}`}>
                              {item.title}
                            </p>
                            <p className="text-[9px] font-semibold text-gray-500 italic mt-0.5">
                              Interviewer: {item.interviewer}
                            </p>
                          </div>
                        </div>

                        {/* Reminders chime toggle */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleReminders(item.id)}
                            className={`p-1 rounded-md transition-colors ${
                              isAlert 
                                ? 'text-amber-500 hover:text-amber-600 bg-amber-50' 
                                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
                            }`}
                            title={isAlert ? 'Mute desktop schedule chime for this study round' : 'Activate 8PM review study reminder for this round'}
                          >
                            <Bell className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteInterview(item.id)}
                            className="text-gray-300 hover:text-rose-500 p-1 rounded-md transition-colors hover:bg-rose-50"
                            title="Discard mock run"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Score or time stats */}
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-400 border-t border-gray-100 pt-2 bg-transparent">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-teal-600" />
                          {new Date(item.datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-1">
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                            item.type === 'Technical' 
                              ? 'bg-blue-100 text-blue-800' 
                              : item.type === 'HR' 
                                ? 'bg-violet-100 text-violet-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.type}
                          </span>
                          
                          {isCompleted && item.performanceScore > 0 && (
                            <span className="bg-emerald-100 text-emerald-800 px-1 rounded-sm text-[8px] font-bold">
                              ★ {item.performanceScore}/10
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: INTERVIEW FEEDBACK LEDGER & KEY QUESTIONS */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedInterview ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6 shadow-2xs">
              
              {/* INTERVIEW HEADER */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-600 text-white font-mono font-bold text-[8.5px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      Prep Feedback Locker
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedInterview.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedInterview.status === 'completed' ? '✓ Round Complete' : '⏳ Review Scheduled'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {selectedInterview.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold italic">
                    Assessed by: {selectedInterview.interviewer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (selectedInterview.status !== 'completed') {
                        // Mark compile done
                        handleToggleStatus(selectedInterview.id, selectedInterview.status);
                      } else {
                        handleStartEdit(selectedInterview);
                      }
                    }}
                    className="p-2 border border-gray-250 hover:bg-gray-55 text-slate-700 font-extrabold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-teal-600" />
                    {selectedInterview.status === 'completed' ? 'Rewrite Feedback' : 'Mark as Complete & Review'}
                  </button>
                </div>
              </div>

              {/* DETAILED VIEW OR EDIT MODE SLATE */}
              {editingInterviewId === selectedInterview.id ? (
                <form onSubmit={handleSaveEdit} className="bg-teal-50/30 border border-teal-200/50 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-teal-100/50 pb-2.5">
                    <h4 className="font-bold text-xs text-teal-900 uppercase tracking-wide flex items-center gap-2">
                      <Terminal className="h-4 w-4" /> Editing Feedback Evaluation
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setEditingInterviewId(null)}
                      className="text-gray-400 hover:text-gray-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* SCORE SLIDER */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-teal-800 uppercase tracking-wide flex justify-between">
                      <span>Performance Evaluation Rating</span>
                      <span className="text-teal-700 font-extrabold">{editingScore || 'Unset'}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={editingScore || 5}
                      onChange={(e) => setEditingScore(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-[8.5px] text-gray-400 font-bold font-mono">
                      <span>1 (Critical Refactoring needed)</span>
                      <span>5 (Average)</span>
                      <span>10 (Outstanding, Job Ready!)</span>
                    </div>
                  </div>

                  {/* LOG NOTES TEXTAREA */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-teal-800 uppercase tracking-wide">Reviewer Assessment &amp; Corrective Steps</label>
                    <textarea
                      required
                      placeholder="Add real learnings here. What went wrong during coding? How to optimize SQL JOIN complexity?"
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      rows={4}
                      className="w-full text-xs text-gray-800 bg-white border border-gray-200 rounded-xl p-3 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  {/* QUESTIONS ASKED MULTILINE */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-teal-800 uppercase tracking-wide">Actual Interview Questions Asked (One per line)</label>
                    <textarea
                      placeholder="What is RESTful API?&#10;How does async/await execute?"
                      value={editingQuestions}
                      onChange={(e) => setEditingQuestions(e.target.value)}
                      rows={3}
                      className="w-full text-xs text-gray-800 bg-white border border-gray-200 rounded-xl p-3 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingInterviewId(null)}
                      className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Dismiss Changes
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Save Evaluation Report
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  
                  {/* FEEDBACK FIELD */}
                  <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 space-y-3 shadow-3xs">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-teal-600" />
                        Reminders &amp; feedback remarks
                      </h4>
                      {selectedInterview.performanceScore > 0 && (
                        <span className="bg-teal-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Score achieved: <strong className="font-extrabold">{selectedInterview.performanceScore}/10</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed font-semibold italic bg-white border border-gray-100 p-3.5 rounded-lg whitespace-pre-wrap shadow-3xs">
                      "{selectedInterview.feedbackNotes}"
                    </p>
                  </div>

                  {/* KEY QUESTIONS SEC SECTION */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-gray-950 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-violet-500" />
                      Assigned Core Revision Quiz Questions ({selectedInterview.keyQuestionsAsked.length})
                    </h4>

                    {selectedInterview.keyQuestionsAsked.length === 0 ? (
                      <p className="text-xs text-gray-400 italic font-medium">No quiz questions cataloged yet for this session milestone.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedInterview.keyQuestionsAsked.map((q, qidx) => (
                          <div key={qidx} className="flex gap-3 items-start bg-slate-50/50 border border-gray-150 hover:bg-slate-50 p-3 rounded-xl transition-all">
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-mono font-extrabold h-5.5 w-5.5 rounded-full flex items-center justify-center shrink-0">
                              {qidx + 1}
                            </span>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-800 leading-relaxed font-sans">{q}</p>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent(q + " interview question response")}`}
                                  target="_blank"
                                  referrerPolicy="no-referrer"
                                  className="text-[9.5px] font-extrabold text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-0.5"
                                >
                                  🔍 Quick Answers Guide ›
                                </a>
                                <span className="text-[10px] text-gray-300">•</span>
                                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">Syllable Ready</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DESKTOP STUDY ALARM WARNING STATS */}
                  <div className="bg-amber-50 rounded-xl border border-amber-150 p-4 flex gap-3">
                    <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-900 leading-none">Guardianship Status Configuration</p>
                      <p className="text-[10.5px] text-amber-800/90 leading-relaxed font-medium">
                        {selectedInterview.remindersEnabled 
                          ? "This mock test triggers 8:00 PM discipline warning schedules if you haven't revised details beforehand. Stay checked!" 
                          : "Desktop study alerts are muted for this session. Direct manually via the scheduler controls on the left."}
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center shadow-2xs space-y-4">
              <div className="inline-flex p-4 rounded-full bg-teal-50 text-teal-600">
                <Calendar className="h-8 w-8 text-teal-600 animate-pulse" />
              </div>
              <h3 className="text-gray-950 font-bold text-sm">Review Interview Schedules or Logs</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
                Choose one of your scheduled mock sessions on the left navigation list to edit preparation feedback matrices, practice quiz questions, or enable alarms.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
