"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedParticles() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // gentle looping motion for each particle
      gsap.to('.particle-1', { x: -40, y: 20, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.particle-2', { x: 30, y: -30, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.particle-3', { x: -20, y: 25, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // subtle scroll-parallax using ScrollTrigger
      gsap.to('.particle-1', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom top', scrub: 0.4 }
      });
      gsap.to('.particle-2', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom top', scrub: 0.3 }
      });

      // gentle rotate loop for depth
      gsap.to('.particle-3', { rotation: 8, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // mouse parallax — move particles slightly based on pointer position
      const handleMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth) * 2 - 1; // -1..1
        const y = (e.clientY / innerHeight) * 2 - 1; // -1..1
        mousePos.current = { x, y };
        gsap.to('.particle-1', { x: -40 + x * 12, y: 20 + y * 12, duration: 0.6, ease: 'power3.out' });
        gsap.to('.particle-2', { x: 30 + x * 10, y: -30 + y * 8, duration: 0.6, ease: 'power3.out' });
        gsap.to('.particle-3', { x: -20 + x * 6, y: 25 + y * 6, duration: 0.6, ease: 'power3.out' });
      };

      window.addEventListener('mousemove', handleMove);

      // cleanup handler will remove listener via ctx.revert below
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none">
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
    </div>
  );
}
