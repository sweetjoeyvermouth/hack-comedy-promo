import React from 'react';

const JOAN = "'Joan', 'Georgia', serif";

export default function FilmEmbed({ vimeoId, onBack }) {
  return (
    <div
      className="fade-up"
      style={{
        minHeight: '100dvh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 2rem 2.5rem',
      }}
    >
      {/* Logo + credit — centered at top */}
      <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
        <img
          src="/assets/logo.png"
          alt="3 Months of Killing"
          style={{
            height: 'clamp(72px, 10vw, 110px)',
            width: 'auto',
            display: 'block',
            margin: '0 auto',
            filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.7))',
          }}
        />
        <p style={{
          color: 'rgba(240,235,224,0.55)',
          fontSize: 'clamp(0.55rem, 1vw, 0.78rem)',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginTop: '0.5rem',
          fontFamily: JOAN,
        }}>
          Written by Jon Ryan Sugimoto
        </p>
      </div>

      {/* Video — takes up most of the remaining space */}
      <div style={{
        width: '100%',
        maxWidth: 1100,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          background: '#000',
          flex: 1,
        }}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=c9963a&title=0&byline=0&portrait=0`}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              border: 'none',
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="3 Months of Killing"
          />
        </div>
      </div>

      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          marginTop: '1.4rem',
          background: 'none',
          border: 'none',
          color: 'rgba(240,235,224,0.22)',
          fontSize: 'clamp(0.7rem, 1.1vw, 0.9rem)',
          letterSpacing: '0.25em',
          fontFamily: JOAN,
          cursor: 'pointer',
          transition: 'color 0.15s',
          padding: '0.4rem 0',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.55)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.22)')}
      >
        ← Try again
      </button>
    </div>
  );
}
