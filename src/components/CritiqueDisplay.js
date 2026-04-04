import React, { useState, useEffect } from 'react';

const CHAR_DELAY_MS = 32;

export default function CritiqueDisplay({ text, jokeType, onWatchFilm, onTryAgain }) {
  const [displayed, setDisplayed] = useState('');
  const [complete, setComplete]   = useState(false);
  const [filmHovered, setFilmHovered] = useState(false);
  // filmHovered used on the just-play-the-video button

  const isSteal = jokeType === 'steal';
  const accentColor = isSteal ? '#c9963a' : '#dc2626';

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

  return (
    <div className="fade-up">
      {/* Label */}
      <p
        className="font-bold uppercase mb-4"
        style={{
          color: accentColor,
          fontSize: '0.58rem',
          letterSpacing: '0.45em',
          opacity: 0.65,
        }}
      >
        {isSteal ? '— Judge\'s Notes —' : '— Audience Review —'}
      </p>

      {/* Quote mark */}
      <span
        className="block font-bold leading-none mb-2"
        style={{ color: accentColor, fontSize: '3rem', opacity: 0.25, lineHeight: 1 }}
      >
        "
      </span>

      {/* Typewriter text */}
      <div
        style={{
          borderLeft: `3px solid ${accentColor}`,
          paddingLeft: '1.2rem',
          marginBottom: '2rem',
          minHeight: '4rem',
        }}
      >
        <p
          className="font-bold"
          style={{
            color: '#f0ebe0',
            fontSize: '1.05rem',
            lineHeight: 1.62,
            fontFamily: "'Joan', 'Georgia', serif",
          }}
        >
          {displayed}
          {!complete && (
            <span className="tw-cursor" style={{ color: accentColor }}>
              |
            </span>
          )}
        </p>
      </div>

      {/* Actions — appear once typewriter finishes */}
      {complete && (
        <div className="fade-up flex flex-col gap-3">
          {/* Just play the video — asset button */}
          <button
            onClick={onWatchFilm}
            onMouseEnter={() => setFilmHovered(true)}
            onMouseLeave={() => setFilmHovered(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.75rem 0',
              display: 'flex',
              justifyContent: 'center',
              opacity: filmHovered ? 1 : 0.85,
              transform: filmHovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.15s ease',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
            }}
          >
            <img src="/assets/just-play-the-video.png" alt="Just play the video" style={{ height: 22, width: 'auto' }} />
          </button>

          {/* Try again */}
          <button
            onClick={onTryAgain}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(240,235,224,0.22)',
              fontSize: '0.6rem',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'Joan', 'Georgia', serif",
              fontWeight: 700,
              padding: '0.5rem 0',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.22)')}
          >
            Try Again (Brave)
          </button>
        </div>
      )}
    </div>
  );
}
