import React, { useState } from 'react';

export default function JokeCard({ intro, joke, isRecording, onStart, onStop }) {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div className="fade-up w-full" style={{ maxWidth: 360 }}>
      {/* Steal intro phrase */}
      <p
        style={{
          color: 'rgba(201,150,58,0.75)',
          fontSize: '0.82rem',
          lineHeight: 1.55,
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          fontStyle: 'italic',
          marginBottom: '1.25rem',
        }}
      >
        {intro}
      </p>

      {/* Joke card */}
      <div
        style={{
          position: 'relative',
          border: '1px solid rgba(201,150,58,0.3)',
          background: 'rgba(8,8,8,0.6)',
          padding: '1.4rem',
          marginBottom: '1.4rem',
        }}
      >
        {/* Corner brackets */}
        {[
          { top: -1, left: -1, t: true, l: true },
          { top: -1, right: -1, t: true, r: true },
          { bottom: -1, left: -1, b: true, l: true },
          { bottom: -1, right: -1, b: true, r: true },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 11, height: 11,
              ...(c.top    !== undefined && { top: c.top }),
              ...(c.bottom !== undefined && { bottom: c.bottom }),
              ...(c.left   !== undefined && { left: c.left }),
              ...(c.right  !== undefined && { right: c.right }),
              borderTop:    c.t ? '2px solid #c9963a' : 'none',
              borderBottom: c.b ? '2px solid #c9963a' : 'none',
              borderLeft:   c.l ? '2px solid #c9963a' : 'none',
              borderRight:  c.r ? '2px solid #c9963a' : 'none',
            }}
          />
        ))}

        <p
          style={{
            color: '#f0ebe0',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          }}
        >
          {joke}
        </p>
      </div>

      {/* REC indicator — only during recording */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-4">
          <div
            className="rec-dot"
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }}
          />
          <span
            className="font-bold"
            style={{ color: '#dc2626', fontSize: '0.6rem', letterSpacing: '0.5em', textTransform: 'uppercase' }}
          >
            REC
          </span>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={isRecording ? onStop : onStart}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          width: '100%',
          border: isRecording
            ? '1px solid rgba(220,38,38,0.5)'
            : '2px solid #c9963a',
          background: isRecording
            ? (btnHovered ? 'rgba(220,38,38,0.22)' : 'rgba(220,38,38,0.08)')
            : (btnHovered ? '#f5c842' : '#c9963a'),
          borderColor: isRecording
            ? (btnHovered ? 'rgba(220,38,38,0.7)' : 'rgba(220,38,38,0.5)')
            : (btnHovered ? '#f5c842' : '#c9963a'),
          color: isRecording ? '#ef4444' : '#080808',
          padding: '0.9rem 2rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          transform: btnHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.14s ease',
        }}
      >
        {isRecording ? 'Done' : '→ Start Recording'}
      </button>
    </div>
  );
}
