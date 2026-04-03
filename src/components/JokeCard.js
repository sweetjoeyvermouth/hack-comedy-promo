import React, { useState } from 'react';

export default function JokeCard({ joke, onStart, onBack }) {
  const [startHovered, setStartHovered] = useState(false);

  return (
    <div className="fade-up">
      <p
        className="font-bold uppercase"
        style={{
          color: 'rgba(201,150,58,0.65)',
          fontSize: '0.6rem',
          letterSpacing: '0.42em',
          marginBottom: '1.1rem',
        }}
      >
        ← Your Material (Allegedly)
      </p>

      {/* Card */}
      <div
        style={{
          position: 'relative',
          border: '1px solid rgba(201,150,58,0.35)',
          background: 'rgba(201,150,58,0.04)',
          padding: '1.4rem',
          marginBottom: '1.4rem',
        }}
      >
        {/* Corner brackets */}
        {[
          { top: -1, left: -1, borderTop: true, borderLeft: true },
          { top: -1, right: -1, borderTop: true, borderRight: true },
          { bottom: -1, left: -1, borderBottom: true, borderLeft: true },
          { bottom: -1, right: -1, borderBottom: true, borderRight: true },
        ].map((corner, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              ...(corner.top    !== undefined && { top: corner.top }),
              ...(corner.bottom !== undefined && { bottom: corner.bottom }),
              ...(corner.left   !== undefined && { left: corner.left }),
              ...(corner.right  !== undefined && { right: corner.right }),
              borderTop:    corner.borderTop    ? '2px solid #c9963a' : 'none',
              borderBottom: corner.borderBottom ? '2px solid #c9963a' : 'none',
              borderLeft:   corner.borderLeft   ? '2px solid #c9963a' : 'none',
              borderRight:  corner.borderRight  ? '2px solid #c9963a' : 'none',
            }}
          />
        ))}

        <p
          className="font-bold uppercase"
          style={{
            color: '#c9963a',
            fontSize: '0.55rem',
            letterSpacing: '0.35em',
            marginBottom: '0.8rem',
            opacity: 0.55,
          }}
        >
          "Borrow" This Joke
        </p>

        <p
          style={{
            color: '#f0ebe0',
            fontSize: '1rem',
            lineHeight: 1.65,
            fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          }}
        >
          {joke}
        </p>
      </div>

      <p
        style={{
          color: 'rgba(240,235,224,0.42)',
          fontSize: '0.8rem',
          lineHeight: 1.65,
          marginBottom: '1.4rem',
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        }}
      >
        Read this into the mic.{' '}
        <span style={{ color: 'rgba(240,235,224,0.22)' }}>We'll pretend it's yours.</span>
      </p>

      {/* Start button */}
      <button
        onClick={onStart}
        onMouseEnter={() => setStartHovered(true)}
        onMouseLeave={() => setStartHovered(false)}
        style={{
          width: '100%',
          border: '2px solid #c9963a',
          background: startHovered ? '#f5c842' : '#c9963a',
          borderColor: startHovered ? '#f5c842' : '#c9963a',
          color: '#080808',
          padding: '0.9rem 2rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          marginBottom: '0.85rem',
          transform: startHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.14s ease',
        }}
      >
        → I'm Ready
      </button>

      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(240,235,224,0.22)',
          fontSize: '0.6rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
          fontWeight: 700,
          padding: '0.4rem 0',
          display: 'block',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.5)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.22)')}
      >
        ← Back
      </button>
    </div>
  );
}
