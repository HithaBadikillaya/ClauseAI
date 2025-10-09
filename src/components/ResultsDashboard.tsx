"use client";

import React from 'react';
import FairnessGauge from './FairnessGauge';

export default function ResultsDashboard({ summary, flags, onSelectClause }: { summary?: string; flags?: Array<{ clause: string; level: 'high'|'medium'|'low' }> , onSelectClause?: (flag: { clause: string; level: 'high'|'medium'|'low' }) => void }) {
  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Summary</h4>
          <div className="text-sm muted mt-1 whitespace-pre-wrap">{summary || 'No summary yet'}</div>
        </div>
        <div>
          <FairnessGauge score={0.72} />
        </div>
      </div>

      <div className="card p-4">
        <h4 className="font-semibold mb-3">Flagged Clauses</h4>
        <div className="space-y-3">
          {(flags || []).length === 0 ? <div className="muted">No flagged clauses</div> : flags!.map((f, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onSelectClause && onSelectClause(f)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (onSelectClause) onSelectClause(f); } }}
              className={`p-3 rounded border cursor-pointer focus:outline-none focus:ring ${f.level === 'high' ? 'border-red-300 bg-red-50' : f.level === 'medium' ? 'border-yellow-300 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
              <div className="text-sm mb-1 whitespace-pre-wrap text-black">{f.clause}</div>
              <div className="text-xs font-medium text-black">Level: {f.level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
