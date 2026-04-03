import React, { useState } from 'react';

export default function FilmEmbed({ vimeoId, onBack }) {
  const [backHovered, setBackHovered] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 fade-up"
      style={{ background: '#080808' }}
    >
      <div className="w-full" style={{ maxWidth: 900 }}>

        {/* Title block */}
        <div className="text-center mb-8">
          <p
            className="font-bold uppercase"
            style={{
              color: '#c9963a',
              fontSize: '0.58rem',
              letterSpacing: '0.5em',
              opacity: 0.75,
              marginBottom: '0.5rem',
              fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
            }}
          >
            Now Showing
          </p>
          <h2
            className="font-bold uppercase"
            style={{
              color: '#f0ebe0',
              fontSize: 'clamp(2.2rem, 7vw, 4rem)',
              letterSpacing: '-0.025em',
              lineHeight: 0.95,
              fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
            }}
          >
            HACK
          </h2>
          <p
            className="font-bold"
            style={{
              color: 'rgba(201,150,58,0.38)',
              fontSize: '0.6rem',
              letterSpacing: '0.28em',
              marginTop: '0.6rem',
              fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
            }}
          >
            [ IT WASN'T YOUR MATERIAL ]
          </p>
        </div>

        {/* Responsive Vimeo embed */}
        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9
            height: 0,
            overflow: 'hidden',
            border: '1px solid rgba(201,150,58,0.2)',
            background: '#000',
          }}
        >
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=c9963a&title=0&byline=0&portrait=0`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="HACK — Comedy Film"
          />
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={onBack}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
            style={{
              background: 'none',
              border: 'none',
              color: backHovered ? 'rgba(240,235,224,0.6)' : 'rgba(240,235,224,0.22)',
              fontSize: '0.6rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
              fontWeight: 700,
              transition: 'color 0.15s',
            }}
          >
            ← Try Your Luck Again
          </button>
        </div>
      </div>
    </div>
  );
}
