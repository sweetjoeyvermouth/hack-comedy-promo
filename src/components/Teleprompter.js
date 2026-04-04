import React, { useState, useEffect, useRef } from 'react';

// Scroll duration scales with joke length — ~3s per 10 words, min 15s
function scrollDuration(text) {
  const words = text.split(' ').length;
  return Math.max(15, Math.round((words / 10) * 3) * 2);
}

export default function Teleprompter({ intro, joke, comedian, onStop }) {
  const [scrolling, setScrolling] = useState(false);
  const [hov, setHov] = useState(false);
  const duration = scrollDuration(joke);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    // Brief pause so user can orient before scroll begins
    const t = setTimeout(() => setScrolling(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fade-up"
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(2px)',
        zIndex: 30,
        padding: '6rem 2rem 5rem',
        overflow: 'hidden',
      }}
    >
      {/* Intro phrase */}
      <p
        style={{
          color: 'rgba(201,150,58,0.75)',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
          letterSpacing: '0.2em',
          fontStyle: 'italic',
          marginBottom: '2.5rem',
          textAlign: 'center',
          fontFamily: "'Joan','Georgia',serif",
          opacity: scrolling ? 0 : 1,
          transition: 'opacity 1.5s ease',
        }}
      >
        {intro}
      </p>

      {/* Joke + comedian — the scrolling block */}
      <div
        style={{
          transition: scrolling ? `transform ${duration}s linear` : 'none',
          transform: scrolling ? 'translateY(-28vh)' : 'translateY(0)',
          textAlign: 'center',
          maxWidth: 680,
          padding: '0 1rem',
        }}
      >
        <p
          style={{
            color: '#f0ebe0',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
            lineHeight: 1.5,
            fontWeight: 700,
            fontFamily: "'Joan','Georgia',serif",
            marginBottom: '1.5rem',
            textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}
        >
          {joke}
        </p>

        <p
          style={{
            color: '#c9963a',
            fontSize: 'clamp(0.85rem, 1.8vw, 1.1rem)',
            letterSpacing: '0.15em',
            fontStyle: 'italic',
            fontFamily: "'Joan','Georgia',serif",
            opacity: 0.85,
          }}
        >
          — {comedian}
        </p>
      </div>

      {/* REC indicator */}
      <div
        style={{
          position: 'absolute', top: 32, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <div
          className="rec-dot"
          style={{ width: 9, height: 9, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }}
        />
        <span
          style={{
            color: '#dc2626', fontSize: '0.6rem',
            letterSpacing: '0.5em', fontWeight: 700, textTransform: 'uppercase',
            fontFamily: "'Joan','Georgia',serif",
          }}
        >
          REC
        </span>
      </div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: '3rem' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              background: i % 3 === 0 ? '#dc2626' : 'rgba(220,38,38,0.55)',
              animationDelay: `${(i * 0.08) % 0.65}s`,
              animationDuration: `${0.38 + (i % 5) * 0.09}s`,
            }}
          />
        ))}
      </div>

      {/* Done button */}
      <button
        onClick={onStop}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          border: '1px solid rgba(220,38,38,0.5)',
          background: hov ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.4)',
          color: '#ef4444',
          padding: '0.65rem 2.2rem',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.38em', textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: "'Joan','Georgia',serif",
          transition: 'background 0.15s',
        }}
      >
        Done
      </button>
    </div>
  );
}
