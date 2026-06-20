import React, { useState } from 'react';
import { ubuntuGuides, UbuntuGuide } from '../data';
import { Search, Terminal, ClipboardCheck, AlertCircle, PlayCircle, BookOpen, Check } from 'lucide-react';

export default function UbuntuGuides() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<UbuntuGuide>(ubuntuGuides[0]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const filteredGuides = ubuntuGuides.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6" id="ubuntu-guides-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-600" />
            Ubuntu Linux Development Assistant
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Exact setup instructions, installation commands, troubleshooting, and project initialization for your Ubuntu environment.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search setup guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation panel */}
        <div className="lg:col-span-1 space-y-2 border-r border-gray-100 pr-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Supported stacks</p>
          <div className="space-y-1">
            {filteredGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  selectedGuide.id === guide.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{guide.name.split(' ')[0]}</span>
                {selectedGuide.id === guide.id && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>}
              </button>
            ))}
            {filteredGuides.length === 0 && (
              <p className="text-xs text-gray-400 p-3 italic">No matching guides found.</p>
            )}
          </div>
        </div>

        {/* Content panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              {selectedGuide.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Complete step-by-step setup parameters</p>
          </div>

          {/* Installation Block */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-emerald-600" />
              1. Installation Terminal Script
            </h4>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed shadow-inner">
                {selectedGuide.install.join('\n')}
              </pre>
              <button
                onClick={() => copyToClipboard(selectedGuide.install.join('\n'))}
                className="absolute right-3 top-3 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border border-gray-700 font-medium"
              >
                {copiedText === selectedGuide.install.join('\n') ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Block */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <Check className="h-4 w-4 text-sky-600" />
              2. Verification &amp; Testing
            </h4>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed shadow-inner">
                {selectedGuide.verify.join('\n')}
              </pre>
              <button
                onClick={() => copyToClipboard(selectedGuide.verify.join('\n'))}
                className="absolute right-3 top-3 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border border-gray-700 font-medium"
              >
                {copiedText === selectedGuide.verify.join('\n') ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Project setup Block */}
          {selectedGuide.projectSetup.length > 0 && selectedGuide.projectSetup[0] !== '' && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-purple-600" />
                3. Create Your First Project
              </h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed shadow-inner">
                  {selectedGuide.projectSetup.join('\n')}
                </pre>
                <button
                  onClick={() => copyToClipboard(selectedGuide.projectSetup.join('\n'))}
                  className="absolute right-3 top-3 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border border-gray-700 font-medium"
                >
                  {copiedText === selectedGuide.projectSetup.join('\n') ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Troubleshooting Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
              <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Troubleshooting &amp; Fixes
              </h5>
              <div className="space-y-1.5">
                {selectedGuide.troubleshoot.map((t, idx) => (
                  <p key={idx} className="text-xs text-amber-900 font-medium leading-relaxed">
                    {t}
                  </p>
                ))}
              </div>
            </div>

            {/* Best practices Block */}
            <div className="p-4 bg-indigo-55/10 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
              <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Industry Standards &amp; Conventions
              </h5>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-indigo-950/80 leading-relaxed font-medium">
                {selectedGuide.bestPractices.map((bp, idx) => (
                  <li key={idx}>
                    {bp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
