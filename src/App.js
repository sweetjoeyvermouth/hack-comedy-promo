import React, { useState, useRef, useCallback, useEffect } from 'react';
import JokeCard from './components/JokeCard';
import ListeningIndicator from './components/ListeningIndicator';
import CritiqueDisplay from './components/CritiqueDisplay';
import FilmEmbed from './components/FilmEmbed';

// ─── Critique Arrays ───────────────────────────────────────────────────────────

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

const STOLEN_JOKES = [
  "Why don't scientists trust atoms? Because they make up everything.",
  "I told my wife she should embrace her mistakes. She gave me a hug.",
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Did you hear about the mathematician afraid of negative numbers? He'll stop at nothing to avoid them.",
  "Why did the scarecrow win an award? He was outstanding in his field.",
  "I used to hate facial hair, but then it grew on me.",
  "I'm on a seafood diet. I see food and I eat it.",
  "Why don't eggs tell jokes? They'd crack each other up.",
  "I told my doctor I broke my arm in two places. He said stop going to those places.",
  "What do you call cheese that isn't yours? Nacho cheese.",
];

// Replace with your actual Vimeo video ID
const VIMEO_ID = '76979871';

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  // phase: 'idle' | 'steal-setup' | 'listening' | 'processing' | 'critique' | 'film'
  const [phase, setPhase]           = useState('idle');
  const [jokeType, setJokeType]     = useState(null);   // 'tell' | 'steal'
  const [stolenJoke, setStolenJoke] = useState('');
  const [critique, setCritique]     = useState('');
  const [micError, setMicError]     = useState('');

  // Refs keep closure-safe handles to live resources
  const jokeTypeRef     = useRef(null);
  const streamRef       = useRef(null);
  const audioCtxRef     = useRef(null);
  const animFrameRef    = useRef(null);
  const maxTimeoutRef   = useRef(null);

  // ─── Teardown helpers ────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (animFrameRef.current)  { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (maxTimeoutRef.current) { clearTimeout(maxTimeoutRef.current);        maxTimeoutRef.current = null; }
    if (streamRef.current)     { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current)   { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
  }, []);

  // ─── Stop recording & derive critique ────────────────────────
  const stopRecording = useCallback(() => {
    cleanup();
    setPhase('processing');
    setTimeout(() => {
      const pool = jokeTypeRef.current === 'steal' ? STEAL_RESPONSES : TELL_RESPONSES;
      setCritique(pool[Math.floor(Math.random() * pool.length)]);
      setPhase('critique');
    }, 900);
  }, [cleanup]);

  // ─── Start mic & silence detection ───────────────────────────
  const startListening = useCallback(async () => {
    setMicError('');
    setPhase('listening');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx   = window.AudioContext || window.webkitAudioContext;
      const audioCtx   = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const dataArray        = new Uint8Array(analyser.frequencyBinCount);
      const SILENCE_THRESH   = 12;
      const SILENCE_HOLD_MS  = 2500;
      const MAX_DURATION_MS  = 30000;
      let silenceStart       = null;
      let hasSpoken          = false;

      maxTimeoutRef.current = setTimeout(stopRecording, MAX_DURATION_MS);

      const tick = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (avg > SILENCE_THRESH) {
          hasSpoken    = true;
          silenceStart = null;
        } else if (hasSpoken) {
          if (!silenceStart) silenceStart = Date.now();
          else if (Date.now() - silenceStart >= SILENCE_HOLD_MS) {
            stopRecording();
            return;
          }
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
    setStolenJoke(STOLEN_JOKES[Math.floor(Math.random() * STOLEN_JOKES.length)]);
    setPhase('steal-setup');
  };

  const handleStartReading = () => startListening();

  const handleWatchFilm = () => setPhase('film');

  const handleReset = () => {
    cleanup();
    jokeTypeRef.current = null;
    setPhase('idle');
    setJokeType(null);
    setStolenJoke('');
    setCritique('');
    setMicError('');
  };

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-courier bg-club-bg">

      {/* ── Ambient layers ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/background.jpg')" }}
      />
      {/* Gradient: lets mic breathe on the left, darkens toward interactive panel on right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(8,8,8,0.40) 0%, rgba(8,8,8,0.72) 42%, rgba(8,8,8,0.94) 100%)',
        }}
      />
      <div className="grain-overlay" />
      <div className="scanlines" />

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {phase === 'film' ? (
          <FilmEmbed vimeoId={VIMEO_ID} onBack={handleReset} />
        ) : (
          <>
            {/* Header */}
            <header className="flex-shrink-0 pt-7 px-6 md:px-12 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-club-gold text-[0.6rem] tracking-[0.48em] uppercase font-bold mb-1 opacity-80">
                    A Film By —
                  </p>
                  <h1
                    className="text-club-text font-bold uppercase leading-none tracking-tight"
                    style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', letterSpacing: '-0.025em' }}
                  >
                    HACK
                  </h1>
                  <p className="text-club-gold text-[0.6rem] tracking-[0.28em] mt-1.5 opacity-40">
                    [ IT WASN'T YOUR MATERIAL ]
                  </p>
                </div>

                {/* Live indicator */}
                <div className="hidden md:flex flex-col items-end gap-1 pt-1">
                  <span className="text-club-text text-[0.55rem] tracking-[0.45em] uppercase opacity-20">
                    Now Showing
                  </span>
                  <span className="text-club-red text-sm rec-dot">●</span>
                </div>
              </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex flex-col md:flex-row">

              {/* Left – mic breathing room + listening rings on desktop */}
              <div className="hidden md:flex flex-1 items-center justify-center">
                {phase === 'listening' && (
                  <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
                    <div className="ring-pulse"   style={{ position: 'absolute', width: 220, height: 220 }} />
                    <div className="ring-pulse-2" style={{ position: 'absolute', width: 160, height: 160 }} />
                    <div className="ring-pulse-3" style={{ position: 'absolute', width: 100, height: 100 }} />
                    <div className="w-4 h-4 rounded-full bg-club-red rec-dot" />
                  </div>
                )}
              </div>

              {/* Right – interactive panel */}
              <div className="w-full md:w-96 flex flex-col justify-center px-6 md:pr-12 md:pl-6 py-8">

                {/* Error banner */}
                {micError && (
                  <div className="mb-6 border border-club-red border-opacity-40 bg-red-950 bg-opacity-30 p-4">
                    <p className="text-club-red-hot text-sm font-bold leading-relaxed">{micError}</p>
                    <button
                      onClick={() => setMicError('')}
                      className="text-club-red text-[0.6rem] tracking-widest uppercase font-bold mt-2 opacity-50 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer font-courier"
                    >
                      [dismiss]
                    </button>
                  </div>
                )}

                {/* ── IDLE ── */}
                {phase === 'idle' && (
                  <div className="fade-up">
                    <div className="mb-7">
                      <p className="text-club-text text-sm leading-relaxed opacity-55">
                        Step up to the mic.
                      </p>
                      <p className="text-club-gold text-sm leading-relaxed font-bold">
                        Show us what you've got.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <PrimaryButton onClick={handleTellJoke}>
                        TELL A JOKE
                      </PrimaryButton>

                      <Divider />

                      <GhostButton onClick={handleStealJoke}>
                        STEAL A JOKE
                      </GhostButton>

                      <p className="text-club-text text-[0.55rem] tracking-[0.35em] uppercase opacity-20 text-center mt-2">
                        Microphone Access Required
                      </p>
                    </div>

                    {/* Film-strip decoration */}
                    <div className="mt-8 film-strip">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className="film-tick"
                          style={{ background: i % 2 === 0 ? 'rgba(201,150,58,0.35)' : 'rgba(201,150,58,0.08)' }}
                        />
                      ))}
                    </div>
                    <p className="text-[0.5rem] tracking-[0.35em] uppercase text-center mt-2 opacity-25 text-club-gold">
                      — Comedy Film —
                    </p>
                  </div>
                )}

                {/* ── STEAL SETUP ── */}
                {phase === 'steal-setup' && (
                  <JokeCard
                    joke={stolenJoke}
                    onStart={handleStartReading}
                    onBack={handleReset}
                  />
                )}

                {/* ── LISTENING ── */}
                {phase === 'listening' && (
                  <ListeningIndicator jokeType={jokeType} onStop={stopRecording} />
                )}

                {/* ── PROCESSING ── */}
                {phase === 'processing' && (
                  <div className="text-center py-12 fade-up">
                    <div className="flex justify-center items-end gap-1 mb-4" style={{ height: 36 }}>
                      {[0, 1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="process-bar"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-club-text text-[0.6rem] tracking-[0.45em] uppercase opacity-40">
                      Deliberating...
                    </p>
                  </div>
                )}

                {/* ── CRITIQUE ── */}
                {phase === 'critique' && (
                  <CritiqueDisplay
                    text={critique}
                    jokeType={jokeType}
                    onWatchFilm={handleWatchFilm}
                    onTryAgain={handleReset}
                  />
                )}
              </div>
            </main>

            {/* Mobile listening rings */}
            {phase === 'listening' && (
              <div
                className="md:hidden absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ paddingBottom: '240px' }}
              >
                <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
                  <div className="ring-pulse"   style={{ position: 'absolute', width: 180, height: 180 }} />
                  <div className="ring-pulse-2" style={{ position: 'absolute', width: 120, height: 120 }} />
                  <div className="ring-pulse-3" style={{ position: 'absolute', width: 70,  height: 70 }} />
                  <div className="w-3 h-3 rounded-full bg-club-red rec-dot" />
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="flex-shrink-0 py-4 px-6 md:px-12 flex justify-between">
              <p className="text-club-text text-[0.5rem] tracking-[0.3em] uppercase opacity-10">
                © {new Date().getFullYear()} All Jokes Stolen
              </p>
              <p className="text-club-text text-[0.5rem] tracking-[0.3em] uppercase opacity-10">
                No Comedians Were Harmed
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function PrimaryButton({ onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        border: '2px solid #c9963a',
        background: hovered ? '#c9963a' : 'transparent',
        color: hovered ? '#080808' : '#c9963a',
        padding: '1rem 2rem',
        fontSize: '0.95rem',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.14s ease',
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        border: `1px solid ${hovered ? 'rgba(240,235,224,0.55)' : 'rgba(240,235,224,0.2)'}`,
        background: 'transparent',
        color: hovered ? '#f0ebe0' : 'rgba(240,235,224,0.42)',
        padding: '1rem 2rem',
        fontSize: '0.95rem',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.14s ease',
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: 'rgba(240,235,224,0.12)' }} />
      <span className="text-club-text text-[0.6rem] tracking-[0.45em] font-bold opacity-25">OR</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(240,235,224,0.12)' }} />
    </div>
  );
}
