import React, { useState } from 'react';
import { ATSResume, JobApplication } from '../types';
import { initialAtsResume } from '../data';
import { 
  FileText, Award, Eye, Search, Briefcase, Plus, TrendingUp, CheckCircle, 
  Copy, Check, Download, Layers, UploadCloud, Trash2, Edit3, Printer, FileJson 
} from 'lucide-react';

interface ProjectStructure {
  title: string;
  problemStatement: string;
  techStack: string;
  documentation: string;
  resumePoints: string[];
  linkedInPost: string;
}

export default function ATSResumeComponent({
  atsResume,
  setAtsResume,
  jobApps,
  setJobApps,
  onXpGained
}: {
  atsResume: ATSResume;
  setAtsResume: React.Dispatch<React.SetStateAction<ATSResume>>;
  jobApps: JobApplication[];
  setJobApps: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  onXpGained?: (xp: number) => void;
}) {
  const [template, setTemplate] = useState<'fresher' | 'fullstack' | 'ai' | 'gov'>('fresher');
  const [isAuditing, setIsAuditing] = useState(false);
  const [isProjectBuilding, setIsProjectBuilding] = useState(false);
  const [projectTrack, setProjectTrack] = useState<'Full Stack Web' | 'Generative AI & Automation'>('Full Stack Web');
  const [customProject, setCustomProject] = useState<ProjectStructure | null>(null);

  // New Job state
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Middle Column Multi-Tab states
  const [middleTab, setMiddleTab] = useState<'preview' | 'customize' | 'upload'>('preview');
  const [newSkillText, setNewSkillText] = useState('');
  const [newCertText, setNewCertText] = useState('');

  // Resume uploading & parsing states
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Copy helpers
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Help update experience items
  const handleUpdateExperience = (index: number, key: 'company' | 'role' | 'duration', value: string) => {
    setAtsResume(prev => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [key]: value };
      return { ...prev, experience: exp };
    });
  };

  const handleUpdateBulletPoint = (expIdx: number, bulletIdx: number, value: string) => {
    setAtsResume(prev => {
      const exp = [...prev.experience];
      const bullets = [...exp[expIdx].bulletPoints];
      bullets[bulletIdx] = value;
      exp[expIdx] = { ...exp[expIdx], bulletPoints: bullets };
      return { ...prev, experience: exp };
    });
  };

  const handleAddBulletPoint = (expIdx: number) => {
    setAtsResume(prev => {
      const exp = [...prev.experience];
      exp[expIdx] = { 
        ...exp[expIdx], 
        bulletPoints: [
          ...exp[expIdx].bulletPoints, 
          'Successfully deployed real-world metric-enhancing systems that saved 20%+ computation delay.'
        ] 
      };
      return { ...prev, experience: exp };
    });
  };

  const handleRemoveBulletPoint = (expIdx: number, bulletIdx: number) => {
    setAtsResume(prev => {
      const exp = [...prev.experience];
      exp[expIdx] = { ...exp[expIdx], bulletPoints: exp[expIdx].bulletPoints.filter((_, i) => i !== bulletIdx) };
      return { ...prev, experience: exp };
    });
  };

  const handleAddExperienceEntry = () => {
    setAtsResume(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: 'AI Research & Web Corp',
          role: 'Junior Full Stack Engineer & GenAI Developer',
          duration: 'Jan 2026 - Present',
          bulletPoints: ['Constructed interactive dashboards utilizing high-density custom layout algorithms and native CSS optimization templates.']
        }
      ]
    }));
  };

  const handleRemoveExperienceEntry = (idx: number) => {
    setAtsResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }));
  };

  // Add/remove skills & certs
  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const clean = newSkillText.trim();
    if (!atsResume.skills.includes(clean)) {
      setAtsResume(prev => ({
        ...prev,
        skills: [...prev.skills, clean]
      }));
    }
    setNewSkillText('');
  };

  const handleRemoveSkill = (idx: number) => {
    setAtsResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx)
    }));
  };

  const handleAddCertification = () => {
    if (!newCertText.trim()) return;
    const clean = newCertText.trim();
    if (!atsResume.certifications.includes(clean)) {
      setAtsResume(prev => ({
        ...prev,
        certifications: [...prev.certifications, clean]
      }));
    }
    setNewCertText('');
  };

  const handleRemoveCertification = (idx: number) => {
    setAtsResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx)
    }));
  };

  // Base64 converter binary helper
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const arr = (reader.result as string).split(',');
      resolve(arr[1] || '');
    };
    reader.onerror = error => reject(error);
  });

  const handleFileParse = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed.fullName && parsed.education && parsed.skills) {
            setAtsResume(parsed);
            setMiddleTab('preview');
            if (onXpGained) onXpGained(40);
            setIsParsing(false);
            return;
          }
        } catch {
          // fallback to text reading
        }
      }

      if (file.type === 'application/pdf') {
        const base64 = await toBase64(file);
        const res = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileBase64: base64, mimeType: 'application/pdf' })
        });
        const data = await res.json();
        if (res.ok) {
          setAtsResume(data);
          setMiddleTab('preview');
          if (onXpGained) onXpGained(100);
        } else {
          setParseError(data.error || 'Server PDF parsing failed');
        }
      } else {
        const txt = await file.text();
        const res = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: txt })
        });
        const data = await res.json();
        if (res.ok) {
          setAtsResume(data);
          setMiddleTab('preview');
          if (onXpGained) onXpGained(75);
        } else {
          setParseError(data.error || 'Server text parsing failed');
        }
      }
    } catch (err: any) {
      setParseError(err.message || 'Service connection lost');
    } finally {
      setIsParsing(false);
    }
  };

  const handleParsePastedText = async () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pastedText })
      });
      const data = await res.json();
      if (res.ok) {
        setAtsResume(data);
        setPastedText('');
        setMiddleTab('preview');
        if (onXpGained) onXpGained(55);
      } else {
        setParseError(data.error || 'Pasted text parsing failed');
      }
    } catch (err: any) {
      setParseError(err.message || 'Service unreachable');
    } finally {
      setIsParsing(false);
    }
  };

  // Download utilities
  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const text = `======================================================================
${atsResume.fullName.toUpperCase()} - PORTFOLIO RESUME
======================================================================
Contact: ${atsResume.email} | ${atsResume.phone}
LinkedIn: ${atsResume.linkedin} | GitHub: ${atsResume.github}

----------------------------------------------------------------------
EDUCATION HISTORY & CREDENTIALS
----------------------------------------------------------------------
${atsResume.education}

----------------------------------------------------------------------
PROFESSIONAL EXPERIENCE & TIMELINE KEY PROJECTS
----------------------------------------------------------------------
${atsResume.experience.map(exp => `
* ${exp.company} | ${exp.role} (${exp.duration})
${exp.bulletPoints.map(pt => `  - ${pt}`).join('\n')}
`).join('\n')}

----------------------------------------------------------------------
CORE DEVELOPMENT COMPETENCIES & TECH SKILLS
----------------------------------------------------------------------
${atsResume.skills.join(', ')}

----------------------------------------------------------------------
ACCREDITED OR HONORARY CERTIFICATIONS
----------------------------------------------------------------------
${atsResume.certifications.map(cert => ` - ${cert}`).join('\n')}
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${atsResume.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = () => {
    const md = `# ${atsResume.fullName}
    
**Email:** ${atsResume.email}  
**Phone:** ${atsResume.phone}  
**LinkedIn:** [${atsResume.linkedin}](https://${atsResume.linkedin})  
**GitHub:** [${atsResume.github}](https://${atsResume.github})  

---

## Education History
${atsResume.education}

---

## Experience & Key Projects
${atsResume.experience.map(exp => `### ${exp.company}
**${exp.role} | ${exp.duration}**

${exp.bulletPoints.map(pt => `- ${pt}`).join('\n')}
`).join('\n')}

---

## Core Technical Competencies & Skills
${atsResume.skills.map(sk => `\`${sk}\``).join('  ')}

---

## Honorary Certifications & Credentials
${atsResume.certifications.map(cert => `- ${cert}`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${atsResume.fullName.replace(/\s+/g, '_')}_Resume.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(atsResume, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${atsResume.fullName.replace(/\s+/g, '_')}_Resume.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunAtsAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/evaluate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: atsResume })
      });
      const data = await res.json();
      if (res.ok) {
        setAtsResume(prev => ({
          ...prev,
          atsScore: data.atsScore,
          missingKeywords: data.missingKeywords,
          improvementSuggestions: data.improvementSuggestions
        }));
        if (onXpGained) onXpGained(50); // XP bonus for resume update
      } else {
        alert(data.error || 'Server rejected audit request');
      }
    } catch (e: any) {
      alert(`Connection failed: ${e.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const generatePortfolioProject = async () => {
    setIsProjectBuilding(true);
    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: projectTrack, level: 'Intermediate' })
      });
      const data = await res.json();
      if (res.ok) {
        setCustomProject(data);
        // Automatically inject the generated skills or projects into our resume skills if missing!
        const techArr = data.techStack.split(',').map((s: string) => s.trim());
        const newSkills = Array.from(new Set([...atsResume.skills, ...techArr]));
        setAtsResume(prev => ({
          ...prev,
          skills: newSkills
        }));
        if (onXpGained) onXpGained(75); // Huge XP gain for portfolio project build
      } else {
        alert(data.error || 'Project build failed');
      }
    } catch (e: any) {
      alert(`API Connection Alert: ${e.message}`);
    } finally {
      setIsProjectBuilding(false);
    }
  };

  const addNewJobApplication = () => {
    if (!newCompany.trim() || !newRole.trim()) return;
    const newApp: JobApplication = {
      id: `ja-${Date.now()}`,
      company: newCompany,
      role: newRole,
      status: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0],
      notes: newNotes
    };
    setJobApps([newApp, ...jobApps]);
    setNewCompany('');
    setNewRole('');
    setNewNotes('');
  };

  const updateJobStatus = (id: string, newStatus: any) => {
    setJobApps(jobApps.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  // Switch template presets
  const applyTemplatePreset = (t: 'fresher' | 'fullstack' | 'ai' | 'gov') => {
    setTemplate(t);
    if (t === 'fresher') {
      setAtsResume(prev => ({
        ...prev,
        fullName: 'Sameer Sen',
        education: 'Bachelor of Computer Applications (BCA) - Final Semester\nExpected Graduation: 2026\nSyllabus: ML, Flutter, Software Testing, Wireless Networking',
        skills: ['C++', 'Python', 'Java', 'HTML', 'CSS', 'Linux Command Line', 'Data Structures', 'Flutter/Dart', 'Manual STQA Testing'],
        certifications: ['Oracle Cloud Foundations Certification']
      }));
    } else if (t === 'fullstack') {
      setAtsResume(prev => ({
        ...prev,
        fullName: 'Sameer Sen',
        education: 'Bachelor of Computer Applications (BCA)\nStrong focus on Distributed Web Architectures & REST APIs',
        skills: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'TypeScript', 'Tailwind CSS', 'Docker', 'PostgreSQL', 'MongoDB', 'Redis', 'Nginx'],
        certifications: ['Full Stack Developer Course Completion', 'AWS Certified Cloud Practitioner']
      }));
    } else if (t === 'ai') {
      setAtsResume(prev => ({
        ...prev,
        fullName: 'Sameer Sen',
        education: 'Bachelor of Computer Applications (BCA)\nEmphasis on Machine Learning algorithms & Generative systems',
        skills: ['Generative AI APIs (Gemini, Claude)', 'Python Scripting', 'LangChain Framework', 'LlamaIndex', 'RAG pipelines', 'Vector DBs (Pinecone, pgVector)', 'NumPy', 'Pandas'],
        certifications: ['DeepLearning.AI Generative AI Developer Program']
      }));
    } else {
      setAtsResume(prev => ({
        ...prev,
        fullName: 'Sameer Sen',
        education: 'Bachelor of Computer Applications (BCA)\nFinal Sem subjects: Math, Logic puzzles, Wireless Protocols',
        skills: ['Quantitative Aptitude models', 'Logical Analysis puzzles', 'General Science History', 'General Computer knowledge', 'Written English fluency'],
        certifications: ['National Skill Certifications Program']
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="ats-resume-component-container">
      
      {/* LEFT: CV Builder Input & ATS audit Score */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Templates Select */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resume Templates Preset</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'fresher', label: '🎓 Fresher BCA' },
              { id: 'fullstack', label: '💻 Full Stack Dev' },
              { id: 'ai', label: '🤖 GenAI/Agent Dev' },
              { id: 'gov', label: '🏛️ Gov Job CV' }
            ].map(pres => (
              <button
                key={pres.id}
                onClick={() => applyTemplatePreset(pres.id as any)}
                className={`py-2 px-3 border rounded-xl text-xs font-semibold text-left transition-all ${
                  template === pres.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-150 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pres.label}
              </button>
            ))}
          </div>
        </div>

        {/* ATS Score & Audit Feedback box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <Award className="h-4.5 w-4.5 text-indigo-600" />
              ATS Evaluation Index
            </h3>
            <button
              onClick={handleRunAtsAudit}
              disabled={isAuditing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAuditing ? 'Auditing Keyword Index...' : 'Run AI ATS Audit'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-indigo-50 bg-indigo-55/5">
              <span className={`text-2xl font-bold ${atsResume.atsScore >= 80 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                {atsResume.atsScore}
              </span>
              <span className="text-[9px] absolute bottom-1.5 font-bold text-gray-400">SCORE</span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold text-gray-800">Keywords Retention Check: {atsResume.atsScore >= 80 ? 'Optimal' : 'Needs Optimization'}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">To land technical developer callbacks or banking audits, target a score above 85%.</p>
            </div>
          </div>

          {/* Missing Keywords tracker */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Crucial Missing Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {atsResume.missingKeywords.map((kw, idx) => (
                <span key={idx} className="bg-red-50 text-red-700 font-semibold px-2.5 py-1 rounded-md text-[10px] border border-red-100">
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Improvement tips */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Bullet Point Recommendations</p>
            <ul className="space-y-1.5">
              {atsResume.improvementSuggestions.map((sug, idx) => (
                <li key={idx} className="text-[11px] text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-lg font-medium border-l-2 border-indigo-400">
                  {sug}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Job Tracking Addition Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3.5">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Briefcase className="h-4.5 w-4.5 text-indigo-600" />
            Add Job Application
          </h4>
          <div className="space-y-2.5">
            <input
              type="text"
              placeholder="Company name (e.g. Google, SBI Officer)"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Role / Code designation"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Core notes, deadlines, weak area revisions"
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <button
              onClick={addNewJobApplication}
              className="w-full bg-gray-950 hover:bg-black text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" /> Save Application
            </button>
          </div>
        </div>

      </div>

      {/* MIDDLE: Resume Preview and Custom Form Edit Canvas */}
      <div className="xl:col-span-1 space-y-4" id="resume-middle-workspace">
        
        {/* Navigation Tab Panel */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-2 flex gap-1 no-print">
          <button
            onClick={() => setMiddleTab('preview')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              middleTab === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> 👁️ Live Preview
          </button>
          <button
            onClick={() => setMiddleTab('customize')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              middleTab === 'customize' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" /> ✏️ Customize Fields
          </button>
          <button
            onClick={() => setMiddleTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              middleTab === 'upload' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" /> 📤 Upload AI
          </button>
        </div>

        {/* Dynamic Inner views */}
        {middleTab === 'preview' && (
          <div className="space-y-4">
            {/* Download/Export Action Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-wrap gap-2 justify-between items-center no-print">
              <span className="text-[11px] font-bold text-gray-400 capitalize">Download Live Resume:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={handlePrintPdf}
                  className="bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Uses browser print layout to compile a perfect A4 PDF"
                >
                  <Printer className="h-3.5 w-3.5" /> PDF / Print
                </button>
                <button
                  onClick={handleDownloadMd}
                  className="bg-sky-50 border border-sky-150 hover:bg-sky-100 text-sky-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> Markdown
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> Text
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="bg-purple-50 border border-purple-150 hover:bg-purple-100 text-purple-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Direct backup JSON can be loaded back into the program anytime"
                >
                  <FileJson className="h-3.5 w-3.5" /> JSON
                </button>
              </div>
            </div>

            {/* Simulated printable PDF Sheet */}
            <div 
              id="resume-printable-sheet" 
              className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5 font-sans text-gray-800"
            >
              {/* Header */}
              <div className="text-center space-y-1 pb-4 border-b border-gray-150">
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">{atsResume.fullName}</h3>
                <p className="text-[10.5px] text-gray-500 font-bold">{atsResume.email} | {atsResume.phone}</p>
                <div className="flex justify-center gap-3 text-[10px] text-indigo-600 font-semibold font-mono">
                  <span>{atsResume.linkedin}</span>
                  <span>{atsResume.github}</span>
                </div>
              </div>

              {/* Education Block */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-0.5">Education</h4>
                <pre className="text-[11px] font-sans text-gray-700 whitespace-pre-wrap leading-relaxed font-semibold">
                  {atsResume.education}
                </pre>
              </div>

              {/* Experience Block */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-0.5">Experience &amp; Track Project Achievements</h4>
                {atsResume.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-extrabold text-gray-800">{exp.company}</span>
                      <span className="text-gray-500 italic font-bold">{exp.duration}</span>
                    </div>
                    <p className="text-[10px] text-indigo-700 font-extrabold italic">{exp.role}</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {exp.bulletPoints.map((point, i) => (
                        <li key={i} className="text-[10px] text-gray-650 leading-relaxed font-medium">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Skills Block */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-0.5">Technical &amp; Core Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {atsResume.skills.map((sk, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-gray-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications Block */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-0.5">Honorary Certifications &amp; Credentials</h4>
                <ul className="space-y-1 list-disc list-inside">
                  {atsResume.certifications.map((cert, idx) => (
                    <li key={idx} className="text-[10px] text-gray-650 leading-relaxed font-semibold">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Customize Fields tab */}
        {middleTab === 'customize' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4 no-print">
            <div className="pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">✏️ Customize Portfolio Resume</h3>
              <p className="text-[10.5px] text-gray-400 mt-0.5">Directly modify resume contents. Updates auto-recalculate your ATS score index!</p>
            </div>

            {/* Profile fields */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact &amp; Personal Info</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Full Name</label>
                  <input
                    type="text"
                    value={atsResume.fullName}
                    onChange={(e) => setAtsResume(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Email Address</label>
                  <input
                    type="text"
                    value={atsResume.email}
                    onChange={(e) => setAtsResume(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Phone Info</label>
                  <input
                    type="text"
                    value={atsResume.phone}
                    onChange={(e) => setAtsResume(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">LinkedIn handle</label>
                  <input
                    type="text"
                    value={atsResume.linkedin}
                    onChange={(e) => setAtsResume(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500">GitHub Profile Link</label>
                  <input
                    type="text"
                    value={atsResume.github}
                    onChange={(e) => setAtsResume(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Education fields */}
            <div className="space-y-1 pt-1">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Academic Credentials &amp; Degrees</h4>
              <textarea
                value={atsResume.education}
                onChange={(e) => setAtsResume(prev => ({ ...prev, education: e.target.value }))}
                rows={3}
                placeholder="Degree info, GPA, major subjects..."
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Skills manager */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Technical Skills Tag Index</h4>
              <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-xl max-h-24 overflow-y-auto">
                {atsResume.skills.map((sk, idx) => (
                  <span key={idx} className="bg-white text-gray-800 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-bold border border-gray-200 flex items-center gap-1">
                    {sk}
                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Docker, pgVector"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Experience manager */}
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Professional Experience Timeline</h4>
                <button
                  onClick={handleAddExperienceEntry}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Position
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {atsResume.experience.map((exp, expIdx) => (
                  <div key={expIdx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-250 space-y-2 relative">
                    <button
                      onClick={() => handleRemoveExperienceEntry(expIdx)}
                      className="absolute right-2 top-2 p-1 text-red-505 hover:text-red-700 cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-gray-400">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-gray-400">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(expIdx, 'role', e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-gray-400">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleUpdateExperience(expIdx, 'duration', e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px]"
                        />
                      </div>
                    </div>

                    {/* Bullet points mapping */}
                    <div className="space-y-1 pb-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-gray-400">Impact Bullet Points</label>
                        <button
                          onClick={() => handleAddBulletPoint(expIdx)}
                          className="text-[9px] text-indigo-650 hover:text-indigo-800 font-bold"
                        >
                          + Bullet
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {exp.bulletPoints.map((pt, bulletIdx) => (
                          <div key={bulletIdx} className="flex gap-1.5 items-center">
                            <textarea
                              value={pt}
                              onChange={(e) => handleUpdateBulletPoint(expIdx, bulletIdx, e.target.value)}
                              rows={1}
                              className="flex-1 border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] resize-none"
                            />
                            <button
                              onClick={() => handleRemoveBulletPoint(expIdx, bulletIdx)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer font-mono"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications field */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Honorary Certifications &amp; Courses</h4>
              <div className="space-y-1">
                {atsResume.certifications.map((cert, idx) => (
                  <div key={idx} className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-medium">{cert}</span>
                    <button
                      onClick={() => handleRemoveCertification(idx)}
                      className="text-red-500 hover:text-red-100 font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. AWS Cloud Foundations Certification"
                  value={newCertText}
                  onChange={(e) => setNewCertText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCertification}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-1 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Upload & Parse tab */}
        {middleTab === 'upload' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4 no-print">
            <div className="pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">📤 Upload &amp; Parse CV</h3>
              <p className="text-[10.5px] text-gray-400 mt-0.5">Pre-populate your portfolio OS instantly from existing resumes using Gemini 3.5 AI extractors!</p>
            </div>

            {/* Central File Drop zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileParse(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive ? 'border-indigo-600 bg-indigo-50/15' : 'border-gray-200 hover:border-indigo-400'
              }`}
            >
              <input
                type="file"
                id="resume-file-uploader"
                accept=".txt,.md,.pdf,.json"
                className="hidden"
                onChange={(e) => { if (e.target.files && e.target.files[0]) handleFileParse(e.target.files[0]); }}
              />

              {isParsing ? (
                <div className="py-2 space-y-3 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-xs font-semibold text-gray-800">Gemini parsing file data... Wait a moment</p>
                  <p className="text-[10px] text-gray-400 italic">Analyzing schema, processing formatting structure, and filtering fields</p>
                </div>
              ) : (
                <label htmlFor="resume-file-uploader" className="cursor-pointer space-y-2 block">
                  <div className="flex justify-center">
                    <UploadCloud className="h-10 w-10 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">Drag and drop resume here, or <span className="text-indigo-600 underline">browse</span></p>
                    <p className="text-[10px] text-gray-400">Supports PDF, JSON configurations, and TXT files</p>
                  </div>
                </label>
              )}
            </div>

            {parseError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[11px] text-red-750 leading-relaxed font-semibold">
                ⚠️ Parser Alert: {parseError}
              </div>
            )}

            {/* Resume Raw Text Copy Paste Area */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Or Paste Raw Resume Text</label>
                {pastedText.trim().length > 0 && (
                  <button
                    onClick={() => setPastedText('')}
                    className="text-[10px] text-red-550 underline font-semibold"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the raw copy of your resume text here..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-900"
              />
              <button
                onClick={handleParsePastedText}
                disabled={isParsing || !pastedText.trim()}
                className="w-full bg-gray-950 hover:bg-black text-white font-bold text-xs py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isParsing ? 'Processing Clipboard text with AI...' : 'Parse Copy & Pasted Text'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Portfolio and Automated Project Builder Catalyst */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Project Generator Block */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
                <Layers className="h-4.5 w-4.5 text-indigo-600" />
                Portfolio Project Builder
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Deploy AI-tailored resume elements &amp; posts</p>
            </div>
            <select
              value={projectTrack}
              onChange={(e: any) => setProjectTrack(e.target.value)}
              className="text-[11px] font-bold bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-lg focus:outline-hidden"
            >
              <option value="Full Stack Web">💻 Full Stack Web</option>
              <option value="Generative AI & Automation">🤖 GenAI &amp; Auto</option>
            </select>
          </div>

          <button
            onClick={generatePortfolioProject}
            disabled={isProjectBuilding}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProjectBuilding ? 'Compiling AI project specs...' : `Generate Next ${projectTrack} Milestone Project`}
          </button>

          {/* Generated Project Showcase */}
          {customProject && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl space-y-1 border border-indigo-150">
                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">Suggested Project Title</span>
                <h4 className="text-xs font-bold text-indigo-900">{customProject.title}</h4>
                <p className="text-[11px] text-indigo-950 font-medium leading-relaxed mt-1">
                  <strong>Problem:</strong> {customProject.problemStatement}
                </p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Tech Stack: {customProject.techStack}</p>
              </div>

              {/* Actionable items */}
              <div className="space-y-2.5">
                {/* Resume Bullet Points */}
                <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ATS Bullet Points</span>
                    <button
                      onClick={() => handleCopy(customProject.resumePoints.join('\n'))}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === customProject.resumePoints.join('\n') ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy points
                    </button>
                  </div>
                  <ul className="space-y-1 list-disc list-inside">
                    {customProject.resumePoints.map((bp, i) => (
                      <li key={i} className="text-[10px] text-gray-600 leading-relaxed font-semibold">
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Growth LinkedIn Post */}
                <div className="bg-sky-50/50 p-3 rounded-xl space-y-1.5 border border-sky-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">LinkedIn Launch Announcement</span>
                    <button
                      onClick={() => handleCopy(customProject.linkedInPost)}
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === customProject.linkedInPost ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy post
                    </button>
                  </div>
                  <pre className="text-[10px] text-sky-950 font-sans whitespace-pre-wrap leading-relaxed italic bg-white p-2 rounded-lg border border-sky-100 max-h-24 overflow-y-auto">
                    {customProject.linkedInPost}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Career Applications tracker Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Career Pipeline</h4>
          <div className="space-y-3">
            {jobApps.map((app) => (
              <div key={app.id} className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-150">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">{app.company}</h5>
                    <p className="text-[10px] text-indigo-600 font-bold">{app.role}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    app.status === 'Interview' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    app.status === 'Offer' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    'bg-indigo-50 text-indigo-700 border border-indigo-150'
                  }`}>
                    {app.status}
                  </span>
                </div>
                {app.notes && <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{app.notes}</p>}
                
                {/* status selectors */}
                <div className="flex gap-1.5 pt-1">
                  {['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'].map((st: any) => (
                    <button
                      key={st}
                      onClick={() => updateJobStatus(app.id, st)}
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm transition-all cursor-pointer ${
                        app.status === st ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100 border border-gray-250 text-gray-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
