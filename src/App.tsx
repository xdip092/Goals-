import React, { useState, useEffect, useRef } from 'react';
import { getInitialState } from './data';
import { LifeTransformationState, SubjectTrack, RoadmapItem, GovExamSection } from './types';

// Lucide Icons Import
import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Terminal,
  Heart,
  FileText,
  Clock,
  Award,
  CirclePlay,
  RotateCcw,
  Check,
  TrendingUp,
  Cpu,
  Trash2,
  Plus,
  Sun,
  Moon,
  BookMarked,
  Download,
  Upload
} from 'lucide-react';

// Custom components
import UbuntuGuides from './components/UbuntuGuides';
import AICoaches from './components/AICoaches';
import BcaExamsComponent from './components/BcaExamsComponent';
import FitnessComponent from './components/FitnessComponent';
import ATSResumeComponent from './components/ATSResumeComponent';
import GoalsNotesComponent from './components/GoalsNotesComponent';
import ReviewReminderWidget from './components/ReviewReminderWidget';
import CareerInterviewScheduler from './components/CareerInterviewScheduler';
import DailyFocusCard from './components/DailyFocusCard';
import RevisionFlashcardDeck from './components/RevisionFlashcardDeck';

export default function App() {
  const [state, setState] = useState<LifeTransformationState>(() => {
    try {
      const saved = localStorage.getItem('transformation_os_state_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed loading state, restoring templates", e);
    }
    return getInitialState();
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'bca' | 'tech' | 'gov' | 'english' | 'fitness' | 'career' | 'ubuntu' | 'goals' | 'interviews' | 'flashcards'>('dashboard');
  const [examMode, setExamMode] = useState<boolean>(true); // BCA Exam mode (50% study, etc)
  const [newFsName, setNewFsName] = useState<string>('');
  const [newFsCategory, setNewFsCategory] = useState<string>('Frontend');
  const [newAiName, setNewAiName] = useState<string>('');
  const [newAiCategory, setNewAiCategory] = useState<string>('Generative AI');

  // Dual Theme (Dark vs Light) state and browser client integration
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme_preference') as any) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme_preference', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (e) {
      console.warn("Failed updating theme classList on html body:", e);
    }
  }, [theme]);


  // Save to locale
  useEffect(() => {
    localStorage.setItem('transformation_os_state_v1', JSON.stringify(state));
  }, [state]);

  // Handle score increment / xp rewards
  const handleXpGained = (xpAmt: number, badgeId?: string) => {
    setState(prev => {
      const nextXp = prev.userStats.xp + xpAmt;
      const nextLevel = Math.floor(nextXp / 150);
      
      // Unlock badge if specified
      const nextBadges = prev.badges.map(b => {
        if (badgeId && b.id === badgeId) {
          return { ...b, unlocked: true };
        }
        return b;
      });

      // Recalculate computed overall score inside state
      const fsTotal = prev.fullStackRoadmap.reduce((acc, r) => acc + (r.progress ?? 0), 0);
      const fsPct = Math.round(fsTotal / prev.fullStackRoadmap.length);
      const aiTotal = prev.aiRoadmap.reduce((acc, r) => acc + (r.progress ?? 0), 0);
      const aiPct = Math.round(aiTotal / prev.aiRoadmap.length);
      const bcaSum = prev.bcaSubjects.reduce((acc, s) => {
        const totalL = s.notes.length || 5;
        const arr = s.unitProgress && s.unitProgress.length === totalL 
          ? s.unitProgress 
          : Array(totalL).fill(0);
        return acc + (arr.reduce((sum, p) => sum + p, 0) / totalL);
      }, 0);
      const bcaAvg = Math.round(bcaSum / prev.bcaSubjects.length);
      const rrbAvg = Math.round(prev.rrbPrep.reduce((acc, s) => acc + s.progress, 0) / prev.rrbPrep.length);
      const bankAvg = Math.round(prev.bankingPrep.reduce((acc, s) => acc + s.progress, 0) / prev.bankingPrep.length);
      const currentOverall = Math.round((fsPct + aiPct + bcaAvg + rrbAvg + bankAvg) / 5);

      // Dynamically light up today's cell on the commit heatmap
      const todayStr = new Date().toISOString().split('T')[0];
      const nextHeatmapData = prev.userStats.heatmapData.map(d => {
        if (d.date === todayStr) {
          return { ...d, count: d.count + 1 };
        }
        return d;
      });

      return {
        ...prev,
        userStats: {
          ...prev.userStats,
          xp: nextXp,
          level: nextLevel,
          overallScore: Math.min(100, currentOverall),
          heatmapData: nextHeatmapData
        },
        badges: nextBadges
      };
    });
  };

  // State setters wrapped for components
  const updateBcaSubjects = (next: SubjectTrack[] | ((prev: SubjectTrack[]) => SubjectTrack[])) => {
    setState(prev => {
      const updated = typeof next === 'function' ? next(prev.bcaSubjects) : next;
      return { ...prev, bcaSubjects: updated };
    });
  };

  const updateFullStackRoadmap = (nextItem: RoadmapItem) => {
    setState(prev => {
      const updated = prev.fullStackRoadmap.map(r => r.id === nextItem.id ? nextItem : r);
      return { ...prev, fullStackRoadmap: updated };
    });
  };

  const addFullStackRoadmapItem = (name: string, category: string) => {
    setState(prev => {
      const newItem: RoadmapItem = {
        id: `fs-custom-${Date.now()}`,
        name,
        category,
        status: 'pending',
        hoursSpent: 0,
        progress: 0
      };
      return { ...prev, fullStackRoadmap: [...prev.fullStackRoadmap, newItem] };
    });
  };

  const removeFullStackRoadmapItem = (id: string) => {
    setState(prev => ({
      ...prev,
      fullStackRoadmap: prev.fullStackRoadmap.filter(item => item.id !== id)
    }));
  };

  const updateAiRoadmap = (nextItem: RoadmapItem) => {
    setState(prev => {
      const updated = prev.aiRoadmap.map(r => r.id === nextItem.id ? nextItem : r);
      return { ...prev, aiRoadmap: updated };
    });
  };

  const addAiRoadmapItem = (name: string, category: string) => {
    setState(prev => {
      const newItem: RoadmapItem = {
        id: `ai-custom-${Date.now()}`,
        name,
        category,
        status: 'pending',
        hoursSpent: 0,
        progress: 0
      };
      return { ...prev, aiRoadmap: [...prev.aiRoadmap, newItem] };
    });
  };

  const removeAiRoadmapItem = (id: string) => {
    setState(prev => ({
      ...prev,
      aiRoadmap: prev.aiRoadmap.filter(item => item.id !== id)
    }));
  };

  const updateRrbPrep = (next: GovExamSection[] | ((prev: GovExamSection[]) => GovExamSection[])) => {
    setState(prev => {
      const updated = typeof next === 'function' ? next(prev.rrbPrep) : next;
      return { ...prev, rrbPrep: updated };
    });
  };

  const updateBankingPrep = (next: GovExamSection[] | ((prev: GovExamSection[]) => GovExamSection[])) => {
    setState(prev => {
      const updated = typeof next === 'function' ? next(prev.bankingPrep) : next;
      return { ...prev, bankingPrep: updated };
    });
  };

  const resetAllProgress = () => {
    if (confirm("Reset everything to template values? All progress scores and resume additions will revert.")) {
      const clean = getInitialState();
      setState(clean);
      localStorage.setItem('transformation_os_state_v1', JSON.stringify(clean));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("download", `transformation_os_backup_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Error exporting backup: " + (e as Error).message);
    }
  };

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        
        // Basic structural validations to make sure it is a valid state of the OS
        if (parsed && typeof parsed === 'object' && ('userStats' in parsed || 'bcaSubjects' in parsed || 'fullStackRoadmap' in parsed)) {
          setState(parsed);
          localStorage.setItem('transformation_os_state_v1', JSON.stringify(parsed));
          alert("Backup imported successfully! All your progress, stats, and roadmap data have been restored.");
        } else {
          alert("Invalid backup file structure. Please upload a valid JSON backup exported from this application.");
        }
      } catch (err) {
        alert("Failed to parse backup file as valid JSON.");
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be loaded again
    if (event.target) {
      event.target.value = '';
    }
  };

  // Calculating overall Completion % of roadmaps dynamically
  const fsTotal = state.fullStackRoadmap.reduce((acc, r) => acc + (r.progress ?? 0), 0);
  const fsPct = Math.round(fsTotal / state.fullStackRoadmap.length);

  const aiTotal = state.aiRoadmap.reduce((acc, r) => acc + (r.progress ?? 0), 0);
  const aiPct = Math.round(aiTotal / state.aiRoadmap.length);

  const bcaSum = state.bcaSubjects.reduce((acc, s) => {
    const totalL = s.notes.length || 5;
    const arr = s.unitProgress && s.unitProgress.length === totalL 
      ? s.unitProgress 
      : Array(totalL).fill(0);
    return acc + (arr.reduce((sum, p) => sum + p, 0) / totalL);
  }, 0);
  const bcaAvg = Math.round(bcaSum / state.bcaSubjects.length);

  const rrbAvg = Math.round(state.rrbPrep.reduce((acc, s) => acc + s.progress, 0) / state.rrbPrep.length);
  const bankAvg = Math.round(state.bankingPrep.reduce((acc, s) => acc + s.progress, 0) / state.bankingPrep.length);

  // Countdown timings in active GMT offsets
  const bcaExamTarget = new Date('2026-08-01T00:00:00Z');
  const rrbTarget = new Date('2026-11-15T00:00:00Z');
  const bankingTarget = new Date('2026-12-20T00:00:00Z');
  const programEnd = new Date('2027-06-20T00:00:00Z');

  const getDaysLeft = (target: Date) => {
    const diff = target.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans leading-relaxed">
      
      {/* Upper Navigation panel status bar */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-50 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* logo & brand details */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white transform hover:rotate-6 transition-all duration-300">
              <Sparkles className="h-5.5 w-5.5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5 uppercase">
                12M Life Transformation OS
                <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full uppercase">Mentor Pro</span>
              </h1>
              <p className="text-[11px] text-gray-400 font-semibold tracking-wide">BCA Final Semester | Full Stack Developer | AI Systems | Government Exams</p>
            </div>
          </div>

          {/* Gamification trackers cards */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="bg-indigo-50 border border-indigo-150/40 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
              <Award className="h-4 w-4 text-indigo-600 animate-bounce" />
              <div>
                <p className="text-[9px] text-indigo-800 uppercase tracking-wider">Accumulated Level</p>
                <p className="text-indigo-950 font-extrabold text-sm">Level {state.userStats.level} <span className="text-[10px] text-indigo-500 font-semibold">({state.userStats.xp} XP)</span></p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-150/40 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[9px] text-emerald-800 uppercase tracking-wider">Overall Transformation Index</p>
                <p className="text-emerald-950 font-extrabold text-sm">{Math.round((fsPct + aiPct + bcaAvg + rrbAvg + bankAvg) / 5)}% Completed</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-150/40 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-rose-600 font-bold" />
              <div>
                <p className="text-[9px] text-rose-800 uppercase tracking-wider">Active Road Streaks</p>
                <p className="text-rose-950 font-extrabold">Study: {state.userStats.streakDays.study}d | Code: {state.userStats.streakDays.coding}d</p>
              </div>
            </div>

            <button
              onClick={resetAllProgress}
              className="p-2 border border-gray-150 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-900 cursor-pointer"
              title="Reset System Values"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={exportProgress}
              className="p-2 border border-indigo-150 bg-indigo-50/10 hover:bg-indigo-50/30 rounded-xl text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
              title="Export all progress, stats, and roadmap data as a JSON file backup"
            >
              <Download className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold hidden sm:inline">Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 border border-emerald-150 bg-emerald-50/10 hover:bg-emerald-50/30 rounded-xl text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
              title="Import JSON backup file to restore all progress, stats, and roadmap data"
            >
              <Upload className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold hidden sm:inline">Restore</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={importProgress}
              accept=".json"
              className="hidden"
            />

            {/* Theme Toggle Button Switch */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-2 border border-gray-150 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-950 cursor-pointer flex items-center justify-center transition-all bg-gray-50/50 hover:scale-105"
              title={theme === 'dark' ? 'Switch to Clean Light Theme' : 'Switch to Dark High-Density Aesthetic'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-500 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Primary tabs navigations panel */}
      <nav className="bg-white border-b border-gray-150 sticky top-[73px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1.5 py-2.5 nav-scrollbar">
          {[
            { id: 'dashboard', label: '📊 System Dashboard', icon: <Cpu className="h-3.5 w-3.5" /> },
            { id: 'goals', label: '🎯 Custom Goals & Notes', icon: <Award className="h-3.5 w-3.5" /> },
            { id: 'interviews', label: '📞 Interview Prep & Logs', icon: <Calendar className="h-3.5 w-3.5 text-teal-600" /> },
            { id: 'flashcards', label: '📝 Study Flashcards', icon: <BookMarked className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> },
            { id: 'bca', label: '🎓 BCA Semester Finals', icon: <BookOpen className="h-3.5 w-3.5" /> },
            { id: 'tech', label: '💻 Web Roadmaps', icon: <Layers className="h-3.5 w-3.5" /> },
            { id: 'english', label: '🗣️ Spoken English &amp; AI Chats', icon: <Sparkles className="h-3.5 w-3.5" /> },
            { id: 'fitness', label: '🍏 Fitness &amp; Appearance', icon: <Heart className="h-3.5 w-3.5" /> },
            { id: 'career', label: '📄 Resume CV &amp; Apply', icon: <FileText className="h-3.5 w-3.5" /> },
            { id: 'ubuntu', label: '🐚 Ubuntu CLI guides', icon: <Terminal className="h-3.5 w-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8" id="transformation-dashboard-content">
        
        {/* TAB 1: SYSTEM CONTROLLER MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Countdown timers and general transformation overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              <div className="bg-white rounded-2xl p-5 border border-indigo-150/40 relative overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="space-y-1 z-15">
                  <span className="bg-indigo-100 text-indigo-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">BCA Finals Timer</span>
                  <p className="text-3xl font-extrabold text-indigo-950 mt-1">{getDaysLeft(bcaExamTarget)} Days</p>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold tracking-wide mt-3">Target Date: 01-Aug-2026. Prioritizing 50% study allocation index.</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-150 relative overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="bg-orange-100 text-orange-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">RRB NTPC Exams</span>
                  <p className="text-3xl font-extrabold text-orange-950 mt-1">{getDaysLeft(rrbTarget)} Days</p>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold tracking-wide mt-3">Estimated Stage 1 start: 15-Nov-2026. Current daily target blocks active.</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-150 relative overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="bg-sky-100 text-sky-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Banking Mains Prelims</span>
                  <p className="text-3xl font-extrabold text-sky-950 mt-1">{getDaysLeft(bankingTarget)} Days</p>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold tracking-wide mt-3 font-semibold">Scheduled Date: 20-Dec-2026. Focus speed &amp; accuracy diagnostics.</p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg text-white">
                <div className="space-y-1">
                  <span className="bg-emerald-500 text-emerald-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Yearly Target Clocks</span>
                  <p className="text-3xl font-extrabold mt-1 text-emerald-300">{getDaysLeft(programEnd)} Days</p>
                </div>
                <p className="text-[11px] text-emerald-100/75 font-semibold tracking-wide mt-3">Program Completion: 20-Jun-2027. Strictly target 95% completion.</p>
              </div>

            </div>

            {/* Daily streak rescue 8PM notification helper */}
            <ReviewReminderWidget
              state={state}
              onUpdateState={setState}
              onXpGained={handleXpGained}
            />

            {/* Anti-Overload Daily Focus Module */}
            <DailyFocusCard
              state={state}
              onUpdateState={setState}
              onXpGained={handleXpGained}
            />

            {/* Smart Schedule Allocation panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Daily tasks checklist */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Dynamic Daily Planner</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Checked items increment consistency indexes</p>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-bold">Smart Block</span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
                  {state.dailyTasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        task.completed ? 'bg-indigo-50/50 border-indigo-150 text-indigo-950 font-medium' : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          setState(prev => {
                            const nextTasks = prev.dailyTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                            const wasCompleted = !task.completed;
                            if (wasCompleted) {
                              handleXpGained(10); // Gain 10 XP for daily task completed
                            }
                            return { ...prev, dailyTasks: nextTasks };
                          });
                        }}
                        className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="border border-gray-200 text-[8px] font-bold px-1 py-0.2 rounded-md uppercase mr-1.5 text-gray-500 leading-none">
                          {task.category}
                        </span>
                        {task.text}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time allocation gauge and consistency map */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-xs">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Time allocation indices</h3>
                    <p className="text-[11px] text-gray-500">Current allocation profile shifts based on BCA semesters exams scheduling rules.</p>
                  </div>

                  <div className="flex bg-gray-50 border p-1 rounded-lg border-gray-200">
                    <button
                      onClick={() => {
                        setExamMode(true);
                        setState(prev => ({
                          ...prev,
                          timeAllocation: { bcaPercent: 50, fullStackPercent: 20, govPercent: 5, aiPercent: 5, englishPercent: 10, fitnessPercent: 10 }
                        }));
                      }}
                      className={`text-[10px] font-bold px-3 py-1 rounded-md ${examMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
                    >
                      Semester Exam Phase
                    </button>
                    <button
                      onClick={() => {
                        setExamMode(false);
                        setState(prev => ({
                          ...prev,
                          timeAllocation: { bcaPercent: 10, fullStackPercent: 30, govPercent: 25, aiPercent: 20, englishPercent: 10, fitnessPercent: 5 }
                        }));
                      }}
                      className={`text-[10px] font-bold px-3 py-1 rounded-md ${!examMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
                    >
                      Post-Exam Acceleration
                    </button>
                  </div>
                </div>

                {/* Progress bars allocations */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {[
                    { label: 'BCA Finals', percent: state.timeAllocation.bcaPercent, color: 'bg-indigo-600', text: 'text-indigo-800' },
                    { label: 'Full Stack', percent: state.timeAllocation.fullStackPercent, color: 'bg-emerald-600', text: 'text-emerald-800' },
                    { label: 'Gov Prep', percent: state.timeAllocation.govPercent, color: 'bg-orange-600', text: 'text-orange-800' },
                    { label: 'Generative AI', percent: state.timeAllocation.aiPercent, color: 'bg-purple-600', text: 'text-purple-800' },
                    { label: 'English Spoken', percent: state.timeAllocation.englishPercent, color: 'bg-sky-600', text: 'text-sky-800' },
                    { label: 'Nutrition Fitness', percent: state.timeAllocation.fitnessPercent, color: 'bg-rose-600', text: 'text-rose-800' }
                  ].map((alloc_ui, idx) => (
                    <div key={idx} className="p-3 bg-gray-55/10 bg-slate-50 rounded-xl space-y-1.5 border border-gray-150 text-center shadow-xs">
                      <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{alloc_ui.label}</p>
                      <p className={`text-xl font-extrabold ${alloc_ui.text}`}>{alloc_ui.percent}%</p>
                      <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div className={`${alloc_ui.color} h-full`} style={{ width: `${alloc_ui.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* GitHub style heatmap */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                    <span>Performance Consistency heatmap (Last 30 Days)</span>
                    <span className="text-[10px] text-gray-400">Total active checks</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3.5 bg-gray-50 rounded-xl justify-start items-center border border-gray-150">
                    {state.userStats.heatmapData.map((day, idx) => {
                      // Color shade based on checked task indices scale
                      let bg = 'bg-gray-200';
                      if (day.count > 0 && day.count <= 2) bg = 'bg-indigo-100';
                      else if (day.count > 2 && day.count <= 4) bg = 'bg-indigo-300';
                      else if (day.count > 4 && day.count <= 6) bg = 'bg-indigo-500';
                      else if (day.count > 6) bg = 'bg-indigo-800';

                      return (
                        <div
                          key={idx}
                          className={`h-4.5 w-4.5 rounded-xs ${bg} transition-transform hover:scale-110 cursor-help relative group`}
                          title={`${day.date}: ${day.count} milestones completed`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Overview rings indices */}
                <div className="space-y-3.5">
                  <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Dynamic Program Milestones Overall Completion</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { title: 'BCA syllabus', score: bcaAvg, color: 'text-indigo-600' },
                      { title: 'Full Stack web', score: fsPct, color: 'text-emerald-00' },
                      { title: 'Generative AI', score: aiPct, color: 'text-purple-600' },
                      { title: 'Gov Prep NTPC', score: rrbAvg, color: 'text-orange-600' }
                    ].map((rng, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-150">
                        <div className="text-sm font-extrabold text-indigo-950 font-mono">
                          {rng.score}%
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">{rng.title}</p>
                          <div className="w-full bg-gray-205 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-indigo-600 h-full" style={{ width: `${rng.score}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>

            {/* Badges system showcase */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm">Gamificación Achievements Badges unlocked</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {state.badges.map((b) => (
                  <div key={b.id} className={`p-4 rounded-xl border text-center transition-all ${
                    b.unlocked ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950' : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                  }`}>
                    <span className="text-2xl block mb-1.5">{b.icon}</span>
                    <h5 className="text-[10.5px] font-bold uppercase tracking-wider">{b.title}</h5>
                    <p className="text-[9.5px] text-gray-500 mt-1 leading-relaxed">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: CUSTOM GOALS & CURRICULUM NOTES VAULT */}
        {activeTab === 'goals' && (
          <GoalsNotesComponent
            goals={state.customGoals || []}
            onUpdateGoals={(nextGoals) => setState(prev => ({ ...prev, customGoals: nextGoals }))}
            onXpGained={(x, badgeId) => handleXpGained(x, badgeId)}
          />
        )}

        {/* TAB: CAREER INTERVIEW SCHEDULER */}
        {activeTab === 'interviews' && (
          <CareerInterviewScheduler
            interviews={state.mockInterviews || []}
            onUpdateInterviews={(nextInterviews) => setState(prev => ({ ...prev, mockInterviews: nextInterviews }))}
            onXpGained={(x) => handleXpGained(x)}
          />
        )}

        {/* TAB: STUDY FLASHCARDS REVISION DECK */}
        {activeTab === 'flashcards' && (
          <RevisionFlashcardDeck
            flashcards={state.flashcards || []}
            onUpdateFlashcards={(nextFlashcards) => setState(prev => ({ ...prev, flashcards: nextFlashcards }))}
            onXpGained={(xp) => handleXpGained(xp)}
          />
        )}

        {/* TAB 2: BCA SEMESTER FINALS PROGRESS MODULE */}
        {activeTab === 'bca' && (
          <BcaExamsComponent
            subjects={state.bcaSubjects}
            setSubjects={updateBcaSubjects}
            onXpGained={(x) => handleXpGained(x)}
          />
        )}

        {/* TAB 3: WEB TECH ROADMAPS & CHECKLISTS COLLAPSIBLE */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            
            {/* Split trackers full stack and Generative AI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Full Stack Roadmap Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
                <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Full Stack Development Roadmap</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Focusing on high demand industry production codebases &amp; custom goals</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {fsPct}% Complete
                  </span>
                </div>

                {/* Add custom milestone form */}
                <div className="p-3.5 bg-indigo-50/30 rounded-xl border border-dashed border-indigo-150 space-y-2">
                  <p className="text-[10px] font-bold text-indigo-805 uppercase tracking-wider flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Custom Full Stack Milestone
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Deploy Dockerized API with reverse proxy"
                      value={newFsName}
                      onChange={(e) => setNewFsName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!newFsName.trim()) return;
                          addFullStackRoadmapItem(newFsName, newFsCategory);
                          setNewFsName('');
                          handleXpGained(10);
                        }
                      }}
                      className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newFsCategory}
                        onChange={(e) => setNewFsCategory(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-750 bg-white focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Foundation">Foundation</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="DevOps &amp; Cloud">DevOps &amp; Cloud</option>
                        <option value="Custom Goal">Custom Goal</option>
                      </select>
                      <button
                        onClick={() => {
                          if (!newFsName.trim()) return;
                          addFullStackRoadmapItem(newFsName, newFsCategory);
                          setNewFsName('');
                          handleXpGained(10);
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {state.fullStackRoadmap.map((item) => {
                    const progressVal = item.progress ?? 0;
                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-colors border border-gray-150 space-y-3">
                        <div className="flex justify-between items-start gap-2.5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${
                                progressVal === 100 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-150'
                              }`}>
                                {progressVal}% Completed
                              </span>
                              <span className="bg-gray-200 text-gray-600 font-bold text-[8px] px-1.5 py-0.2 rounded-md uppercase tracking-wide">
                                {item.category}
                              </span>
                            </div>
                            <p className={`text-xs font-bold leading-relaxed mt-1.5 ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {item.name}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-gray-400 font-bold whitespace-nowrap">{item.hoursSpent}h logged</span>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${item.name}" from your Full Stack Roadmap?`)) {
                                  removeFullStackRoadmapItem(item.id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                              title="Delete Roadmap Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar & Increment button */}
                        <div className="flex items-center gap-3.5 pt-1">
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                progressVal === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${progressVal}%` }} 
                            />
                          </div>
                          <button
                            onClick={() => {
                              const nextProgress = progressVal >= 100 ? 0 : progressVal + 10;
                              const updatedItem: RoadmapItem = {
                                ...item,
                                progress: nextProgress,
                                status: nextProgress === 100 ? 'completed' : 'pending',
                                hoursSpent: nextProgress === 0 ? 0 : item.hoursSpent + 1
                              };
                              updateFullStackRoadmap(updatedItem);
                              if (nextProgress === 100) {
                                handleXpGained(25);
                              } else {
                                handleXpGained(5);
                              }
                            }}
                            className="text-[10px] font-extrabold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
                            Progress +10%
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {state.fullStackRoadmap.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">No milestones here yet. Type above to add your first!</p>
                  )}
                </div>
              </div>

              {/* Generative AI & Automation Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
                <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Generative AI &amp; Agent Workflows</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">APIs, prompt layouts, langchain tool calling loops</p>
                  </div>
                  <span className="bg-purple-50 text-purple-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {aiPct}% Complete
                  </span>
                </div>

                {/* Add custom AI milestone form */}
                <div className="p-3.5 bg-indigo-50/30 rounded-xl border border-dashed border-indigo-150 space-y-2">
                  <p className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Custom AI / Prompt Milestone
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Fine-tune custom small language model"
                      value={newAiName}
                      onChange={(e) => setNewAiName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!newAiName.trim()) return;
                          addAiRoadmapItem(newAiName, newAiCategory);
                          setNewAiName('');
                          handleXpGained(10);
                        }
                      }}
                      className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-808 focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newAiCategory}
                        onChange={(e) => setNewAiCategory(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-750 bg-white focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="AI Foundation">AI Foundation</option>
                        <option value="Generative AI">Generative AI</option>
                        <option value="AI Development &amp; RAG">AI Development &amp; RAG</option>
                        <option value="Agent Workflows">Agent Workflows</option>
                        <option value="AI Safety">AI Safety</option>
                      </select>
                      <button
                        onClick={() => {
                          if (!newAiName.trim()) return;
                          addAiRoadmapItem(newAiName, newAiCategory);
                          setNewAiName('');
                          handleXpGained(10);
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {state.aiRoadmap.map((item) => {
                    const progressVal = item.progress ?? 0;
                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-colors border border-gray-150 space-y-3">
                        <div className="flex justify-between items-start gap-2.5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${
                                progressVal === 100 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-150'
                              }`}>
                                {progressVal}% Completed
                              </span>
                              <span className="bg-gray-200 text-gray-600 font-bold text-[8px] px-1.5 py-0.2 rounded-md uppercase tracking-wide">
                                {item.category}
                              </span>
                            </div>
                            <p className={`text-xs font-bold leading-relaxed mt-1.5 ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {item.name}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-gray-400 font-bold whitespace-nowrap">{item.hoursSpent}h logged</span>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${item.name}" from your AI Roadmap?`)) {
                                  removeAiRoadmapItem(item.id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                              title="Delete Roadmap Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar & Increment button */}
                        <div className="flex items-center gap-3.5 pt-1">
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                progressVal === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${progressVal}%` }} 
                            />
                          </div>
                          <button
                            onClick={() => {
                              const nextProgress = progressVal >= 100 ? 0 : progressVal + 10;
                              const updatedItem: RoadmapItem = {
                                ...item,
                                progress: nextProgress,
                                status: nextProgress === 100 ? 'completed' : 'pending',
                                hoursSpent: nextProgress === 0 ? 0 : item.hoursSpent + 1
                              };
                              updateAiRoadmap(updatedItem);
                              if (nextProgress === 100) {
                                handleXpGained(25, 'b-first-ai'); // Unlock badge trigger
                              } else {
                                handleXpGained(5);
                              }
                            }}
                            className="text-[10px] font-extrabold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
                            Progress +10%
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {state.aiRoadmap.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">No milestones here yet. Type above to add your first!</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: ENGLISH MASTER & ADVANCED GOV INTERVIEWS COACH */}
        {activeTab === 'english' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Elite Conversational Spoken English &amp; Interview Studio</h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Connect directly with the server-side Gemini system to practice daily conversations or specialized interviews (HR hiring, technical coding loops, or competitive banking / government examinations). Retrieve real-time phrasing optimizations, vocabulary expansions and spelling modifications.
              </p>
              <AICoaches onScoreUnlocked={(xp, badge) => handleXpGained(xp, badge)} />
            </div>
          </div>
        )}

        {/* TAB 5: FITNESS & SOCIAL GROOMING SYSTEM */}
        {activeTab === 'fitness' && (
          <FitnessComponent
            fitnessLog={state.fitnessLog}
            setFitnessLog={(next) => setState(prev => ({ ...prev, fitnessLog: typeof next === 'function' ? next(prev.fitnessLog) : next }))}
            workoutPlan={state.activeWorkoutPlan}
            setWorkoutPlan={(next) => setState(prev => ({ ...prev, activeWorkoutPlan: typeof next === 'function' ? next(prev.activeWorkoutPlan) : next }))}
            groomingRoutines={state.groomingRoutines}
            setGroomingRoutines={(next) => setState(prev => ({ ...prev, groomingRoutines: typeof next === 'function' ? next(prev.groomingRoutines) : next }))}
            onXpGained={(x) => handleXpGained(x)}
          />
        )}

        {/* TAB 6: ATS RESUME BUILDER & CAREER TRACKER */}
        {activeTab === 'career' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-3">ATS-optimizing CV Builder &amp; Career Pipeline</h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Build CV presets, audit drafts for technical missing keywords using Gemini evaluations, and instantly generate full-stack / AI project items for completion and copyable summaries.
              </p>
              <ATSResumeComponent
                atsResume={state.atsResume}
                setAtsResume={(next) => setState(prev => ({ ...prev, atsResume: typeof next === 'function' ? next(prev.atsResume) : next }))}
                jobApps={state.jobApplications}
                setJobApps={(next) => setState(prev => ({ ...prev, jobApplications: typeof next === 'function' ? next(prev.jobApplications) : next }))}
                onXpGained={(x) => handleXpGained(x, 'b-resume')}
              />
            </div>
          </div>
        )}

        {/* TAB 7: UBUNTU TERMINAL INSTRUCTION MANUAL */}
        {activeTab === 'ubuntu' && (
          <UbuntuGuides />
        )}

      </main>

      <footer className="bg-white border-t border-gray-150 py-8 text-center text-xs text-gray-500 font-semibold mt-12 bg-slate-50">
        <p>12-Month Life Transformation System © 2026. Prioritizing deep-work and quantifiable progression metrics.</p>
        <p className="text-[10px] text-gray-400 mt-1">Built with high fidelity React, Tailwind, and Google GenAI server modules.</p>
      </footer>

    </div>
  );
}
