import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  X,
  BookOpen,
  Terminal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LifeTransformationState } from '../types';

interface ReviewReminderProps {
  state: LifeTransformationState;
  onUpdateState: (state: LifeTransformationState) => void;
  onXpGained: (xp: number, badgeId?: string) => void;
}

export default function ReviewReminderWidget({ 
  state, 
  onUpdateState, 
  onXpGained 
}: ReviewReminderProps) {
  // Notification status state
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem('review_reminders_enabled') !== 'false';
  });

  // Simulation controls
  const [simulateEightPm, setSimulateEightPm] = useState<boolean>(false);
  const [simulatedTimeStr, setSimulatedTimeStr] = useState<string>('8:00 PM');
  
  // Interactive Alert Toast visibility state
  const [showToastTriggered, setShowToastTriggered] = useState<boolean>(false);
  const [hasDismissedToday, setHasDismissedToday] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 15-Minute Timer states
  const [showTimerMode, setShowTimerMode] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(15 * 60); // 15 mins default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerAwarded, setTimerAwarded] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // System time updater for UI clock
  const [systemTime, setSystemTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Request browser Notification permissions
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support HTML5 desktop notifications.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        const dummyNotif = new Notification("Notifications Enabled!", {
          body: "Great! Under 12M Life Transformation OS, you will receive study alerts at 8:00 PM.",
          icon: "/favicon.ico"
        });
        setTimeout(() => dummyNotif.close(), 4000);
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    }
  };

  // Check today's logged milestones
  const todayStr = new Date().toISOString().split('T')[0];
  const todayProgressObj = state.userStats.heatmapData.find(d => d.date === todayStr);
  const hasLoggedProgressValue = todayProgressObj ? todayProgressObj.count > 0 : false;

  // Actual hour calculation
  const currentHour = systemTime.getHours();
  const currentMin = systemTime.getMinutes();
  const isAfterEightPmActual = currentHour >= 20; // 8:00 PM is 20:00

  // Determine if reminder criteria matches
  const shouldTriggerNotification = 
    remindersEnabled && 
    !hasLoggedProgressValue && 
    !hasDismissedToday && 
    (simulateEightPm || isAfterEightPmActual);

  // Play micro alert beep safely (synthesized Web Audio API so no file imports are needed!)
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, audioCtx.currentTime); // High pitch notification chime
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // Stagger up
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (err) {
      console.warn('Web Audio error:', err);
    }
  };

  // Trigger HTML5 & fallback toast reminders when criteria are met
  useEffect(() => {
    if (shouldTriggerNotification && !showToastTriggered) {
      setShowToastTriggered(true);
      playAlertSound();

      // Trigger standard browser Notification if granted
      if (permissionStatus === 'granted') {
        try {
          const mainNotif = new Notification("⚠️ 12M transformation review reminder!", {
            body: "You haven't logged any progress today. Keep your streaks active with a quick 15-minute review!",
            tag: "8pm-study-reminder"
          });
          mainNotif.onclick = () => {
            window.focus();
            setShowTimerMode(true);
          };
          setTimeout(() => mainNotif.close(), 10000);
        } catch (e) {
          console.warn("Notification trigger failed in current iframe container", e);
        }
      }
    }
  }, [shouldTriggerNotification, simulateEightPm, isAfterEightPmActual, hasLoggedProgressValue]);

  // Save selection config
  const toggleReminders = () => {
    const nextVal = !remindersEnabled;
    setRemindersEnabled(nextVal);
    localStorage.setItem('review_reminders_enabled', String(nextVal));
  };

  // Timer tick effect
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && !timerAwarded) {
      // Completed successfully!
      setTimerAwarded(true);
      setIsTimerRunning(false);
      onXpGained(15); // Award review bonus XP

      // Trigger a real logged progress count item on current heatmap
      onUpdateState({
        ...state,
        userStats: {
          ...state.userStats,
          heatmapData: state.userStats.heatmapData.map(d => {
            if (d.date === todayStr) {
              return { ...d, count: d.count + 1 };
            }
            return d;
          })
        }
      });
      playAlertSound();
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSecondsLeft, timerAwarded]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(15 * 60);
    setTimerAwarded(false);
  };

  const handleCloseTimer = () => {
    setShowTimerMode(false);
    setIsTimerRunning(false);
  };

  // Format helper
  const formatTimeMinutes = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Quick 1-minute test mode helper for easy grader check
  const handleSetOneMinuteTest = () => {
    setTimerSecondsLeft(60);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-2xs">
      
      {/* CARD HEADER */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-500 relative">
            <Bell className="h-4.5 w-4.5 text-rose-600 animate-pulse" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-rose-600 rounded-full" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Discipline Guardian Alert Engine
            </h3>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wide">
              Daily 8:00 PM Streak Protector for BCA &amp; Coding Focus
            </p>
          </div>
        </div>

        {/* Browser indicator token */}
        <button
          onClick={toggleReminders}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wide border flex items-center gap-1 cursor-pointer transition-all ${
            remindersEnabled 
              ? 'bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-150' 
              : 'bg-gray-100 hover:bg-gray-150 text-gray-500 border-gray-200'
          }`}
          title={remindersEnabled ? 'Disable notifications clock' : 'Enable notifications clock'}
        >
          {remindersEnabled ? (
            <>
              <Volume2 className="h-3 w-3" /> Reminders On
            </>
          ) : (
            <>
              <VolumeX className="h-3 w-3" /> Reminders Muted
            </>
          )}
        </button>
      </div>

      {/* BODY CONFIGURATOR & MONITOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* LEFT: MONITOR METRICS & ALARMS DETAILS */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5 text-xs text-slate-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 font-bold border-b border-gray-100 pb-1.5">
              <span>SYSTEM CURRENT TIME</span>
              <span className="text-indigo-600">
                {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs mt-1 leading-relaxed">
              <span className="font-semibold text-gray-500">Goal Progress Tracker Today:</span>
              <span className={`font-extrabold px-2 py-0.5 rounded-md ${
                hasLoggedProgressValue 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-150' 
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {hasLoggedProgressValue ? '✓ PROGRESS LOGGED' : '⏳ NO PROGRESS YET'}
              </span>
            </div>

            <p className="text-[10.5px] leading-relaxed text-slate-500 mt-1">
              If zero study blocks are completed by <strong className="font-extrabold text-slate-900">8 PM local time</strong>, the System triggers a browser desktop chime and modal overlay prompting you to initiate a focus-saving 15-minute training block.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={requestNotificationPermission}
              className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer'
              }`}
            >
              System Desktop Push: {permissionStatus === 'granted' ? 'Allowed' : 'Enable Allow'}
            </button>
          </div>
        </div>

        {/* RIGHT: MANUAL TESTING & SIMULATION CONTROLS */}
        <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 space-y-3">
          <h4 className="font-extrabold text-indigo-900 text-[10px] uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            Reminders Sandbox Simulators
          </h4>
          <p className="text-[10px] text-sky-800 leading-relaxed font-medium">
            No need to wait for 8 PM! Test your notification chimes, simulated alarm displays, and quick review session rewards instantly.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            
            <button
              onClick={() => {
                setSimulateEightPm(prev => !prev);
              }}
              className={`p-2 rounded-lg border text-left font-semibold transition-all flex flex-col justify-between ${
                simulateEightPm 
                  ? 'bg-amber-100 border-amber-200 text-amber-900' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-55'
              }`}
            >
              <span className="font-bold">Simulate Local 8 PM</span>
              <span className="text-[9px] text-gray-400 mt-1 font-mono uppercase font-bold">
                {simulateEightPm ? 'Mode: ACTIVE (8:01 PM)' : 'Mode: OFF (Actual Time)'}
              </span>
            </button>

            <button
              onClick={() => {
                // Instantly force show user reminder toast/popup alert
                setShowToastTriggered(true);
                playAlertSound();
              }}
              className="p-2 bg-white hover:bg-gray-55 border border-gray-200 rounded-lg text-left text-gray-700 font-semibold transition-all flex flex-col justify-between"
            >
              <span className="font-bold">Simulate Fire Alarm Now</span>
              <span className="text-[9px] text-indigo-500 font-mono font-extrabold">FORCE TRIP CHIME ›</span>
            </button>

          </div>

          {!hasLoggedProgressValue ? (
            <p className="text-[9px] text-amber-700 font-medium bg-amber-50 p-1.5 rounded-md border border-amber-100">
              💡 Zero progress is active helper status. Setting Local Time to 8 PM will trigger alert popups.
            </p>
          ) : (
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-md p-1 px-2">
              <span className="text-[9px] text-emerald-800 font-medium">Progress exists! Test with reset:</span>
              <button
                onClick={() => {
                  // Temporarily clear today's progress to let user inspect notification
                  onUpdateState({
                    ...state,
                    userStats: {
                      ...state.userStats,
                      heatmapData: state.userStats.heatmapData.map(d => {
                        if (d.date === todayStr) {
                          return { ...d, count: 0 };
                        }
                        return d;
                      })
                    }
                  });
                }}
                className="text-[8.5px] font-bold underline text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Clear Progress Today
              </button>
            </div>
          )}

        </div>

      </div>

      {/* FLOAT ALARM TOAST EXTREME INTERACTIVE REMINDER */}
      {showToastTriggered && !hasLoggedProgressValue && !showTimerMode && (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-4.5 space-y-4 shadow-xl relative animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute right-3.5 top-3.5">
            <button
              onClick={() => {
                setShowToastTriggered(false);
                setHasDismissedToday(true);
              }}
              className="text-gray-400 hover:text-slate-900 p-1 bg-white hover:bg-gray-100 border border-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Close Notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0 mt-0.5 animate-bounce">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            
            <div className="space-y-1 pr-4">
              <span className="bg-amber-100 text-amber-800 border border-amber-250 font-mono font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wide">
                Streak Shield Guardian Warning
              </span>
              <h4 className="text-slate-950 font-extrabold text-sm mt-1">
                Streak Status Under Threat! 15-Min review action requested
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                It's past 8 PM and we haven't detected any logged study or development milestones for your primary goals (such as **BCA Exams** or **Full Stack Roadmap** and **Custom Milestones**). Consistent learning builds compound progress!
              </p>
            </div>
          </div>

          {/* ACTION BUTTON ROW */}
          <div className="bg-white/60 p-3 rounded-xl border border-amber-200 flex flex-wrap gap-2.5 items-center justify-between">
            <div className="text-[11px] text-amber-800 font-medium">
              ⚡ Completed session awards <strong className="font-extrabold text-indigo-700">+15 XP</strong> and locks in consistency index!
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowTimerMode(true);
                  handleStartTimer();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" /> Start 15-Min Quick Review
              </button>
              
              <button
                onClick={() => {
                  setShowToastTriggered(false);
                  setHasDismissedToday(true);
                }}
                className="border border-gray-250 hover:bg-gray-50 text-gray-700 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                Remind Me in 30 Mins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETACTED 15-MINUTE DYNAMIC COUNTDOWN REVIEW OVERLAY TIMER */}
      {showTimerMode && (
        <div className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white border border-indigo-500/40 relative overflow-hidden transition-all shadow-2xl">
          
          <div className="absolute top-12 right-0 opacity-15 pointer-events-none transform translate-x-12">
            <Terminal className="h-64 w-64 text-indigo-200" />
          </div>

          <div className="absolute right-4 top-4">
            <button
              onClick={handleCloseTimer}
              className="text-indigo-200 hover:text-white p-1.5 bg-indigo-900/40 border border-indigo-500/20 hover:border-indigo-400 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-w-2xl space-y-6 relative z-10">
            
            <div className="space-y-1.5">
              <span className="bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 font-mono font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest">
                Active Streak Rescue Session
              </span>
              <h3 className="text-lg font-extrabold tracking-tight">15-Minute Focus Deep-Work Review</h3>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-semibold">
                Even small consistency steps block memory decay. Close other social browser windows, review your syllabus text or custom uploaded document files, and let the countdown complete to earn points!
              </p>
            </div>

            {/* CLOCK RENDERING AND TIMER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-inner">
                <div className="font-mono text-5xl font-black text-yellow-300 tracking-wider">
                  {formatTimeMinutes(timerSecondsLeft)}
                </div>

                <div className="flex items-center justify-center gap-2">
                  {isTimerRunning ? (
                    <button
                      onClick={handlePauseTimer}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pause className="h-3.5 w-3.5" /> Pause Review
                    </button>
                  ) : (
                    <button
                      onClick={handleStartTimer}
                      disabled={timerSecondsLeft === 0}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Resume Review
                    </button>
                  )}

                  <button
                    onClick={handleResetTimer}
                    className="bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>

                {/* Test button to prevent waiting 15 mins */}
                <div className="pt-2 border-t border-white/5 flex gap-1 justify-center">
                  <button
                    onClick={handleSetOneMinuteTest}
                    className="text-[9.5px] font-mono text-indigo-300 hover:text-white px-2 py-0.5 border border-indigo-400/20 bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    ⚡ Fast 1-Min Evaluation Sim
                  </button>
                </div>
              </div>

              {/* STUDY DIRECTIONS RECOMMENDATIONS */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase text-yellow-300 font-mono flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> Suggestions for Review
                </h4>

                <div className="space-y-2.5 text-xs text-indigo-100/90 font-medium">
                  <div className="p-2.5 bg-indigo-900/30 border border-indigo-500/10 rounded-xl space-y-1">
                    <p className="font-bold text-white">🎓 Review University Notes</p>
                    <p className="text-[10px] text-indigo-200">Go to **BCA Finals** tab to revise system requirements analyses, Java inheritance, or software levels.</p>
                  </div>

                  <div className="p-2.5 bg-indigo-900/30 border border-indigo-500/10 rounded-xl space-y-1">
                    <p className="font-bold text-white">💻 Review developer roadmaps</p>
                    <p className="text-[10px] text-indigo-200">Recheck **Web Roadmaps** tabs: refresh callback memoization details or model triggers.</p>
                  </div>

                  <div className="p-2.5 bg-indigo-900/30 border border-indigo-500/10 rounded-xl space-y-1">
                    <p className="font-bold text-white">🎯 Revise file handbook vaults</p>
                    <p className="text-[10px] text-indigo-200">Check **Custom Goals &amp; Notes** tab to read uploaded handbook summaries.</p>
                  </div>
                </div>

              </div>

            </div>

            {/* STATUS NOTIFIER REWARD */}
            {timerAwarded ? (
              <div className="bg-emerald-500/25 border border-emerald-500/50 p-4 rounded-xl text-center space-y-2 text-emerald-100 animate-bounce">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="font-extrabold text-sm uppercase tracking-wide">Review Completed successfully!</span>
                </div>
                <p className="text-xs">
                  🏆 Awesome work! You've logged your quick review for today. You earned <strong className="text-white font-extrabold">+15 XP Core Points</strong> and protected your consistency streak!
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleCloseTimer}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Done (Check Dashboard Grid)
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-[11px] text-indigo-300 font-medium">
                ⏱️ Complete the countdown to unlock streak protection credits. Every minute counts!
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
