import React, { useState, useRef, useCallback, useEffect } from 'react';
import Teleprompter from './components/Teleprompter';
import CritiqueDisplay from './components/CritiqueDisplay';
import FilmEmbed from './components/FilmEmbed';

// ─── Arrays ────────────────────────────────────────────────────────────────────

const TELL_RESPONSES = [
  "I've heard funnier eulogies.",
  "Don't quit your day job.",
  "Even the crickets left.",
  "My grandmother's funnier. She's been dead six years.",
  "That was painful. And not in a good way.",
  "Is this your first time? It shows.",
  "I've seen better comedy at a DMV.",
  "You had one job.",
  "The silence after that was the funniest part.",
  "I've laughed harder at tax forms.",
  "They say timing is everything. You have nothing.",
  "Bold choice. Wrong choice, but bold.",
  "Somewhere a comedy class is missing its student.",
  "I think I felt a joke in there. I might be wrong.",
  "The mic doesn't make you funnier. Just louder.",
  "You'll get 'em next lifetime.",
  "Comedy died in there just now.",
  "I've seen open mics. That wasn't one.",
  "On behalf of everyone here: but why?",
  "Devastating. For us.",
];

const STEAL_RESPONSES = [
  "Incredible timing. Did you write that yourself?",
  "That sounded suspiciously professional...",
  "Have you done this before? Because it shows.",
  "Hold on... I've heard that somewhere.",
  "This is your ORIGINAL material?",
  "You should be selling this to someone.",
  "Suspiciously polished for an amateur.",
  "I'm going to need your writer's room contact.",
  "That's... oddly good. Oddly.",
  "Did you rehearse? For how long?",
  "You sure you haven't done this professionally?",
  "The confidence alone is suspicious.",
  "Someone's been workshopping this.",
  "I'm impressed. Suspiciously impressed.",
  "That felt written. Very written.",
  "Are you stealing from a future version of yourself?",
  "Whoever wrote that is a genius. Was it you? Really?",
  "The structure on that was... too good.",
  "I'm not saying you stole it. I'm just saying... I'm saying it.",
  "A natural talent, or a very good thief.",
];

const STEAL_INTROS = [
  "You're lucky the opener left his cards behind.",
  "Don't worry. He'll never know.",
  "Consider it a loan. An indefinite one.",
  "The original writer would be horrified. Go ahead.",
  "He's not using it right now.",
  "Possession is nine-tenths of comedy.",
  "He left these here. Finders keepers.",
  "It's not stealing if you say it with confidence.",
  "What they don't know won't hurt them.",
  "The statute of limitations on joke theft is five minutes. You're fine.",
  "Think of it as a tribute. An uncredited one.",
  "Borrowed material. Return date: never.",
];

const STOLEN_JOKES = [
  { text: "An escalator can never break: it can only become stairs.", comedian: "Mitch Hedberg" },
  { text: "I'm against picketing, but I don't know how to show it.", comedian: "Mitch Hedberg" },
  { text: "I haven't slept for ten days, because that would be too long.", comedian: "Mitch Hedberg" },
  { text: "I used to do drugs. I still do, but I used to, too.", comedian: "Mitch Hedberg" },
  { text: "I'm sick of following my dreams. I'm just going to ask where they're going and hook up with them later.", comedian: "Mitch Hedberg" },
  { text: "There is no such thing as fun for the whole family.", comedian: "Jerry Seinfeld" },
  { text: "Men want the same thing from their underwear that they want from women: a little bit of support, and a little bit of freedom.", comedian: "Jerry Seinfeld" },
  { text: "If at first you don't succeed, skydiving is not for you.", comedian: "Steven Wright" },
  { text: "I put instant coffee in a microwave oven and almost went back in time.", comedian: "Steven Wright" },
  { text: "I have an existential map. It has 'You are here' written all over it.", comedian: "Steven Wright" },
  { text: "My wife and I were happy for twenty years. Then we met.", comedian: "Rodney Dangerfield" },
  { text: "I could tell my parents hated me. My bath toys were a toaster and a radio.", comedian: "Rodney Dangerfield" },
];

const VIMEO_ID = '76979871';
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  // phase: 'idle' | 'listening' | 'laughing' | 'critique' | 'film'
  const [phase, setPhase]           = useState('idle');
  const [jokeType, setJokeType]     = useState(null);   // 'tell' | 'steal'
  const [stolenJoke, setStolenJoke] = useState(null);   // { text, comedian }
  const [stealIntro, setStealIntro] = useState('');
  const [critique, setCritique]     = useState('');
  const [micError, setMicError]     = useState('');

  const jokeTypeRef   = useRef(null);
  const streamRef     = useRef(null);
  const audioCtxRef   = useRef(null);
  const animFrameRef  = useRef(null);
  const maxTimeoutRef = useRef(null);
  const laughRef      = useRef(null);

  // ─── Audio / resource cleanup ─────────────────────────────────
  const cleanup = useCallback(() => {
    if (animFrameRef.current)  { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (maxTimeoutRef.current) { clearTimeout(maxTimeoutRef.current);        maxTimeoutRef.current = null; }
    if (streamRef.current)     { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current)   { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
  }, []);

  // ─── Laugh → critique transition ─────────────────────────────
  const transitionAfterLaugh = useCallback((pool) => {
    setPhase('laughing');
    const critique = pick(pool);

    if (laughRef.current) {
      laughRef.current.currentTime = 0;
      const p = laughRef.current.play();
      if (p) p.catch(() => {});
      laughRef.current.onended = () => {
        setCritique(critique);
        setPhase('critique');
      };
      // Safety fallback if audio stalls
      setTimeout(() => {
        if (laughRef.current && !laughRef.current.paused) return;
        setCritique(critique);
        setPhase('critique');
      }, 4000);
    } else {
      setCritique(critique);
      setPhase('critique');
    }
  }, []);

  // ─── Stop recording ───────────────────────────────────────────
  const stopRecording = useCallback(() => {
    cleanup();
    const pool = jokeTypeRef.current === 'steal' ? STEAL_RESPONSES : TELL_RESPONSES;
    transitionAfterLaugh(pool);
  }, [cleanup, transitionAfterLaugh]);

  // ─── Start mic + silence detection ───────────────────────────
  const startListening = useCallback(async () => {
    setMicError('');
    setPhase('listening');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx      = new AudioCtx();
      audioCtxRef.current = ctx;

      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let silenceStart = null;
      let hasSpoken    = false;

      maxTimeoutRef.current = setTimeout(stopRecording, 30000);

      const tick = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 12) {
          hasSpoken = true; silenceStart = null;
        } else if (hasSpoken) {
          if (!silenceStart) silenceStart = Date.now();
          else if (Date.now() - silenceStart >= 2500) { stopRecording(); return; }
        }
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      cleanup();
      setPhase('idle');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError("Mic access denied. Even the mic doesn't want to hear it.");
      } else if (err.name === 'NotFoundError') {
        setMicError("No microphone detected. You'll have to suffer in silence.");
      } else {
        setMicError("Couldn't reach your mic. Technical difficulties — much like your comedy.");
      }
    }
  }, [cleanup, stopRecording]);

  // ─── User actions ─────────────────────────────────────────────
  const handleTellJoke = () => {
    jokeTypeRef.current = 'tell';
    setJokeType('tell');
    startListening();
  };

  const handleStealJoke = () => {
    jokeTypeRef.current = 'steal';
    setJokeType('steal');
    setStolenJoke(pick(STOLEN_JOKES));
    setStealIntro(pick(STEAL_INTROS));
    startListening();
  };

  const handleReset = () => {
    cleanup();
    if (laughRef.current) { laughRef.current.pause(); laughRef.current.currentTime = 0; }
    jokeTypeRef.current = null;
    setPhase('idle');
    setJokeType(null);
    setStolenJoke(null);
    setStealIntro('');
    setCritique('');
    setMicError('');
  };

  useEffect(() => () => cleanup(), [cleanup]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ minHeight: '100dvh', fontFamily: "'Courier Prime','Courier New',Courier,monospace" }}
    >
      {/* Laugh track audio */}
      <audio ref={laughRef} src="/assets/laugh.wav" preload="auto" />

      {phase === 'film' ? (
        <FilmEmbed vimeoId={VIMEO_ID} onBack={handleReset} />
      ) : (
        <>
          {/* ── Background ── */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/bg.png')" }}
          />
          {/* Overlay — dark enough to read, light enough to see the room */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.38)' }} />
          <div className="grain-overlay" />
          <div className="scanlines" />

          {/* ── UI Layer ── */}
          <div className="relative z-10" style={{ minHeight: '100dvh' }}>

            {/* Logo — top left */}
            <img
              src="/assets/logo.png"
              alt="3 Months of Killing"
              style={{
                position: 'absolute', top: 20, left: 24,
                height: 52, width: 'auto',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
              }}
            />

            {/* Just play the video — top right */}
            <button
              onClick={() => setPhase('film')}
              style={{
                position: 'absolute', top: 20, right: 24,
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                opacity: 0.7, transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
            >
              <img src="/assets/just-play-the-video.png" alt="Just play the video" style={{ height: 18, width: 'auto' }} />
            </button>

            {/* TELL A JOKE header — top center */}
            <div
              style={{
                position: 'absolute', top: 28, left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <img src="/assets/tell-a-joke.png" alt="Tell a Joke" style={{ height: 22, width: 'auto' }} />

              {/* "The audience is listening" — tell recording */}
              {phase === 'listening' && jokeType === 'tell' && (
                <p
                  className="fade-up"
                  style={{
                    color: '#f0ebe0',
                    fontSize: '0.72rem',
                    letterSpacing: '0.2em',
                    marginTop: '0.35rem',
                    opacity: 0.75,
                  }}
                >
                  The audience is listening
                </p>
              )}
            </div>

            {/* ── IDLE: Both buttons flanking the mic ── */}
            {phase === 'idle' && (
              <div
                style={{
                  position: 'absolute',
                  top: '62%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(120px, 20vw, 240px)',
                }}
              >
                <ImgButton
                  src="/assets/say-my-own-joke.png"
                  alt="Say my own joke"
                  onClick={handleTellJoke}
                  height={28}
                />
                <ImgButton
                  src="/assets/steal-a-joke.png"
                  alt="Steal a joke"
                  onClick={handleStealJoke}
                  height={28}
                />
              </div>
            )}

            {/* ── TELL LISTENING: only "Say my own joke" + REC + Done ── */}
            {phase === 'listening' && jokeType === 'tell' && (
              <>
                {/* Left button stays, right disappears */}
                <div
                  style={{
                    position: 'absolute',
                    top: '62%', left: '50%',
                    transform: 'translate(calc(-50% - clamp(60px, 10vw, 120px)), -50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <img src="/assets/say-my-own-joke.png" alt="Say my own joke" style={{ height: 28, width: 'auto', opacity: 0.65 }} />
                  <RecBadge />
                </div>

                {/* Waveform bars over center mic */}
                <div
                  style={{
                    position: 'absolute', top: '62%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        background: 'rgba(220,38,38,0.7)',
                        animationDelay: `${(i * 0.08) % 0.6}s`,
                        animationDuration: `${0.38 + (i % 4) * 0.09}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Done */}
                <DoneButton onClick={stopRecording} />
              </>
            )}

            {/* ── STEAL LISTENING: Teleprompter overlay ── */}
            {phase === 'listening' && jokeType === 'steal' && stolenJoke && (
              <Teleprompter
                intro={stealIntro}
                joke={stolenJoke.text}
                comedian={stolenJoke.comedian}
                onStop={stopRecording}
              />
            )}

            {/* ── LAUGHING: brief transitional state ── */}
            {phase === 'laughing' && (
              <div
                className="fade-up"
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 40 }}>
                  {[0,1,2,3,4,5,6].map(i => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        background: '#c9963a',
                        animationDelay: `${i * 0.07}s`,
                        animationDuration: `${0.38 + (i % 4) * 0.09}s`,
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── CRITIQUE ── */}
            {phase === 'critique' && (
              <div
                className="fade-up"
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '2rem',
                }}
              >
                <div style={{ width: '100%', maxWidth: 520 }}>
                  <CritiqueDisplay
                    text={critique}
                    jokeType={jokeType}
                    onWatchFilm={() => setPhase('film')}
                    onTryAgain={handleReset}
                  />
                </div>
              </div>
            )}

            {/* ── Error banner ── */}
            {micError && (
              <div
                style={{
                  position: 'absolute', bottom: 24, left: '50%',
                  transform: 'translateX(-50%)',
                  border: '1px solid rgba(220,38,38,0.5)',
                  background: 'rgba(0,0,0,0.75)',
                  padding: '0.75rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  maxWidth: 420,
                }}
              >
                <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{micError}</p>
                <button
                  onClick={() => setMicError('')}
                  style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, fontFamily: 'inherit' }}
                >
                  ✕
                </button>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}

// ─── Small shared components ──────────────────────────────────────────────────

function ImgButton({ src, alt, onClick, height }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '10px 16px',
        opacity: hov ? 1 : 0.82,
        transform: hov ? 'scale(1.06)' : 'scale(1)',
        transition: 'all 0.15s ease',
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
      }}
    >
      <img src={src} alt={alt} style={{ height, width: 'auto', display: 'block' }} />
    </button>
  );
}

function RecBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div
        className="rec-dot"
        style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }}
      />
      <span style={{ color: '#dc2626', fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, textTransform: 'uppercase' }}>
        REC
      </span>
    </div>
  );
}

function DoneButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', bottom: '8%', left: '50%',
        transform: 'translateX(-50%)',
        border: '1px solid rgba(220,38,38,0.5)',
        background: hov ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.4)',
        color: '#ef4444',
        padding: '0.65rem 2rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: "'Courier Prime','Courier New',Courier,monospace",
        transition: 'background 0.15s',
        backdropFilter: 'blur(4px)',
      }}
    >
      Done
    </button>
  );
}
