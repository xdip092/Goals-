import React, { useState, useRef, useEffect } from 'react';
import { User, Send, Bot, Sparkles, MessageSquare, Mic, BookOpen, Clock, AlertTriangle, ShieldCheck, Dumbbell, Award, Briefcase } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoaches({ onScoreUnlocked }: { onScoreUnlocked?: (xp: number, badgeId?: string) => void }) {
  // Chat state
  const [persona, setPersona] = useState('Career Coach');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Success prioritizes deep work. I am your 12-Month life transformation strategist. What's your top constraint or blocker today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // English state
  const [englishMode, setEnglishMode] = useState<'Conversation' | 'Interview-HR' | 'Interview-Technical' | 'Interview-Gov'>('Conversation');
  const [englishInput, setEnglishInput] = useState('');
  const [englishFeedback, setEnglishFeedback] = useState<{
    mentorReply: string;
    betterWording: string;
    vocabularyExpansion: string[];
    pronunciationTip: string;
  } | null>(null);
  const [isEnglishLoading, setIsEnglishLoading] = useState(false);

  // Accountability Evening Audit state
  const [priorities, setPriorities] = useState('');
  const [completed, setCompleted] = useState('');
  const [missed, setMissed] = useState('');
  const [whyMissed, setWhyMissed] = useState('');
  const [auditResult, setAuditResult] = useState<{
    productivityScore: number;
    consistencyScore: number;
    recoveryPlan: string;
    mentorCritique: string;
  } | null>(null);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, persona })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        if (onScoreUnlocked) onScoreUnlocked(20); // Gain 20 XP for Deep Mentor consulting
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Server failed'}` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Failed to link: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnglishSubmit = async () => {
    if (!englishInput.trim() || isEnglishLoading) return;
    setIsEnglishLoading(true);

    try {
      const res = await fetch('/api/english-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: englishInput, mode: englishMode })
      });
      const data = await res.json();
      if (res.ok) {
        setEnglishFeedback(data);
        if (onScoreUnlocked) onScoreUnlocked(35, 'b-english'); // Trigger badge evaluation as well
      } else {
        alert(data.error || 'API call failed');
      }
    } catch (e: any) {
      alert(`API failure: ${e.message}`);
    } finally {
      setIsEnglishLoading(false);
    }
  };

  const handleAccountabilitySubmit = async () => {
    if (isAuditLoading) return;
    setIsAuditLoading(true);

    try {
      const res = await fetch('/api/chat-accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorities, completed, missed, whyMissed })
      });
      const data = await res.json();
      if (res.ok) {
        setAuditResult(data);
        if (onScoreUnlocked) onScoreUnlocked(50); // XP Reward for accountability checklist logging
      } else {
        alert(data.error || 'Accountability evaluation failed');
      }
    } catch (e: any) {
      alert(`Network Error: ${e.message}`);
    } finally {
      setIsAuditLoading(false);
    }
  };

  const getPersonaIcon = (p: string) => {
    switch (p) {
      case 'Fitness Coach': return <Dumbbell className="h-5 w-5 text-red-500" />;
      case 'English Teacher': return <BookOpen className="h-5 w-5 text-sky-500" />;
      case 'Exam Mentor': return <Award className="h-5 w-5 text-amber-500" />;
      case 'Career Coach': return <Briefcase className="h-5 w-5 text-indigo-500" />;
      default: return <Bot className="h-5 w-5 text-violet-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="ai-coaches-root">
      {/* Tab select and Chat panel */}
      <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mentor Chat Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              {getPersonaIcon(persona)}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">AI Personal Mentor</h3>
                <p className="text-[10px] text-gray-500">12-Month Performance OS</p>
              </div>
            </div>
            <select
              value={persona}
              onChange={(e) => {
                setPersona(e.target.value);
                setMessages([
                  { role: 'assistant', content: `I have deployed my instructions as your ${e.target.value}. Let's outline solutions to your main target constraint right now.` }
                ]);
              }}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-hidden"
            >
              <option value="Career Coach">💼 Career Coach</option>
              <option value="Exam Mentor">✍️ Exam Mentor</option>
              <option value="English Teacher">🗣️ English Teacher</option>
              <option value="Fitness Coach">🏋️ Fitness Coach</option>
              <option value="Productivity Expert">⏱️ Productivity Expert</option>
              <option value="Accountability Partner">🤝 Accountability Partner</option>
            </select>
          </div>

          {/* Message log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 text-xs scrollbar-thin">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`p-2.5 rounded-xl whitespace-pre-wrap break-words leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white font-medium' : 'bg-gray-100 text-gray-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 text-gray-400 italic">
                <Bot className="h-4 w-4 animate-bounce" />
                <span>Formulating direct coaching paths...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing area */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* English & Interview Studio */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-sky-600" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Spoken English mastery</h3>
                <p className="text-[10px] text-gray-500">Interview simulator &amp; native tutor</p>
              </div>
            </div>
            <select
              value={englishMode}
              onChange={(e: any) => setEnglishMode(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-hidden"
            >
              <option value="Conversation">🗣️ Conversational Mode</option>
              <option value="Interview-HR">💼 Mock HR Interview</option>
              <option value="Interview-Technical">💻 Technical Developer Mock</option>
              <option value="Interview-Gov">🏛️ Government Sector Mock</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 text-xs scrollbar-thin">
            {!englishFeedback ? (
              <div className="text-gray-400 italic text-center pt-20">
                <Bot className="mx-auto h-8 w-8 text-sky-200 mb-2" />
                Type an answer as you would speak it to evaluate fluency, vocabulary multipliers, and pronunciation tips.
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <h4 className="font-bold text-sky-800 flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Coach Response
                  </h4>
                  <p className="text-sky-950 font-medium">{englishFeedback.mentorReply}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Better Wording (Native Refinement)
                  </h4>
                  <p className="text-emerald-950 italic">"{englishFeedback.betterWording}"</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-700 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Vocabulary Booster Words
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {englishFeedback.vocabularyExpansion.map((v, i) => (
                      <span key={i} className="bg-white px-2 py-1 rounded-md text-[10px] font-medium border border-gray-200 text-gray-700">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-150">
                  <h4 className="font-bold text-indigo-800 text-[10px] uppercase tracking-wider mb-1">Fluency &amp; Pronunciation Tip</h4>
                  <p className="text-indigo-950 leading-relaxed font-semibold">{englishFeedback.pronunciationTip}</p>
                </div>
              </div>
            )}
          </div>

          {/* English Input Area */}
          <div className="space-y-2">
            <textarea
              rows={2}
              placeholder={englishMode === 'Conversation' ? 'Ask a question or speak freely...' : 'Type your mock verbal interview response...'}
              value={englishInput}
              onChange={(e) => setEnglishInput(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500 resize-none"
            />
            <button
              onClick={handleEnglishSubmit}
              disabled={isEnglishLoading || !englishInput.trim()}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEnglishLoading ? 'Evaluating dynamic parameters...' : 'Analyze Spoken English'}
            </button>
          </div>
        </div>

        {/* Accountability Evening Audit */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Personal Accountability Coach</h3>
              <p className="text-[10px] text-gray-500">Formulate evening score and priority recovery</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 text-xs scrollbar-thin">
            {!auditResult ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Today's Targets Set</label>
                  <input
                    type="text"
                    placeholder="e.g. Completed ML study blocks, steps count, math puzzles"
                    value={priorities}
                    onChange={(e) => setPriorities(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tasks Completed</label>
                  <input
                    type="text"
                    placeholder="What did you actually check off?"
                    value={completed}
                    onChange={(e) => setCompleted(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Task Missed</label>
                    <input
                      type="text"
                      placeholder="E.g. Web roadmap node"
                      value={missed}
                      onChange={(e) => setMissed(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Core Block Obstacle</label>
                    <input
                      type="text"
                      placeholder="Why missed (E.g. exam review fatigue)"
                      value={whyMissed}
                      onChange={(e) => setWhyMissed(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAccountabilitySubmit}
                  disabled={isAuditLoading || !priorities.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isAuditLoading ? 'Securing strict metrics evaluation...' : 'Execute Evening Transformation Audit'}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex gap-4">
                  <div className="flex-1 bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-center">
                    <p className="text-[10px] text-amber-800 font-bold uppercase">Productivity Score</p>
                    <p className="text-2xl font-bold text-amber-900">{auditResult.productivityScore}/100</p>
                  </div>
                  <div className="flex-1 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-center">
                    <p className="text-[10px] text-indigo-800 font-bold uppercase">Consistency</p>
                    <p className="text-2xl font-bold text-indigo-900">{auditResult.consistencyScore}%</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <h4 className="font-bold text-gray-700 flex items-center gap-1.5 mb-1.5 uppercase text-[10px]">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Tactical Recovery Protocol
                  </h4>
                  <p className="text-gray-800 leading-relaxed font-semibold">{auditResult.recoveryPlan}</p>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <h4 className="font-bold text-rose-800 text-[10px] uppercase tracking-wider mb-1">Mentor Critique Verdict</h4>
                  <p className="text-rose-950 font-medium italic">"{auditResult.mentorCritique}"</p>
                </div>

                <button
                  onClick={() => {
                    setAuditResult(null);
                    setPriorities('');
                    setCompleted('');
                    setMissed('');
                    setWhyMissed('');
                  }}
                  className="w-full bg-gray-900 hover:bg-black text-white py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Enter New Daily Review Block
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
