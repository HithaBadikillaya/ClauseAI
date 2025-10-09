"use client";

import React, { useRef, useState } from 'react';

export default function UploadBox({ onFile }: { onFile?: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = useState(false);

  return (
    <div className={`border-2 rounded-xl p-6 ${hover ? 'border-gold-400 shadow-glow' : 'border-dashed border-slate-300'}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && onFile) onFile(f); }} />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-2xl">📄</div>
        <div>
          <div className="font-semibold">Drag & drop or click to upload</div>
          <div className="text-sm muted">PDFs, Terms, Privacy Policies, EULAs</div>
        </div>
      </div>
    </div>
  );
}
