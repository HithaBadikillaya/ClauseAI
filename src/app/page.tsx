"use client";

import React, { useState } from 'react';
import Hero from '../components/Hero';
import UploadBox from '../components/UploadBox';
import ResultsDashboard from '../components/ResultsDashboard';
import ClauseModal from '../components/ClauseModal';
import AnimatedParticles from '../components/AnimatedParticles';

type Flag = { clause: string; level: 'high' | 'medium' | 'low'; reasons?: string[] };

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [flags, setFlags] = useState<Flag[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedClause, setSelectedClause] = useState<string | undefined>(undefined);
  const [modalReasons, setModalReasons] = useState<string[] | undefined>(undefined);

  // Demo analyze handler — replace with real API integration
  async function handleAnalyze() {
    setLoadingAnalyze(true);
    try {
      // simulate work / API call
      await new Promise((res) => setTimeout(res, 700));
      // basic demo summary and no-op when no input provided
      setSummary('Upload or paste a clause to analyze.');
      setFlags([]);
    } finally {
      setLoadingAnalyze(false);
    }
  }

  // Analyze pasted text (called from Hero)
  async function handleAnalyzeText(text: string) {
    // In a real app, send `text` to backend analyze endpoint. Here we simulate.
    setLoadingAnalyze(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      const detected = analyzeTextHeuristics(text);
      setSummary(text.length > 480 ? text.slice(0, 480) + '...' : text);
      setFlags(detected);
    } finally {
      setLoadingAnalyze(false);
    }
  }

  // Heuristic multi-risk analyzer: returns multiple flags with reasons
  function analyzeTextHeuristics(text: string): Flag[] {
    const flags: Flag[] = [];
    if (!text || !text.trim()) return flags;
    const t = text.replace(/\n/g, ' ');
    const sentences = t.split(/(?<=[.?!;])\s+/).map(s => s.trim()).filter(Boolean);

    // Rules mapping keywords to risk types and suggested reasons
    const rules: { name: string; keywords: string[]; level: Flag['level']; reason: string }[] = [
      { name: 'data_sharing', keywords: ['data', 'share', 'user information', 'user info', 'personal data', 'personal information'], level: 'high', reason: 'Clause allows sharing user or proprietary data with third parties or affiliates.' },
      { name: 'proprietary_code', keywords: ['proprietary code', 'proprietary', 'source code'], level: 'high', reason: 'Clause permits sharing proprietary code with subcontractors or partners.' },
      { name: 'waiver_audit', keywords: ['waive', 'waives', 'audit', 'audit or review', 'waive any right to audit', 'waives any right'], level: 'high', reason: 'Clause waives client rights to audit or review third-party activities.' },
      { name: 'liability_release', keywords: ['releases', 'release from all liability', 'release the service provider from liability', 'releases the service provider'], level: 'high', reason: 'Clause releases the provider from liability for misuse, delays, or financial losses.' },
      { name: 'jurisdiction', keywords: ['jurisdiction', 'governing law', 'venue', 'resolved solely'], level: 'medium', reason: 'Clause forces disputes into provider-favored jurisdiction, limiting client remedies.' },
      { name: 'cap_compensation', keywords: ['not exceed', '% of the total project value', '2% of'], level: 'medium', reason: 'Clause caps client compensation to a small percentage of total project value.' },
      { name: 'subcontractors', keywords: ['subcontractors', 'sub-contractors', 'subcontractor'], level: 'high', reason: 'Clause allows provider to share data with subcontractors.' },
      { name: 'marketing', keywords: ['marketing affiliates', 'affiliates', 'marketing'], level: 'medium', reason: 'Clause shares data with marketing affiliates which may use data for marketing purposes.' },
    ];

    // Check each sentence against rules and create flags for matches
    for (const s of sentences) {
      const lower = s.toLowerCase();
      for (const r of rules) {
        for (const kw of r.keywords) {
          if (lower.includes(kw)) {
            // Avoid duplicate flag for same sentence+rule
            if (!flags.some(f => f.clause === s && f.reasons && f.reasons.includes(r.reason))) {
              flags.push({ clause: s, level: r.level, reasons: [r.reason] });
            }
            break; // stop checking other keywords for this rule for this sentence
          }
        }
      }
    }

    // If no sentence-level flags found, run whole-text heuristics
    if (flags.length === 0) {
      const lower = t.toLowerCase();
      for (const r of rules) {
        for (const kw of r.keywords) {
          if (lower.includes(kw)) {
            flags.push({ clause: t.slice(0, 320) + (t.length > 320 ? '...' : ''), level: r.level, reasons: [r.reason] });
            break;
          }
        }
      }
    }

    return flags;
  }

  function handleClear() {
    setFile(null);
    setFileName('');
    setSummary('');
    setFlags([]);
  }

  function handleSelectClause(flag: Flag) {
    // Create simple explainability reasons based on the flag level and content.
    const reasons: string[] = [];
    if (flag.level === 'high') reasons.push('Language indicates broad data sharing with third parties.');
    if (flag.clause.toLowerCase().includes('arbitration')) reasons.push('Arbitration clauses can limit legal recourse and specify venue.');
    if (reasons.length === 0) reasons.push('Flagged by heuristic patterns for potentially risky language.');

    setSelectedClause(flag.clause);
    setModalReasons(reasons);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 overflow-hidden">
  <AnimatedParticles />
  <Hero onAnalyzeText={handleAnalyzeText} />

      <main id="top" className="container-xl grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <UploadBox onFile={(f: File) => { setFile(f); setFileName(f.name); }} />
            <div className="mt-4 flex gap-3">
              <button className="btn-primary" onClick={handleAnalyze} disabled={loadingAnalyze}>{loadingAnalyze ? 'Analyzing…' : 'Analyze'}</button>
              <button className="px-4 py-2 rounded border" onClick={handleClear}>Clear</button>
              {fileName && <div className="ml-3 text-sm muted">{fileName}</div>}
            </div>
          </div>

          <ResultsDashboard summary={summary} flags={flags} onSelectClause={handleSelectClause} />
        </section>
        <aside className="md:col-span-1">
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Analysis Tools</h3>
            <p className="text-sm muted">Run targeted checks and generate explainable outputs.</p>
            <div className="mt-4 space-y-2">
              <button className="w-full btn-primary" onClick={handleAnalyze} disabled={loadingAnalyze}>{loadingAnalyze ? 'Analyzing…' : 'Full analysis'}</button>
              <button className="w-full btn-outline" onClick={() => alert('Clause scan (demo): highlights clauses like data sharing, arbitration, tracking.')}>Clause scan</button>
              <button className="w-full btn-outline" onClick={() => alert('Explainability demo: click flagged clause to see reasons.')}>Explainability</button>
            </div>
          </div>
        </aside>
      </main>

      {/* Features section */}
      <section id="features" className="container-xl mt-10">
        <h2 className="text-2xl font-semibold mb-3">Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h4 className="font-medium">Plain-language summaries</h4>
            <p className="text-sm muted mt-2">Automatically condense long clauses into easy-to-read summaries.</p>
          </div>
          <div className="card p-4">
            <h4 className="font-medium">Clause risk detection</h4>
            <p className="text-sm muted mt-2">Detects data-sharing, arbitration, tracking, and other high-risk language with confidence scores.</p>
          </div>
          <div className="card p-4">
            <h4 className="font-medium">Explainability</h4>
            <p className="text-sm muted mt-2">Provides reasons and example language so you understand why a clause was flagged.</p>
          </div>
        </div>
      </section>

      {/* Docs / How to use */}
      <section id="docs" className="container-xl mt-8">
        <h2 className="text-2xl font-semibold mb-3">Docs — How to use ClauseAI</h2>
        <div className="card p-4">
          <ol className="list-decimal list-inside text-sm muted space-y-2">
            <li>Upload a contract or paste text into the hero box.</li>
            <li>Click &quot;Full analysis&quot; to summarize and scan for risky clauses.</li>
            <li>Click any flagged clause to see explainability details and suggested language.</li>
            <li>Use the fairness gauge to understand how comprehensive the scan was.</li>
          </ol>
        </div>
      </section>

  <ClauseModal open={modalOpen} onClose={() => setModalOpen(false)} clause={selectedClause} reasons={modalReasons} />
    </div>
  );
}
