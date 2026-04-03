import React, { useState, useEffect } from 'react';

// 18 bars with staggered animation delays for an organic waveform look
const BAR_COUNT = 18;

export default function ListeningIndicator({ jokeType, onStop }) {
  const [elapsed, setElapsed] = useState(0);
  const [stopHovered, setStopHovered] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fade-up text-center">
      {/* REC badge */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className="rec-dot"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#dc2626',
            flexShrink: 0,
          }}
        />
        <span
          className="font-bold"
          style={{
            color: '#dc2626',
            fontSize: '0.65rem',
            letterSpacing: '0.55em',
            textTransform: 'uppercase',
          }}
        >
          REC
        </span>
      </div>

      {/* Waveform */}
      <div
        className="flex items-center justify-center gap-[3px] mb-6"
        style={{ height: 40 }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              background: i % 3 === 0 ? '#dc2626' : 'rgba(220,38,38,0.55)',
              animationDelay: `${(i * 0.073) % 0.65}s`,
              animationDuration: `${0.38 + (i % 5) * 0.09}s`,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <p
        className="font-bold mb-1"
        style={{
          color: 'rgba(240,235,224,0.28)',
          fontSize: '0.7rem',
          letterSpacing: '0.45em',
        }}
      >
        {fmt(elapsed)}
      </p>

      {/* Hint */}
      <p
        style={{
          color: 'rgba(240,235,224,0.48)',
          fontSize: '0.78rem',
          lineHeight: 1.65,
          marginBottom: '1.6rem',
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        }}
      >
        {jokeType === 'steal' ? 'Reading...' : "We're listening..."}
        <br />
        <span style={{ fontSize: '0.62rem', color: 'rgba(240,235,224,0.24)' }}>
          Stops automatically after silence
        </span>
      </p>

      {/* Done button */}
      <button
        onClick={onStop}
        onMouseEnter={() => setStopHovered(true)}
        onMouseLeave={() => setStopHovered(false)}
        style={{
          border: '1px solid rgba(220,38,38,0.5)',
          background: stopHovered ? 'rgba(220,38,38,0.22)' : 'rgba(220,38,38,0.08)',
          color: '#ef4444',
          padding: '0.75rem 2.2rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          transition: 'background 0.15s',
        }}
      >
        Done
      </button>
    </div>
  );
}
