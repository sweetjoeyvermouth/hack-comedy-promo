import React, { useState, useEffect } from 'react';

const JOAN = "'Joan', 'Georgia', serif";
const CHAR_DELAY_MS = 28;
const AUTO_ADVANCE_MS = 3500;

export default function CritiqueDisplay({ text, jokeType, onWatchFilm }) {
  const [displayed, setDisplayed] = useState('');
  const [complete, setComplete]   = useState(false);

  const accentColor = jokeType === 'steal' ? '#c9963a' : '#dc2626';

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
      <p style={{
        color: '#f0ebe0',
        fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
        lineHeight: 1.55,
        fontFamily: JOAN,
        margin: 0,
        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
        textAlign: 'center',
      }}>
        {displayed}
        {!complete && (
          <span className="tw-cursor" style={{ color: accentColor }}>|</span>
        )}
      </p>
    </div>
  );
}
