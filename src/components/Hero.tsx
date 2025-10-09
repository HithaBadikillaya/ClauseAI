"use client";

import React, { useRef, useState } from 'react';

type Props = {
  onAnalyzeText?: (text: string) => Promise<void> | void;
};

export default function Hero({ onAnalyzeText }: Props) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const heroRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  async function handlePasteSubmit() {
    if (!pastedText) return;
    if (onAnalyzeText) {
      await onAnalyzeText(pastedText);
    }
    setPastedText('');
  }

  return (
    <section ref={heroRef} className="relative overflow-hidden mb-6 hero">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071428] via-[#0b1b2c] to-[#0f2a44] opacity-90 z-0" />
      <div className="relative z-10 container-xl py-12 text-white grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Understand before you agree.</h1>
          <p className="mt-4 text-lg max-w-3xl opacity-90">ClauseAI simplifies legal and policy text into plain language, highlights risky clauses, and explains why — so you can decide with confidence.</p>

          <div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex gap-3">
              <button className="btn-primary">Upload document</button>
              <button className="btn-outline" onClick={() => setMode(mode === 'upload' ? 'paste' : 'upload')}>{mode === 'upload' ? 'Paste text' : 'Upload'}</button>
            </div>
            <div className="ml-0 sm:ml-4 text-sm muted">Try pasting copy from a contract or privacy policy — no file required.</div>
          </div>

          {/* Paste mode UI */}
          {mode === 'paste' && (
            <div className="mt-6">
              <label className="sr-only">Paste contract text</label>
              <textarea
                className="w-full min-h-[140px] rounded-lg p-4 bg-white text-black shadow-glow"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste contract or policy text here..."
              />

              <div className="mt-3 flex gap-3">
                <button className="btn-primary" onClick={handlePasteSubmit} disabled={!pastedText}>Analyze pasted text</button>
                <button className="px-4 py-2 rounded border bg-white/10" onClick={() => setPastedText('')}>Clear</button>
                <div className="ml-3 text-sm muted">Detects data-sharing, arbitration, tracking and more.</div>
              </div>
            </div>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="w-full rounded-lg p-5 shadow-2xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold-500/95 flex items-center justify-center text-slate-900 font-bold">⚖️</div>
              <div>
                <div className="text-sm opacity-90">AI Assisted</div>
                <div className="text-xs opacity-80">Law + Tech</div>
              </div>
            </div>

            <div className="mt-4 text-sm opacity-85">Realtime scanning • Explainable flags • Fairness metrics</div>

            <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00ffea] to-[#6dd3ff] animate-scan" style={{ width: '46%' }} />
            </div>

            <div className="mt-4 text-xs muted">Tip: use the Paste option for quick checks of snippets.</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
