import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Compass, 
  Cpu, 
  BookOpen, 
  Activity, 
  Flame,
  Volume2,
  RefreshCw,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { LifeTransformationState, SubjectTrack, RoadmapItem, GovExamSection } from '../types';

interface DailyFocusCardProps {
  state: LifeTransformationState;
  onUpdateState: (state: LifeTransformationState) => void;
  onXpGained: (xp: number, badgeId?: string) => void;
}

export default function DailyFocusCard({
  state,
  onUpdateState,
  onXpGained
}: DailyFocusCardProps) {
  const [activeManualCategory, setActiveManualCategory] = useState<'auto' | 'bca' | 'fullstack' | 'ai' | 'gov'>('auto');
  const [xpChimeOn, setXpChimeOn] = useState<boolean>(true);
  
  // Interactive mini 15-minute timer states specific to this focus target
  const [focusTimerSeconds, setFocusTimerSeconds] = useState<number>(15 * 60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [focusTimerCompleted, setFocusTimerCompleted] = useState<boolean>(false);

  // Sound generator
  const playFocusCompleteChime = (success: boolean) => {
    if (!xpChimeOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      if (success) {
        // High double success chime
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.6);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.61);
      } else {
        // Simple tick
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      console.warn('Web Audio check fail:', e);
    }
  };

  // Keep timer ticking
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && focusTimerSeconds > 0) {
      interval = setInterval(() => {
        setFocusTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (focusTimerSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
      setFocusTimerCompleted(true);
      playFocusCompleteChime(true);
      onXpGained(20); // Focus session XP block reward!
    }
    return () => clearInterval(interval);
  }, [isTimerActive, focusTimerSeconds]);

  // DERIVE TASK METHODOLOGY:
  // Calculate average scores of vectors
  
  // 1. BCA
  const bcaSum = state.bcaSubjects.reduce((acc, s) => {
    const totalL = s.notes.length || 5;
    const arr = s.unitProgress && s.unitProgress.length === totalL ? s.unitProgress : Array(totalL).fill(0);
    return acc + (arr.reduce((sum, p) => sum + p, 0) / totalL);
  }, 0);
  const bcaAvg = Math.round(bcaSum / state.bcaSubjects.length);

  // 2. Fullstack
  const fsTotal = state.fullStackRoadmap.reduce((acc, r) => acc + (r.progress ?? 0), 0);
  const fsPct = state.fullStackRoadmap.length > 0 ? Math.round(fsTotal / state.fullStackRoadmap.length) : 0;

  // 3. AI
  const aiTotal = state.aiRoadmap.reduce((acc, r) => acc + (r.progress ?? 0), 0);
  const aiPct = state.aiRoadmap.length > 0 ? Math.round(aiTotal / state.aiRoadmap.length) : 0;

  // 4. Gov Prep
  const rrbAvg = state.rrbPrep.length > 0 ? Math.round(state.rrbPrep.reduce((acc, s) => acc + s.progress, 0) / state.rrbPrep.length) : 0;

  // Determine lagging category
  const categoriesList = [
    { key: 'bca', name: 'BCA Semester Finals', score: bcaAvg, icon: '🎓' },
    { key: 'fullstack', name: 'Full Stack Web Roadmap', score: fsPct, icon: '💻' },
    { key: 'ai', name: 'Generative AI Systems', score: aiPct, icon: '🤖' },
    { key: 'gov', name: 'Government Exams Prep', score: rrbAvg, icon: '🏛️' }
  ];

  // Auto-calculated lowest sorting vector
  const lowestCategoryObj = [...categoriesList].sort((a, b) => a.score - b.score)[0] || categoriesList[0];
  
  const chosenCategoryKey = activeManualCategory === 'auto' ? lowestCategoryObj.key : activeManualCategory;
  const chosenCategoryName = categoriesList.find(c => c.key === chosenCategoryKey)?.name || lowestCategoryObj.name;
  const chosenCategoryIcon = categoriesList.find(c => c.key === chosenCategoryKey)?.icon || lowestCategoryObj.icon;
  const chosenCategoryScore = categoriesList.find(c => c.key === chosenCategoryKey)?.score ?? 0;

  // Find corresponding specific lagging tasks or units
  let derivedTaskLabel = '';
  let derivedTaskDetail = '';
  let actionType: 'bca_progress' | 'roadmap_progress' | 'gov_progress' = 'roadmap_progress';
  let targetItemId = ''; // specific reference to mutate
  let targetSubIndex = 0; // if unit progress

  if (chosenCategoryKey === 'bca') {
    // Find subject with lowest average
    const lowestBcaSubject = [...state.bcaSubjects].sort((a, b) => {
      const aArr = a.unitProgress || [];
      const bArr = b.unitProgress || [];
      const aS = aArr.reduce((x, y) => x + y, 0);
      const bS = bArr.reduce((x, y) => x + y, 0);
      return aS - bS;
    })[0] || state.bcaSubjects[0];

    // Find the first unit with < 100% progress
    let targetUnitIdx = 0;
    if (lowestBcaSubject) {
      const idx = (lowestBcaSubject.unitProgress || []).findIndex(p => p < 100);
      targetUnitIdx = idx !== -1 ? idx : 0;
      const unitName = lowestBcaSubject.notes[targetUnitIdx] || `Unit ${targetUnitIdx + 1}`;
      
      derivedTaskLabel = `Study ${lowestBcaSubject.name}: ${unitName}`;
      derivedTaskDetail = `This topic stands at ${(lowestBcaSubject.unitProgress || [])[targetUnitIdx] || 0}% progress. Study this module for 15 minutes to increase your final semester margins.`;
      actionType = 'bca_progress';
      targetItemId = lowestBcaSubject.id;
      targetSubIndex = targetUnitIdx;
    }
  } else if (chosenCategoryKey === 'fullstack') {
    // Find first incomplete roadmap task
    const incompleteFs = state.fullStackRoadmap.find(r => r.status !== 'completed' || r.progress < 100) || state.fullStackRoadmap[0];
    if (incompleteFs) {
      derivedTaskLabel = `Code Stack Step: ${incompleteFs.name}`;
      derivedTaskDetail = `Core Full Stack requirement. Current status: ${incompleteFs.status} (${incompleteFs.progress}% overall). Setup custom hooks, schema templates, or local routing endpoints.`;
      actionType = 'roadmap_progress';
      targetItemId = incompleteFs.id;
    } else {
      derivedTaskLabel = `Design frontend code variations`;
      derivedTaskDetail = `Generate responsive UI mocks and refine Tailwind typography values.`;
    }
  } else if (chosenCategoryKey === 'ai') {
    // Find first incomplete AI roadmap task
    const incompleteAi = state.aiRoadmap.find(r => r.status !== 'completed' || r.progress < 100) || state.aiRoadmap[0];
    if (incompleteAi) {
      derivedTaskLabel = `Integrate AI Component: ${incompleteAi.name}`;
      derivedTaskDetail = `Build robust system architectures with @google/genai. Current step: "${incompleteAi.name}" standing at ${incompleteAi.progress}% confidence levels.`;
      actionType = 'roadmap_progress';
      targetItemId = incompleteAi.id;
    } else {
      derivedTaskLabel = `Revise Prompt engineering concepts`;
      derivedTaskDetail = `Examine system instructions or zero-shot prompt heuristics to optimize agents.`;
    }
  } else if (chosenCategoryKey === 'gov') {
    // Find first lagging section
    const laggingGov = [...state.rrbPrep].sort((a, b) => a.progress - b.progress)[0] || state.rrbPrep[0];
    if (laggingGov) {
      derivedTaskLabel = `Practice Gov Exam Module: ${laggingGov.name}`;
      derivedTaskDetail = `Preparation level is currently low at ${laggingGov.progress}%. Revise key syllabus formulas, diagnostic rules, or speed run checklists.`;
      actionType = 'gov_progress';
      targetItemId = laggingGov.id;
    } else {
      derivedTaskLabel = `Test current mental accuracy models`;
      derivedTaskDetail = `Solve 5 quantitative aptitude questions under simulated time pressure.`;
    }
  }

  // Handle Dynamic completion
  const handleMarkFocusComplete = () => {
    let updatedHeatmap = [...state.userStats.heatmapData];
    const todayStr = new Date().toISOString().split('T')[0];
    updatedHeatmap = updatedHeatmap.map(d => {
      if (d.date === todayStr) {
        return { ...d, count: d.count + 1 };
      }
      return d;
    });

    let nextBca = [...state.bcaSubjects];
    let nextFs = [...state.fullStackRoadmap];
    let nextAi = [...state.aiRoadmap];
    let nextRrb = [...state.rrbPrep];

    // Mutate the specific derived target in real time
    if (actionType === 'bca_progress') {
      nextBca = state.bcaSubjects.map(sub => {
        if (sub.id === targetItemId) {
          const nextArr = [...(sub.unitProgress || [0,0,0,0,0])];
          nextArr[targetSubIndex] = 100; // Unlock full completion
          return { ...sub, unitProgress: nextArr };
        }
        return sub;
      });
    } else if (actionType === 'roadmap_progress') {
      // Check fullstack roadmap first
      const hasFs = state.fullStackRoadmap.some(r => r.id === targetItemId);
      if (hasFs) {
        nextFs = state.fullStackRoadmap.map(item => {
          if (item.id === targetItemId) {
            return { ...item, status: 'completed' as const, progress: 100, hoursSpent: (item.hoursSpent || 0) + 1 };
          }
          return item;
        });
      } else {
        nextAi = state.aiRoadmap.map(item => {
          if (item.id === targetItemId) {
            return { ...item, status: 'completed' as const, progress: 100, hoursSpent: (item.hoursSpent || 0) + 1 };
          }
          return item;
        });
      }
    } else if (actionType === 'gov_progress') {
      nextRrb = state.rrbPrep.map(sec => {
        if (sec.id === targetItemId) {
          return { ...sec, progress: Math.min(100, sec.progress + 25) };
        }
        return sec;
      });
    }

    // Update state & save
    onUpdateState({
      ...state,
      bcaSubjects: nextBca,
      fullStackRoadmap: nextFs,
      aiRoadmap: nextAi,
      rrbPrep: nextRrb,
      userStats: {
        ...state.userStats,
        heatmapData: updatedHeatmap
      }
    });

    // Award big core focus XP points
    onXpGained(30);
    playFocusCompleteChime(true);
    
    // Reset timer state
    setFocusTimerSeconds(15 * 60);
    setIsTimerActive(false);
    setFocusTimerCompleted(true);

    // Briefly alert user
    alert(`🎉 Brilliant! You completed the focus task:\n"${derivedTaskLabel}"\n\n+30 XP awarded! Under-performing indicators have been elevated automatically in your dashboards.`);
  };

  const formatTimerDigits = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 rounded-2xl border-2 border-indigo-200/65 p-5.5 space-y-4 shadow-xs relative overflow-hidden">
      
      {/* Decorative ambient gradient circle */}
      <div className="absolute -right-16 -top-16 h-36 w-36 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

      {/* CARD HEADER DETAILS */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-indigo-150 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Target className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-[13px] uppercase tracking-wider flex items-center gap-1.5">
              Current Anti-Overload Daily Focus
              <span className="bg-indigo-600 text-[9px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
                Single Item
              </span>
            </h3>
            <p className="text-[10.5px] text-indigo-800 font-semibold">
              Lag-derived priority block based on continuous preparation indexes
            </p>
          </div>
        </div>

        {/* Chime audio control */}
        <button
          onClick={() => setXpChimeOn(!xpChimeOn)}
          className={`px-2 py-1 rounded-lg text-[9px] font-mono tracking-wider font-bold uppercase border cursor-pointer transition-colors flex items-center gap-1 ${
            xpChimeOn ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-400 border-gray-200'
          }`}
          title={xpChimeOn ? 'Mute synthesized sound effects' : 'Enable sound effect chimes'}
        >
          <Volume2 className="h-3 w-3" /> Chime: {xpChimeOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* CRITERIA TOGGLES & AUTOMATION OVERRIDE */}
      <div className="flex flex-wrap items-center gap-1.5 bg-indigo-100/40 p-1 rounded-xl border border-indigo-150 text-[10.5px]">
        <span className="px-2 font-bold text-indigo-900 uppercase tracking-widest text-[9.5px]">Query Vector:</span>
        <button
          onClick={() => { setActiveManualCategory('auto'); playFocusCompleteChime(false); }}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeManualCategory === 'auto' ? 'bg-indigo-600 text-white shadow-3xs' : 'text-indigo-800 hover:bg-white/50'
          }`}
        >
          🤖 Lag Auto-Detect
        </button>
        <button
          onClick={() => { setActiveManualCategory('bca'); playFocusCompleteChime(false); }}
          className={`px-2 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
            activeManualCategory === 'bca' ? 'bg-indigo-600 text-white shadow-3xs font-bold' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          🎓 BCA Exams ({bcaAvg}%)
        </button>
        <button
          onClick={() => { setActiveManualCategory('fullstack'); playFocusCompleteChime(false); }}
          className={`px-2 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
            activeManualCategory === 'fullstack' ? 'bg-indigo-600 text-white shadow-3xs font-bold' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          💻 Web Roadmap ({fsPct}%)
        </button>
        <button
          onClick={() => { setActiveManualCategory('ai'); playFocusCompleteChime(false); }}
          className={`px-2 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
            activeManualCategory === 'ai' ? 'bg-indigo-600 text-white shadow-3xs' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          🤖 GenAI ({aiPct}%)
        </button>
        <button
          onClick={() => { setActiveManualCategory('gov'); playFocusCompleteChime(false); }}
          className={`px-2 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
            activeManualCategory === 'gov' ? 'bg-indigo-600 text-white shadow-3xs' : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          🏛️ Gov Prep ({rrbAvg}%)
        </button>
      </div>

      {/* DYNAMICAL DERIVED TARGET ITEM PANEL */}
      <div className="p-4 bg-white rounded-xl border border-indigo-150 shadow-3xs space-y-3.5">
        
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xl leading-none">{chosenCategoryIcon}</span>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider font-mono">
                Lag Index Lagging: {chosenCategoryName} ({chosenCategoryScore}% complete)
              </span>
            </div>

            <h4 className="text-slate-950 font-black text-sm md:text-base leading-tight">
              {derivedTaskLabel}
            </h4>
          </div>

          <div className="bg-amber-50 rounded-lg p-1 px-2 border border-amber-200 text-right shrink-0">
            <span className="text-[8.5px] font-bold text-amber-700 uppercase block font-mono">Completing awards</span>
            <span className="text-xs font-black text-amber-900 font-mono">+30 XP</span>
          </div>
        </div>

        <p className="text-[11.5px] text-slate-600 leading-relaxed font-semibold">
          {derivedTaskDetail}
        </p>

        {/* INTERACTIVE MINI COUNTDOWN TIMER */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-center gap-3 border border-slate-800">
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-300 animate-pulse" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mini 15-Minute Commitment Study Timer</p>
              <p className="font-mono font-black text-lg text-yellow-300 tracking-wider">
                {formatTimerDigits(focusTimerSeconds)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
            {isTimerActive ? (
              <button
                onClick={() => {
                  setIsTimerActive(false);
                  playFocusCompleteChime(false);
                }}
                className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Hold
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsTimerActive(true);
                  playFocusCompleteChime(false);
                }}
                className="flex-1 sm:flex-initial bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Commit 15m
              </button>
            )}

            <button
              onClick={() => {
                setFocusTimerSeconds(60); // fast track eval
                playFocusCompleteChime(false);
              }}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-705 border border-slate-700 rounded-lg text-[9px] text-indigo-300 font-semibold cursor-pointer"
              title="Skip to 1 minute for grading validation"
            >
              ⚡ Fast check (1m)
            </button>
          </div>

        </div>

        {/* SYSTEM ACTION COMPLETE TRIGGERS */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Eliminate multitasking. Complete this 1 study block to prevent neural tiredness.</span>
          </div>

          <button
            onClick={handleMarkFocusComplete}
            className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 text-emerald-300" />
            Lock In Progress Done!
          </button>
        </div>

      </div>

    </div>
  );
}
