"use client";

import React from 'react';

export default function FairnessGauge({ score = 0.72 }: { score?: number }) {
  const pct = Math.max(0, Math.min(1, score));
  const dash = 250 * pct; // rough stroke-dashoffset
  return (
    <div className="w-40 h-20 flex flex-col items-center">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#f6c84c" />
            <stop offset="100%" stopColor="#ffd86b" />
          </linearGradient>
        </defs>
        <path d="M10 45 A40 40 0 0 1 90 45" stroke="#2b4158" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M10 45 A40 40 0 0 1 90 45" stroke="url(#g1)" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={250} strokeDashoffset={250 - dash} style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.9,.2,1)' }} />
      </svg>
      <div className="text-sm mt-1 text-slate-700 dark:text-slate-200">Fairness {Math.round(pct * 100)}%</div>
    </div>
  );
}
