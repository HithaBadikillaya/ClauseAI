"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 py-8 bg-gradient-to-t from-white/95 to-transparent border-t border-white/6">
      <div className="container-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-700">© {new Date().getFullYear()} ClauseAI · AI Transparency · Ethical NLP</div>
        <div className="flex items-center gap-4">
          <a className="text-sm muted hover:underline" href="#privacy">Privacy</a>
          <a className="text-sm muted hover:underline" href="#terms">Terms</a>
          <a className="text-sm muted hover:underline" href="#docs">Docs</a>
        </div>
      </div>
    </footer>
  );
}
