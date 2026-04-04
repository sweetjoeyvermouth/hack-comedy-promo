import React, { useState, useEffect } from 'react';

const JOAN = "'Joan', 'Georgia', serif";
const CHAR_DELAY_MS = 28;
// Auto-advance to film this many ms after typewriter finishes
const AUTO_ADVANCE_MS = 3500;

export default function CritiqueDisplay({ text, jokeType, onWatchFilm, onTryAgain }) {
  const [displayed, setDisplayed] = useState('');
  const [complete, setComplete]   = useState(false);

  const isSteal     = jokeType === 'steal';
  const accentColor = isSteal ? '#c9963a' : '#dc2626';

  // Typewriter
  useEffect(() => {
    setDisplayed('');
    setComplete(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setComplete(true);
        clearInterval(id);
      }
    }, CHAR_DELAY_MS);
    return () => clearInterval(id);
  }, [text]);

  // Auto-advance to film once typewriter finishes
  useEffect(() => {
    if (!complete) return;
    const t = setTimeout(() => onWatchFilm(), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [complete, onWatchFilm]);

  return (
    <div className="fade-up">
      {/* Label */}
      <p style={{
        color: accentColor,
        fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
        letterSpacing: '0.38em',
        textTransform: 'uppercase',
        opacity: 0.7,
        fontFamily: JOAN,
        marginBottom: '0.75rem',
      }}>
        {isSteal ? '— Judge\'s Notes —' : '— Audience Review —'}
      </p>

      {/* Quote mark */}
      <span style={{
        display: 'block',
        color: accentColor,
        fontSize: 'clamp(3rem, 5vw, 5rem)',
        opacity: 0.2,
        lineHeight: 1,
        marginBottom: '0.25rem',
        fontFamily: JOAN,
      }}>
        "
      </span>

      {/* Typewriter text */}
      <div style={{
        borderLeft: `3px solid ${accentColor}`,
        paddingLeft: '1.4rem',
        marginBottom: '2.5rem',
        minHeight: '5rem',
      }}>
        <p style={{
          color: '#f0ebe0',
          fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
          lineHeight: 1.55,
          fontFamily: JOAN,
          margin: 0,
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
        }}>
          {displayed}
          {!complete && (
            <span className="tw-cursor" style={{ color: accentColor }}>|</span>
          )}
        </p>
      </div>

      {/* Try again — only escape hatch, auto-advance handles the film */}
      {complete && (
        <button
          onClick={onTryAgain}
          className="fade-up"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(240,235,224,0.28)',
            fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
            letterSpacing: '0.25em',
            fontFamily: JOAN,
            cursor: 'pointer',
            padding: '0.4rem 0',
            display: 'block',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.28)')}
        >
          Try again
        </button>
      )}
    </div>
  );
}
