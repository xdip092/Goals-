import React, { useState, useRef } from 'react';
import { CustomGoal, GoalNote } from '../types';
import { 
  Lock, 
  Unlock, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Upload, 
  Calendar, 
  Award, 
  Sparkles, 
  AlertCircle, 
  BookOpen, 
  Heart, 
  Gamepad2, 
  ArrowRight,
  Eye,
  FileCode,
  Check
} from 'lucide-react';

interface GoalsNotesComponentProps {
  goals: CustomGoal[];
  onUpdateGoals: (goals: CustomGoal[]) => void;
  onXpGained?: (xp: number, badgeId?: string) => void;
}

export default function GoalsNotesComponent({ 
  goals = [], 
  onUpdateGoals, 
  onXpGained 
}: GoalsNotesComponentProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => {
    return goals.length > 0 ? goals[0].id : '';
  });

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Career');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('2026-07-31');

  // New manual note states
  const [manualNoteTitle, setManualNoteTitle] = useState('');
  const [manualNoteContent, setManualNoteContent] = useState('');
  
  // File upload state & Drag/Drop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Selected note for full-text overlay preview
  const [previewNote, setPreviewNote] = useState<GoalNote | null>(null);

  // Check if all goals are completed
  const allGoalsFinished = goals.length > 0 && goals.every(g => g.status === 'completed');
  const noGoalsAtAll = goals.length === 0;
  
  // Locking criteria: If there is at least one goal, and it is pending, goal changes are LOCKED
  const isGoalEditingLocked = !noGoalsAtAll && !allGoalsFinished;

  // Selected goal
  const currentGoal = goals.find(g => g.id === selectedGoalId) || goals[0] || null;

  // Toggle goal status
  const handleToggleGoal = (goalId: string) => {
    const nextGoals = goals.map(g => {
      if (g.id === goalId) {
        const nextStatus = g.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed' && onXpGained) {
          // Reward user for completion
          onXpGained(75, 'b-all-completed-custom');
        }
        return { ...g, status: nextStatus as 'pending' | 'completed' };
      }
      return g;
    });
    onUpdateGoals(nextGoals);
  };

  // Add a new goal (Only possible if unlocked or no goals exist)
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGoalEditingLocked) return;

    if (!newGoalTitle.trim()) {
      alert("Please specify a goal title");
      return;
    }

    const newGoal: CustomGoal = {
      id: `cg-${Date.now()}`,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      targetDate: newGoalTargetDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: []
    };

    const nextGoals = [...goals, newGoal];
    onUpdateGoals(nextGoals);
    setSelectedGoalId(newGoal.id);
    setNewGoalTitle('');
    if (onXpGained) onXpGained(15);
  };

  // Delete goal
  const handleDeleteGoal = (goalId: string) => {
    if (isGoalEditingLocked) {
      alert("Goal locking is active. Complete your current target goals first!");
      return;
    }
    if (confirm("Are you sure you want to delete this goal and its associated notes?")) {
      const nextGoals = goals.filter(g => g.id !== goalId);
      onUpdateGoals(nextGoals);
      if (nextGoals.length > 0) {
        setSelectedGoalId(nextGoals[0].id);
      } else {
        setSelectedGoalId('');
      }
    }
  };

  // Write manual note
  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGoal) {
      alert("Please select or create a goal first before writing notes!");
      return;
    }
    if (!manualNoteTitle.trim() || !manualNoteContent.trim()) {
      alert("Please provide both a title and some note body content.");
      return;
    }

    const newNote: GoalNote = {
      id: `n-${Date.now()}`,
      name: manualNoteTitle.endsWith('.txt') ? manualNoteTitle.trim() : `${manualNoteTitle.trim()}.txt`,
      content: manualNoteContent.trim(),
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updatedGoals = goals.map(g => {
      if (g.id === currentGoal.id) {
        return {
          ...g,
          notes: [...g.notes, newNote]
        };
      }
      return g;
    });

    onUpdateGoals(updatedGoals);
    setManualNoteTitle('');
    setManualNoteContent('');
    if (onXpGained) onXpGained(10);
  };

  // Handle uploaded file core reader
  const processUploadedFile = (file: File) => {
    if (!currentGoal) {
      setUploadError("Please select an active goal first!");
      return;
    }

    // Accepting common text-based file structures
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const newNote: GoalNote = {
          id: `n-upload-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          content: text,
          uploadedAt: new Date().toISOString().split('T')[0]
        };

        const updatedGoals = goals.map(g => {
          if (g.id === currentGoal.id) {
            return {
              ...g,
              notes: [...g.notes, newNote]
            };
          }
          return g;
        });

        onUpdateGoals(updatedGoals);
        setUploadError(null);
        if (onXpGained) onXpGained(20); // Bonus for actual file analysis
      } else {
        setUploadError("Unable to read this file type text content.");
      }
    };

    fileReader.onerror = () => {
      setUploadError("Error reading the file.");
    };

    fileReader.readAsText(file);
  };

  // Manual select file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  // Delete note
  const handleDeleteNote = (goalId: string, noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      const updatedGoals = goals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            notes: g.notes.filter(n => n.id !== noteId)
          };
        }
        return g;
      });
      onUpdateGoals(updatedGoals);
    }
  };

  // Reset all goals completely (Only unlocked when empty or all completed)
  const handleResetAllGoals = () => {
    if (isGoalEditingLocked) {
      alert("Locked! You must complete your current goals before resetting.");
      return;
    }
    if (confirm("This will erase all current goals and their associated notes. Do you want to continue?")) {
      onUpdateGoals([]);
      setSelectedGoalId('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER EXPLANATORY ROW */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
          <Sparkles className="h-64 w-64 text-indigo-100 animate-pulse" />
        </div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 font-mono font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Discipline Guardian System V2
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Active Goals &amp; Structured Curriculum Notes</h1>
          <p className="text-xs md:text-sm text-indigo-200/90 leading-relaxed font-medium">
            Define your custom transformation aims, organize academic text Handbooks or developer notes inside them, and upload key references. To enforce deep-work focus and prevent decision fatigue, **Goal Customization locks** until your current set of target goals are completed!
          </p>
        </div>

        {/* GUARDIAN STATUS BANNER */}
        <div className="mt-6 border-t border-indigo-800/60 pt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isGoalEditingLocked ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isGoalEditingLocked ? <Lock className="h-5 w-5 animate-bounce" /> : <Unlock className="h-5 w-5 text-emerald-400" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Goal Lock Status: {isGoalEditingLocked ? 'LOCKED (Commit Mode)' : 'UNLOCKED (Customization Mode)'}
              </p>
              <p className="text-[11px] text-indigo-300">
                {isGoalEditingLocked 
                  ? "Finish all current active goals to enable editing or creating new ones." 
                  : "All goals completed! You are free to declare brand new targets."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isGoalEditingLocked && goals.length > 0 && (
              <button
                onClick={handleResetAllGoals}
                className="bg-red-500/10 hover:bg-red-500/25 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear/Reset Goal Slate
              </button>
            )}
            <span className="bg-white/10 text-white font-mono text-xs px-3 py-1 rounded-lg font-bold">
              Active Goals: {goals.filter(g => g.status === 'pending').length} • Completed: {goals.filter(g => g.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: GOAL MANAGER & COMMITTER (LOCKED IF PENDING GOALS EXIST) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* THE GUARDIAN FORM CARD */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-600" />
                Declare Active Goal
              </h2>
              {isGoalEditingLocked ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Lock Engaged
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-250 flex items-center gap-1">
                  <Unlock className="h-3 w-3" /> Ready
                </span>
              )}
            </div>

            {isGoalEditingLocked ? (
              <div className="bg-amber-50 border border-amber-150 p-3.5 rounded-xl text-amber-900 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-semibold">
                    <span className="font-extrabold">Active Goal Lock active!</span> Changing or setting alternative goals is locked until your current outstanding items are finished. Focus leads to execution!
                  </p>
                </div>
                <div className="text-[10px] bg-white/60 border border-amber-200/50 p-2 rounded-lg font-medium">
                  💡 <span className="font-bold">How to unlock:</span> Simply mark each checklist goal below as completed (100% finished) to switch milestones.
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddGoal} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Goal Focus Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scor 90% in BCA Software Testing"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Category</label>
                    <select
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 focus:bg-white focus:ring-1 focus:ring-indigo-600 outline-none"
                    >
                      <option value="Career">Career &amp; Jobs</option>
                      <option value="BCA Study">BCA Academic</option>
                      <option value="Generative AI">Generative AI</option>
                      <option value="Spoken English">Spoken English</option>
                      <option value="Fitness &amp; Health">Fitness &amp; Looks</option>
                      <option value="Other">Custom Target</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Target Date</label>
                    <input
                      type="date"
                      value={newGoalTargetDate}
                      onChange={(e) => setNewGoalTargetDate(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Commit New Goal
                </button>
              </form>
            )}
          </div>

          {/* ACTIVE GOALS INTERACTIVE LIST */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide text-gray-500">
              Active Commited Milestones
            </h3>

            {goals.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-gray-400 font-semibold">Your goal roster is clean.</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">Declare your first core learning or transformation target above to start tracking notes and materials!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((g) => {
                  const isSelected = g.id === selectedGoalId;
                  const isCompleted = g.status === 'completed';
                  return (
                    <div 
                      key={g.id}
                      onClick={() => setSelectedGoalId(g.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected 
                          ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs ring-1 ring-indigo-100/50' 
                          : 'bg-gray-50/50 border-gray-150 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleGoal(g.id);
                            }}
                            className="mt-0.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                          >
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'bg-white border-gray-300 hover:border-indigo-500'
                            }`}>
                              {isCompleted && <Check className="h-3 w-3 stroke-[3px]" />}
                            </div>
                          </button>

                          <div className="space-y-0.5">
                            <p className={`text-xs font-bold leading-relaxed ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 font-extrabold'}`}>
                              {g.title}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-gray-200 text-gray-600 font-bold text-[8px] px-1.5 py-0.2 rounded-md uppercase tracking-wide">
                                {g.category}
                              </span>
                              <span className="text-[9.5px] text-gray-400 font-mono font-bold flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {g.targetDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lock / Unlock or trash */}
                        {!isGoalEditingLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(g.id);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove Goal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Notes count badge */}
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-400 border-t border-gray-100 pt-2 bg-transparent">
                        <span>Stored Documents: <strong className="text-indigo-600 font-bold">{g.notes.length}</strong></span>
                        {isSelected && <span className="text-indigo-600 font-extrabold flex items-center gap-0.5 animate-pulse">Viewing File Vault <ArrowRight className="h-2.5 w-2.5" /></span>}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: NOTES UPLOADER & THE CURRICULUM FILE VAULT */}
        <div className="lg:col-span-7 space-y-6">
          
          {currentGoal ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-6 shadow-2xs">
              
              {/* CURRENT SELECTED GOAL INFO */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="bg-indigo-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wide">
                    Target Vault File Folder
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{currentGoal.title}</h3>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    currentGoal.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentGoal.status === 'completed' ? '✓ Mastered' : '⏳ In Progress'}
                  </span>
                </div>
              </div>

              {/* UPLOAD PANEL & DRAG-AND-DROP ZONE */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wide text-gray-500">
                  Upload Notes or Document Assets
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Option A: Drag/Drop actual local TXT/JSON/CODE note files */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col justify-center items-center space-y-2 ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50/50 scale-98' 
                        : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".txt,.json,.js,.ts,.html,.css,.md"
                    />
                    <div className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-400 group-hover:text-indigo-600">
                      <Upload className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Drag &amp; Drop Note File</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">or click to browse local storage</p>
                    </div>
                    <span className="text-[8px] font-mono text-gray-400">Accepts .txt, .json, .md, code files</span>
                  </div>

                  {/* Option B: Add text manually right now */}
                  <form onSubmit={handleAddManualNote} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Note Title (e.g., Software Security Notes)"
                      value={manualNoteTitle}
                      onChange={(e) => setManualNoteTitle(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-800 bg-gray-55 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                    <textarea
                      placeholder="Type or paste your handbook notes content here..."
                      value={manualNoteContent}
                      onChange={(e) => setManualNoteContent(e.target.value)}
                      rows={2}
                      className="w-full text-[11px] font-medium text-gray-700 bg-gray-55 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-600 outline-none resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Save Written Note
                    </button>
                  </form>

                </div>

                {uploadError && (
                  <p className="text-[10.5px] font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                    ⚠️ {uploadError}
                  </p>
                )}
              </div>

              {/* SAVED CURRICULUM NOTES ACCORDING TO THIS GOAL */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-gray-950 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2">
                  Stored Note Files Vault ({currentGoal.notes.length})
                </h4>

                {currentGoal.notes.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-250">
                    <p className="text-xs text-gray-400 font-semibold">No documents stored in this goal vault.</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Drag-and-drop or write handbooks to enable future revision models.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentGoal.notes.map((note) => (
                      <div 
                        key={note.id} 
                        className="p-3 bg-white border border-gray-150 hover:border-gray-350 rounded-xl space-y-2.5 shadow-2xs flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                              <FileText className="h-4 w-4" />
                            </span>
                            <div className="max-w-[150px] truncate">
                              <h5 className="text-[11.5px] font-extrabold text-gray-800 truncate" title={note.name}>
                                {note.name}
                              </h5>
                              <p className="text-[9px] font-mono text-gray-400 font-bold">{note.uploadedAt}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteNote(currentGoal.id, note.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Text summary snippet */}
                        <p className="text-[10.5px] text-gray-500 line-clamp-3 leading-relaxed font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {note.content}
                        </p>

                        <button
                          onClick={() => setPreviewNote(note)}
                          className="w-full py-1.5 text-center text-[10px] uppercase tracking-wide font-extrabold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> Read Full Document
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center shadow-2xs space-y-3.5">
              <div className="inline-flex p-4 rounded-full bg-indigo-50 text-indigo-600">
                <BookOpen className="h-8 w-8 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-gray-900 font-bold text-sm">Select a Committed Transformation Goal</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Choose one of your scheduled goal cards on the left navigation to open its notes vault, write training checklists, or drag-and-drop handbook resources dynamically!
              </p>
            </div>
          )}

        </div>

      </div>

      {/* FULL-TEXT READER PREVIEW MODAL OVERLAY */}
      {previewNote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-150 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal header */}
            <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileCode className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold truncate max-w-[350px]">{previewNote.name}</h4>
                  <p className="text-[10px] font-mono text-gray-400">Published on {previewNote.uploadedAt}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewNote(null)}
                className="text-gray-400 hover:text-white text-xs font-extrabold uppercase bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Note text view pane */}
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-xs md:text-sm text-gray-800 leading-relaxed font-medium bg-slate-50">
              {previewNote.content}
            </div>

            {/* Modal footer */}
            <div className="border-t border-gray-150 p-4 bg-white flex justify-end gap-3.5">
              <button
                onClick={() => {
                  try {
                    const blob = new Blob([previewNote.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = previewNote.name;
                    link.click();
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error("Downloader err", e);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Export / Download TXT
              </button>
              <button 
                onClick={() => setPreviewNote(null)}
                className="border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
