import React, { useState } from 'react';
import { SubjectTrack } from '../types';
import { GraduationCap, CheckCircle2, ChevronDown, ChevronUp, BookOpen, AlertCircle, Edit, ListChecks, Percent, Sparkles, Loader2 } from 'lucide-react';

export default function BcaExamsComponent({
  subjects,
  setSubjects,
  onXpGained
}: {
  subjects: SubjectTrack[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectTrack[]>>;
  onXpGained?: (xp: number) => void;
}) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>('testing');
  const [activeTab, setActiveTab] = useState<'notes' | 'mock' | 'questions' | 'ai-summarize'>('notes');

  // OpenRouter notes summarizer states
  const [pastedNotes, setPastedNotes] = useState<Record<string, string>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, { summaryPoints: string[], examQuestions: string[] }>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [questionsAddedMessage, setQuestionsAddedMessage] = useState<string | null>(null);

  const handleAnalyzeNotes = async (subjectId: string) => {
    const textToAnalyze = pastedNotes[subjectId] || '';
    if (!textToAnalyze.trim()) {
      setAnalysisError('Please paste some study notes to summarize first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setQuestionsAddedMessage(null);

    try {
      const res = await fetch('/api/bca-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notesText: textToAnalyze }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to communicate with OpenRouter API.');
      }

      const parsed = await res.json();
      if (!parsed.summaryPoints || !parsed.examQuestions) {
        throw new Error('Received unexpected output format. Please try again.');
      }

      setAnalysisResults(prev => ({
        ...prev,
        [subjectId]: {
          summaryPoints: parsed.summaryPoints || [],
          examQuestions: parsed.examQuestions || []
        }
      }));

      if (onXpGained) {
        onXpGained(30); // Award 30 XP for academic analysis!
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'An unexpected error occurred during document summary.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAppendQuestions = (subjectId: string, questions: string[]) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id === subjectId) {
          const newQuestions = [...sub.importantQuestions];
          questions.forEach(q => {
            if (!newQuestions.includes(q)) {
              newQuestions.push(q);
            }
          });
          return { ...sub, importantQuestions: newQuestions };
        }
        return sub;
      })
    );
    setQuestionsAddedMessage('Successfully imported AI exam questions into your Practice Queries database!');
    setTimeout(() => {
      setQuestionsAddedMessage(null);
    }, 4000);
  };

  const handleUnitProgress = (id: string, increment: boolean) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id === id) {
          const totalLength = sub.notes.length || 5;
          const currentArr = sub.unitProgress && sub.unitProgress.length === totalLength
            ? [...sub.unitProgress]
            : Array(totalLength).fill(0);

          if (increment) {
            const indexToUpdate = currentArr.findIndex(p => p < 100);
            if (indexToUpdate !== -1) {
              currentArr[indexToUpdate] = 100;
              if (onXpGained) onXpGained(15);
            }
          } else {
            let indexToUpdate = -1;
            for (let i = currentArr.length - 1; i >= 0; i--) {
              if (currentArr[i] > 0) {
                indexToUpdate = i;
                break;
              }
            }
            if (indexToUpdate !== -1) {
              currentArr[indexToUpdate] = 0;
            }
          }

          const completedCount = currentArr.filter(p => p === 100).length;
          return {
            ...sub,
            unitProgress: currentArr,
            completedUnits: completedCount
          };
        }
        return sub;
      })
    );
  };

  const handleUnitProgressPercent = (subjectId: string, unitIndex: number) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id === subjectId) {
          const totalLength = sub.notes.length || 5;
          const currentArr = sub.unitProgress && sub.unitProgress.length === totalLength
            ? [...sub.unitProgress]
            : Array(totalLength).fill(0);

          const currentVal = currentArr[unitIndex] ?? 0;
          const nextVal = currentVal >= 100 ? 0 : currentVal + 10;
          currentArr[unitIndex] = nextVal;

          const completedCount = currentArr.filter(p => p === 100).length;

          if (nextVal === 100 && onXpGained) {
            onXpGained(15);
          } else if (onXpGained) {
            onXpGained(3);
          }

          return {
            ...sub,
            unitProgress: currentArr,
            completedUnits: completedCount
          };
        }
        return sub;
      })
    );
  };

  const updateExpectedMarks = (id: string, expected: number) => {
    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, mockMarksExpected: expected } : sub));
  };

  const updateMockScore = (id: string, score: number) => {
    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, mockMarksScore: score } : sub));
  };

  const handleAddWeakArea = (id: string, text: string) => {
    if (!text.trim()) return;
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id === id) {
          return { ...sub, weakAreas: [...sub.weakAreas, text.trim()] };
        }
        return sub;
      })
    );
  };

  const handleRemoveWeakArea = (id: string, text: string) => {
    setSubjects(prev =>
      prev.map(sub => {
        if (sub.id === id) {
          return { ...sub, weakAreas: sub.weakAreas.filter(wa => wa !== text) };
        }
        return sub;
      })
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6" id="bca-exams-section">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-950 flex items-center gap-2">
            <GraduationCap className="h-5.5 w-5.5 text-indigo-600" />
            BCA Final Semester Academic Dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Track software testing, machine learning, and mobile widgets curricula prior to finals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Subjects List & progress card */}
        <div className="lg:col-span-4 space-y-3.5">
          {subjects.map(sub => {
            const totalLength = sub.notes.length || 5;
            const arr = sub.unitProgress && sub.unitProgress.length === totalLength
              ? sub.unitProgress
              : Array(totalLength).fill(0);
            const percentage = Math.round(arr.reduce((acc, p) => acc + p, 0) / totalLength);
            const isExpanded = expandedSubject === sub.id;

            return (
              <div
                key={sub.id}
                className={`border rounded-2xl p-4 transition-all ${
                  isExpanded ? 'border-indigo-400 bg-indigo-50/10' : 'border-gray-150 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}>
                  <div className="space-y-1 pr-2">
                    <h3 className="text-xs font-bold text-gray-9 w-full leading-5 select-none">{sub.name}</h3>
                    <p className="text-[10px] text-gray-550 font-bold font-mono">
                      Units: {sub.completedUnits}/{sub.totalUnits} completed ({percentage}%)
                    </p>
                  </div>
                  <CheckCircle2 className={`h-4.5 w-4.5 ${percentage === 100 ? 'text-emerald-500' : 'text-gray-300'}`} />
                </div>

                {/* mini gauge */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-indigo-600 h-full transition-all" style={{ width: `${percentage}%` }} />
                </div>

                {/* details actions */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUnitProgress(sub.id, false)}
                      className="text-[10px] font-bold bg-white border border-gray-200 text-gray-600 p-1 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      - Unit
                    </button>
                    <button
                      onClick={() => handleUnitProgress(sub.id, true)}
                      className="text-[10px] font-bold bg-indigo-50 text-indigo-700 p-1 rounded-md hover:bg-indigo-100 cursor-pointer"
                    >
                      + Unit
                    </button>
                  </div>
                  <button
                    onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                    className="text-xs text-gray-500 font-semibold hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    View details {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Selected Subject interactive Study materials / syllabus tracker */}
        <div className="lg:col-span-8">
          {expandedSubject ? (() => {
            const currentSub = subjects.find(s => s.id === expandedSubject);
            if (!currentSub) return null;

            return (
              <div className="border border-gray-150 rounded-2xl p-5 space-y-5 bg-white shadow-xs">
                
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{currentSub.name}</h3>
                    <p className="text-[10px] text-indigo-600 font-bold tracking-wider font-mono uppercase mt-0.5">Deep study syllabus guide</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Expected Marks</p>
                      <input
                        type="number"
                        value={currentSub.mockMarksExpected}
                        onChange={(e) => updateExpectedMarks(currentSub.id, parseInt(e.target.value) || 0)}
                        className="text-xs font-bold text-gray-800 text-center w-12 bg-transparent focus:outline-hidden"
                      />
                    </div>
                    <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-150">
                      <p className="text-[9px] text-indigo-800 font-bold uppercase">Mock Score</p>
                      <input
                        type="number"
                        value={currentSub.mockMarksScore}
                        onChange={(e) => updateMockScore(currentSub.id, parseInt(e.target.value) || 0)}
                        className="text-xs font-bold text-indigo-950 text-center w-12 bg-transparent focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub Tab selection */}
                <div className="flex gap-2.5 border-b border-gray-100 pb-2 flex-wrap">
                  {[
                    { id: 'notes', label: '📖 Topic Units Class Notes' },
                    { id: 'mock', label: '📊 Target mock stats & Weak Areas' },
                    { id: 'questions', label: '❓ Exam practice queries' },
                    { id: 'ai-summarize', label: '✨ OpenRouter Note Summarizer' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`text-xs font-bold py-1 px-3 rounded-lg transition-all cursor-pointer ${
                        activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content notes */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject curriculum handbook (Gradual Unit Tracking)</p>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Gradual Increment Mode
                      </span>
                    </div>
                    {currentSub.notes.map((note, idx) => {
                      const progressVal = currentSub.unitProgress && currentSub.unitProgress[idx] !== undefined
                        ? currentSub.unitProgress[idx]
                        : 0;

                      return (
                        <div key={idx} className="bg-white border border-gray-150 p-4 rounded-xl space-y-3 hover:shadow-2xs transition-all">
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                  progressVal === 100 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}>
                                  Unit {idx + 1} • {progressVal}% Study Ready
                                </span>
                              </div>
                              <p className="text-xs text-gray-800 leading-relaxed font-semibold">{note}</p>
                            </div>

                            <button
                              onClick={() => handleUnitProgressPercent(currentSub.id, idx)}
                              className="shrink-0 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 px-2.5 py-1.5 rounded-lg border border-indigo-150 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
                              Progress +10%
                            </button>
                          </div>

                          {/* Progress bar indicator */}
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                progressVal === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`} 
                              style={{ width: `${progressVal}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab content mock weak areas */}
                {activeTab === 'mock' && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-rose-50/40 rounded-xl space-y-2 border border-rose-100">
                      <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        Weak Areas Identified
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentSub.weakAreas.map((wa, idx) => (
                          <span
                            key={idx}
                            className="bg-white text-rose-700 font-semibold text-[10px] px-2.5 py-1 rounded-md border border-rose-150 flex items-center gap-1"
                          >
                            {wa}
                            <button onClick={() => handleRemoveWeakArea(currentSub.id, wa)} className="hover:text-red-900 ml-1 font-bold">×</button>
                          </span>
                        ))}
                      </div>

                      {/* Add weak area */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const target = e.currentTarget.elements.namedItem('newweak') as HTMLInputElement;
                          handleAddWeakArea(currentSub.id, target.value);
                          target.value = '';
                        }}
                        className="flex gap-2 pt-2"
                      >
                        <input
                          type="text"
                          name="newweak"
                          placeholder="Log a new topic weakness..."
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-hidden"
                        />
                        <button type="submit" className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-lg cursor-pointer">
                          Add Areas
                        </button>
                      </form>
                    </div>

                    <div className="p-3.5 bg-indigo-50/50 rounded-xl space-y-2 border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-900">Analysis metrics</h4>
                      <p className="text-[11px] text-indigo-950 font-medium leading-relaxed">
                        Expected Score is set to <strong>{currentSub.mockMarksExpected}%</strong>. Current mock trials result is averaging <strong>{currentSub.mockMarksScore}%</strong>. Focus on weak topics list to bridge 100% completion before semesters.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab content questions */}
                {activeTab === 'questions' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">High Probability Semester Questions</p>
                    {currentSub.importantQuestions.map((q, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5">
                        <span className="bg-white border border-gray-300 text-gray-600 font-semibold px-2 py-0.5 rounded-md text-[10.5px] font-mono shadow-xs">
                          Q {idx + 1}
                        </span>
                        <p className="text-[11.5px] text-gray-800 font-semibold leading-relaxed pt-0.5">{q}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab content AI summaries */}
                {activeTab === 'ai-summarize' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/20 border border-indigo-200/50 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                        <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                          OpenRouter Study Notes Summarizer
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Paste reference materials, course syllabus, or hand-written study notebooks below. OpenRouter AI will condense everything into a crisp, technical 5-point summaries alongside 3 university-style potential exam practice questions!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Class Notes / Reference Syllabus Material
                      </label>
                      <textarea
                        rows={6}
                        value={pastedNotes[currentSub.id] || ''}
                        onChange={(e) => setPastedNotes(prev => ({ ...prev, [currentSub.id]: e.target.value }))}
                        placeholder={`e.g., In ${currentSub.name}, we study standard practices and key constraints such as...`}
                        className="w-full text-xs p-3.5 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-gray-400">
                          {(pastedNotes[currentSub.id] || '').length} characters pasted
                        </span>
                        <button
                          onClick={() => handleAnalyzeNotes(currentSub.id)}
                          disabled={isAnalyzing}
                          className="bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Analyzing Notes...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Summarize &amp; Generate Prep Questions
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {analysisError && (
                      <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="font-medium leading-relaxed">{analysisError}</p>
                      </div>
                    )}

                    {questionsAddedMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                        <p className="font-semibold leading-relaxed">{questionsAddedMessage}</p>
                      </div>
                    )}

                    {analysisResults[currentSub.id] && (
                      <div className="space-y-4 pt-2 border-t border-gray-100">
                        <div>
                          <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            💡 Structured 5-Point Summary
                          </h4>
                          <div className="space-y-2">
                            {analysisResults[currentSub.id].summaryPoints.map((point, index) => (
                              <div key={index} className="p-3.5 bg-gray-50 border border-gray-150 rounded-xl flex items-start gap-3">
                                <span className="bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-md text-[10px] font-mono shrink-0 shadow-2xs">
                                  {index + 1}
                                </span>
                                <p className="text-xs text-bca-content leading-relaxed font-semibold text-gray-850">{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
                            <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                              ❓ Potential Exam Practice Questions
                            </h4>
                            <button
                              onClick={() => handleAppendQuestions(currentSub.id, analysisResults[currentSub.id].examQuestions)}
                              className="text-[10px] bg-indigo-50 text-indigo-800 font-extrabold px-2.5 py-1 rounded-lg hover:bg-indigo-100/80 transition-all cursor-pointer border border-indigo-150 uppercase"
                            >
                              Import Questions into Practice tab
                            </button>
                          </div>
                          <div className="space-y-2">
                            {analysisResults[currentSub.id].examQuestions.map((q, index) => (
                              <div key={index} className="p-3.5 bg-yellow-50/20 border border-yellow-150 rounded-xl flex items-start gap-3">
                                <span className="bg-yellow-50 text-yellow-800 font-extrabold px-1.5 py-0.5 rounded-md text-[10px] font-mono shrink-0 border border-yellow-150">
                                  Ex {index + 1}
                                </span>
                                <p className="text-xs text-gray-800 leading-relaxed font-semibold">{q}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })() : (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
              <GraduationCap className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 font-semibold">Select an academic subject on the left to review class notes and syllabus criteria.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
