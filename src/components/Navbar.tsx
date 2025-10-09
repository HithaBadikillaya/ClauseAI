"use client";

import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-white/6 backdrop-blur bg-white/4">
      <div className="container-xl flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <a href="#top" className="text-2xl font-bold text-white">ClauseAI</a>
          <div className="text-sm muted hidden sm:block">Understand legal text • Protect your users</div>
        </div>

        <div className="flex items-center gap-3">
          <a className="text-sm text-white/90 hover:underline" href="#features">Features</a>
          <a className="text-sm text-white/90 hover:underline" href="#docs">Docs</a>
          <a className="text-sm text-white/90 hover:underline" href="#get-started">Get started</a>
          <button className="ml-3 btn-primary">Sign in</button>
        </div>
      </div>
    </nav>
  );
}
