import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  Search, 
  BookMarked,
  Sparkles,
  Volume2,
  BookmarkCheck,
  Award,
  ArrowRight,
  Info
} from 'lucide-react';
import { LifeTransformationState, Flashcard } from '../types';

interface RevisionFlashcardDeckProps {
  flashcards: Flashcard[];
  onUpdateFlashcards: (nextFlashcards: Flashcard[]) => void;
  onXpGained: (xp: number) => void;
}

export default function RevisionFlashcardDeck({
  flashcards,
  onUpdateFlashcards,
  onXpGained
}: RevisionFlashcardDeckProps) {
  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Custom Card Input State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'BCA' | 'Fullstack' | 'Generative AI' | 'Government Exams' | 'Spoken English'>('BCA');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Search State for inventory list
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio helper
  const triggerAudioChime = (type: 'flip' | 'correct' | 'wrong' | 'add') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'flip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'add') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn('Audio node instantiation skipped:', e);
    }
  };

  // Filtered Cards
  const filteredCards = flashcards.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  // Safe Index
  const activeCardIndexValidated = Math.min(activeCardIndex, Math.max(0, filteredCards.length - 1));
  const currentCard: Flashcard | undefined = filteredCards[activeCardIndexValidated];

  // Actions
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    triggerAudioChime('flip');
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setActiveCardIndex(prev => (prev + 1) % Math.max(1, filteredCards.length));
    triggerAudioChime('flip');
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setActiveCardIndex(prev => {
      if (prev === 0) return Math.max(0, filteredCards.length - 1);
      return prev - 1;
    });
    triggerAudioChime('flip');
  };

  const handleFeedback = (responseType: 'correct' | 'wrong') => {
    if (!currentCard) return;

    // Mutate count
    const updated = flashcards.map(c => {
      if (c.id === currentCard.id) {
        return {
          ...c,
          reviewCount: (c.reviewCount || 0) + 1,
          difficulty: responseType === 'correct' ? 'easy' : 'hard' as any,
          lastStudiedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    onUpdateFlashcards(updated);
    
    if (responseType === 'correct') {
      onXpGained(10);
      triggerAudioChime('correct');
    } else {
      onXpGained(2);
      triggerAudioChime('wrong');
    }

    // Go to next card automatically to maintain flow
    setTimeout(() => {
      handleNextCard();
    }, 200);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Please write both a valid question and an answer.');
      return;
    }

    const newCardObj: Flashcard = {
      id: `f-custom-${Date.now()}`,
      category: newCategory,
      question: newQuestion,
      answer: newAnswer,
      difficulty: newDifficulty,
      reviewCount: 0,
      lastStudiedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateFlashcards([newCardObj, ...flashcards]);
    setNewQuestion('');
    setNewAnswer('');
    setShowAddForm(false);
    triggerAudioChime('add');
    
    // Switch filter to match Category to see the added card immediately
    setSelectedCategory(newCategory);
    setActiveCardIndex(0);
    setIsFlipped(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this flashcard from your study deck?')) {
      const remainingDef = flashcards.filter(c => c.id !== cardId);
      onUpdateFlashcards(remainingDef);
      triggerAudioChime('wrong');
    }
  };

  // Categories list
  const categoriesList = ['All', 'BCA', 'Fullstack', 'Generative AI', 'Government Exams', 'Spoken English'];

  // Match difficulty styles
  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH STATS AND SOUNDS CODES */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <BookMarked className="h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-gray-900 font-extrabold text-lg tracking-tight uppercase flex items-center gap-2">
                Core Revision Deck
                <span className="bg-indigo-100 text-indigo-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                  Active Recall
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-semibold">
                Maximize final semester GPA, job interview answers, and cognitive consolidation
              </p>
            </div>
          </div>
        </div>

        {/* STATS COUNT */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border text-[10.5px] font-bold uppercase transition-all tracking-wide cursor-pointer flex items-center gap-1 shrink-0 ${
              soundEnabled ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 border-gray-150 text-gray-400'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" /> Study Sound: {soundEnabled ? 'ACTIVE' : 'MUTED'}
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Custom Card
          </button>
        </div>
      </div>

      {/* THREE COLUMN GRID: FORM OVERLAY OR SUB-SECTIONS */}
      {showAddForm && (
        <div className="bg-slate-900/40 p-5 rounded-2xl border-2 border-dashed border-indigo-200/50 space-y-3.5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 uppercase">
              ✨ Append New Custom Flashcard
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-indigo-700 font-bold hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddCardSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Select category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full text-xs font-mono px-3 py-2 rounded-xl focus:ring-1 focus:ring-indigo-500"
              >
                <option value="BCA">🎓 BCA Exams</option>
                <option value="Fullstack">💻 Fullstack SDE</option>
                <option value="Generative AI">🤖 Generative AI</option>
                <option value="Government Exams">🏛️ Gov Prep</option>
                <option value="Spoken English">🗣️ English STAR</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Priority Index</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full text-xs font-mono px-3 py-2 rounded-xl focus:ring-1 focus:ring-indigo-500"
              >
                <option value="easy">🟢 Low / Easy</option>
                <option value="medium">🟡 Medium confidence</option>
                <option value="hard">🔴 Weak area / High leverage</option>
              </select>
            </div>

            <div className="md:col-span-7" />

            {/* Questions inputs */}
            <div className="md:col-span-6 space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Question / Concept Trigger</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the fundamental difference between dynamic scoping vs static scoping?"
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl"
              />
            </div>

            <div className="md:col-span-6 space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">Answer / Core Explanation</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="e.g. Static scoping binds references at compile-time based on code nesting. Dynamic scoping checks active call stacks."
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl"
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1"
              >
                <BookmarkCheck className="h-4 w-4" /> Save Into Active Deck
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER BUTTONS ROW */}
      <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-150">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 font-mono">Category Filter:</span>
        {categoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setActiveCardIndex(0);
              setIsFlipped(false);
              triggerAudioChime('flip');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-3xs'
                : 'text-gray-500 hover:bg-white hover:text-gray-900'
            }`}
          >
            {cat === 'All' ? '🌐 Study All' : cat}
          </button>
        ))}
      </div>

      {/* ACTIVE CARD PREVIEW STAGE */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* STUDY STAGE */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* INSTRUCTIONS */}
            <div className="flex items-center gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-150/40 text-[11px] text-indigo-900 font-semibold leading-normal">
              <Info className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Spaced Repetition:</strong> Quiz yourself silently, flip to inspect accuracy, and record performance. Getting it Right yields <strong>+10 XP</strong>; Got Wrong logs for weak area review.
              </span>
            </div>

            {/* CARD VIEWPORT FRAME */}
            <div 
              onClick={handleFlipCard}
              className="group cursor-pointer perspective-1000 w-full min-h-[220px] focus:outline-hidden"
              title="Click anywhere to flip structural card views"
            >
              <div className={`relative w-full h-full min-h-[220px] transition-all duration-300 transform-style-3d ${
                isFlipped ? '[transform:rotateX(180deg)]' : ''
              }`}>

                {/* FRONT VALUE: QUESTION */}
                <div className={`absolute inset-0 w-full h-full p-6 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-2xl border-2 border-indigo-500/30 flex flex-col justify-between shadow-md backface-hidden ${
                  isFlipped ? 'opacity-0' : 'opacity-100'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-indigo-900/55">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider">
                      {currentCard?.category}
                    </span>
                    <span className={`px-2 py-0.5 border rounded-md font-mono text-[9.5px] font-bold uppercase tracking-wide ${getDifficultyColor(currentCard?.difficulty)}`}>
                      {currentCard?.difficulty}
                    </span>
                  </div>

                  <div className="my-auto py-4 text-center">
                    <HelpCircle className="h-7 w-7 text-indigo-400 mx-auto mb-2.5 animate-bounce" />
                    <p className="text-white font-extrabold text-base md:text-lg leading-snug tracking-tight px-3 select-none">
                      {currentCard?.question}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[10.5px] text-indigo-400 font-semibold">
                    <span className="font-mono">Completed: {currentCard?.reviewCount ?? 0} runs</span>
                    <span className="bg-indigo-600 text-white font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg shadow-4xs group-hover:bg-indigo-500">
                      Flip Card
                    </span>
                  </div>
                </div>

                {/* BACK VALUE: ANSWER CODE */}
                <div className={`absolute inset-0 w-full h-full p-6 bg-slate-900 text-white rounded-2xl border-2 border-emerald-500/30 flex flex-col justify-between shadow-md [transform:rotateX(180deg)] backface-hidden ${
                  isFlipped ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider">
                      Explanation & Solution
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Card ID: {currentCard?.id}</span>
                  </div>

                  <div className="my-auto py-3">
                    <p className="text-gray-200 text-xs md:text-sm font-semibold leading-relaxed tracking-wide select-none whitespace-pre-wrap pl-3 border-l-2 border-emerald-500">
                      {currentCard?.answer}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[10.5px] text-gray-400 font-semibold border-t border-gray-800/60">
                    <span className="text-[10px] italic">Checked: {currentCard?.lastStudiedAt || 'Not studied yet'}</span>
                    <span className="bg-emerald-600 text-white font-extrabold text-[9px] uppercase px-2 py-1.5 rounded-lg">
                      Flipped View
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* LOWER CONTROLS PANEL */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-150">
              
              {/* Pagination indicators */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl font-bold text-xs cursor-pointer select-none"
                >
                  ◀ Previous
                </button>
                <span className="font-mono text-xs text-gray-400 font-semibold">
                  Card {activeCardIndexValidated + 1} of {filteredCards.length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl font-bold text-xs cursor-pointer select-none"
                >
                  Next ▶
                </button>
              </div>

              {/* Study Action Response Inputs */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); handleFeedback('wrong'); }}
                  className="flex-1 sm:flex-initial bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="h-4 w-4 text-rose-500" />
                  Needs Review (+2 XP)
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFeedback('correct'); }}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-300" />
                  Got It Right (+10 XP)
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT PANELS INDEX OF ACTIVE CARDS FOR FASTRACK SELECTING */}
          <div className="space-y-4">
            
            {/* INVENTORY HEADER */}
            <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#111] text-xs uppercase tracking-wider font-mono">
                  Study Deck Index ({filteredCards.length})
                </h3>
              </div>

              {/* SEARCH FILTER BAR */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-[11px] pl-8 w-full px-2 py-1.5 rounded-lg duration-150"
                />
              </div>

              {/* INDEX CONTAINER */}
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                {filteredCards
                  .filter(c => c.question.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((c, i) => {
                    const isSelected = i === activeCardIndexValidated;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveCardIndex(i);
                          setIsFlipped(false);
                          triggerAudioChime('flip');
                        }}
                        className={`p-2 rounded-lg border text-[11px] leading-tight cursor-pointer font-medium transition-all flex justify-between items-start gap-2 ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-bold' 
                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <div className="truncate flex-1">
                          <span className="text-[9px] uppercase font-bold text-indigo-600 block mb-0.5">{c.category}</span>
                          <span className="truncate block font-semibold">{c.question}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCard(c.id); }}
                          className="text-gray-300 hover:text-rose-500 p-0.5"
                          title="Remove custom card"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white text-center rounded-2xl p-12 border border-gray-150 space-y-4">
          <HelpCircle className="h-12 w-12 text-indigo-400 mx-auto animate-bounce" />
          <h3 className="text-gray-900 font-extrabold text-base">No Flashcards loaded</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-medium">
            You don't have secondary revision flashcards under "{selectedCategory}" yet. Click "Custom Card" at the top to write some study aids.
          </p>
          <button
            onClick={() => { setSelectedCategory('All'); }}
            className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Show All Categories
          </button>
        </div>
      )}

    </div>
  );
}
