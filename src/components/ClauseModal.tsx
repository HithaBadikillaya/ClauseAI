"use client";

import React from 'react';

export default function ClauseModal({ open, onClose, clause, reasons }: { open: boolean; onClose: () => void; clause?: string; reasons?: string[] }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-t-lg md:rounded-lg max-w-2xl w-full p-6 z-10 shadow-xl transform translate-y-0 transition-transform duration-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Why this clause was flagged</h3>
            <p className="text-sm muted mt-1">Explainable reasons from the AI and rules engine</p>
          </div>
          <button onClick={onClose} className="text-slate-600 dark:text-slate-200">Close</button>
        </div>

        <div className="mt-4 text-sm whitespace-pre-wrap">{clause}</div>

        <div className="mt-4">
          <h4 className="text-sm font-medium">Reasons</h4>
          <ul className="list-disc pl-5 mt-2 text-sm">
            {(reasons || []).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
