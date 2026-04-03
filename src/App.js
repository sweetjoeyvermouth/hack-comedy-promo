import React, { useState, useRef, useCallback, useEffect } from 'react';
import JokeCard from './components/JokeCard';
import ListeningIndicator from './components/ListeningIndicator';
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
  "Borrowed material. Return date: never.",
  "He left these here. Finders keepers.",
  "It's not stealing if you say it with confidence.",
  "What they don't know won't hurt them.",
  "The statute of limitations on joke theft is five minutes. You're fine.",
  "Think of it as a tribute. An uncredited one.",
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

const VIMEO_ID = '76979871';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase]         = useState('idle');
  const [jokeType, setJokeType]   = useState(null);
  const [stolenJoke, setStolenJoke] = useState('');
  const [stealIntro, setStealIntro] = useState('');
  const [critique, setCritique]   = useState('');
  const [micError, setMicError]   = useState('');

  const jokeTypeRef   = useRef(null);
  const streamRef     = useRef(null);
  const audioCtxRef   = useRef(null);
  const animFrameRef  = useRef(null);
  const maxTimeoutRef = useRef(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current)  { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (maxTimeoutRef.current) { clearTimeout(maxTimeoutRef.current);        maxTimeoutRef.current = null; }
    if (streamRef.current)     { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current)   { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
  }, []);

  const stopRecording = useCallback(() => {
    cleanup();
    setPhase('processing');
    setTimeout(() => {
      const pool = jokeTypeRef.current === 'steal' ? STEAL_RESPONSES : TELL_RESPONSES;
      setCritique(pick(pool));
      setPhase('critique');
    }, 900);
  }, [cleanup]);

  const startListening = useCallback(async () => {
    setMicError('');
    setPhase('listening');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceStart = null;
      let hasSpoken    = false;

      maxTimeoutRef.current = setTimeout(stopRecording, 30000);

      const tick = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
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
      setPhase(jokeTypeRef.current === 'steal' ? 'steal-setup' : 'idle');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError("Mic access denied. Even the mic doesn't want to hear it.");
      } else if (err.name === 'NotFoundError') {
        setMicError("No microphone detected. You'll have to suffer in silence.");
      } else {
        setMicError("Couldn't reach your mic. Technical difficulties — much like your comedy.");
      }
    }
  }, [cleanup, stopRecording]);

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
    setPhase('steal-setup');
  };

  const handleReset = () => {
    cleanup();
    jokeTypeRef.current = null;
    setPhase('idle');
    setJokeType(null);
    setStolenJoke('');
    setStealIntro('');
    setCritique('');
    setMicError('');
  };

  useEffect(() => () => cleanup(), [cleanup]);

  // ─── Layout helpers ───────────────────────────────────────────

  const showingSteal = phase === 'steal-setup' || (phase === 'listening' && jokeType === 'steal');
  const showingTellListen = phase === 'listening' && jokeType === 'tell';

  const Rings = () => (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      <div className="ring-pulse"   style={{ position: 'absolute', width: 240, height: 240 }} />
      <div className="ring-pulse-2" style={{ position: 'absolute', width: 170, height: 170 }} />
      <div className="ring-pulse-3" style={{ position: 'absolute', width: 105, height: 105 }} />
      <div className="rec-dot" style={{ width: 16, height: 16, borderRadius: '50%', background: '#dc2626' }} />
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-courier bg-club-bg">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/background.jpg')" }}
      />
      {/* Vignette — lighter in center where mic is, darker at edges where buttons are */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 52%, rgba(8,8,8,0.28) 0%, rgba(8,8,8,0.75) 60%, rgba(8,8,8,0.93) 100%)',
        }}
      />
      <div className="grain-overlay" />
      <div className="scanlines" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {phase === 'film' ? (
          <FilmEmbed vimeoId={VIMEO_ID} onBack={handleReset} />
        ) : (
          <>
            {/* Header */}
            <header className="flex-shrink-0 pt-7 px-8 pb-3">
              <div className="flex items-start justify-between">
                <h1
                  className="text-club-text font-bold uppercase leading-none"
                  style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', letterSpacing: '-0.025em' }}
                >
                  HACK
                </h1>
                <span className="text-club-red text-sm rec-dot pt-2">●</span>
              </div>
            </header>

            {/* Error banner */}
            {micError && (
              <div className="mx-8 mb-2 border border-club-red border-opacity-40 bg-red-950 bg-opacity-30 p-3 flex items-start justify-between gap-4">
                <p className="text-club-red-hot text-sm font-bold">{micError}</p>
                <button
                  onClick={() => setMicError('')}
                  className="text-club-red text-[0.6rem] tracking-widest uppercase font-bold opacity-50 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer font-courier flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ── Three-column main ── */}
            <main className="flex-1 flex flex-col md:flex-row">

              {/* LEFT — Tell a Joke */}
              <div className="flex-1 flex" style={{ minHeight: 260 }}>
                {phase === 'idle' && (
                  <PanelButton onClick={handleTellJoke} variant="gold">
                    TELL A JOKE
                  </PanelButton>
                )}
                {showingTellListen && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <ListeningIndicator onStop={stopRecording} />
                  </div>
                )}
              </div>

              {/* CENTER — mic breathing room, rings, critique, processing */}
              <div
                className="hidden md:flex flex-col items-center justify-center"
                style={{ flex: '0 0 38%' }}
              >
                {phase === 'listening' && <Rings />}
                {phase === 'processing' && (
                  <div className="text-center fade-up">
                    <div className="flex justify-center items-end gap-1 mb-3" style={{ height: 36 }}>
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="process-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                {phase === 'critique' && (
                  <div className="w-full px-8">
                    <CritiqueDisplay
                      text={critique}
                      jokeType={jokeType}
                      onWatchFilm={() => setPhase('film')}
                      onTryAgain={handleReset}
                    />
                  </div>
                )}
              </div>

              {/* Mobile center content */}
              <div className="md:hidden flex flex-col items-center justify-center py-6">
                {phase === 'listening' && <Rings />}
                {phase === 'processing' && (
                  <div className="flex justify-center items-end gap-1" style={{ height: 36 }}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="process-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
                {phase === 'critique' && (
                  <div className="w-full px-8">
                    <CritiqueDisplay
                      text={critique}
                      jokeType={jokeType}
                      onWatchFilm={() => setPhase('film')}
                      onTryAgain={handleReset}
                    />
                  </div>
                )}
              </div>

              {/* RIGHT — Steal a Joke */}
              <div className="flex-1 flex" style={{ minHeight: 260 }}>
                {phase === 'idle' && (
                  <PanelButton onClick={handleStealJoke} variant="ghost">
                    STEAL A JOKE
                  </PanelButton>
                )}
                {showingSteal && (
                  <div className="flex-1 flex items-center justify-center p-6 md:p-8">
                    <JokeCard
                      intro={stealIntro}
                      joke={stolenJoke}
                      isRecording={phase === 'listening'}
                      onStart={startListening}
                      onStop={stopRecording}
                    />
                  </div>
                )}
              </div>

            </main>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PanelButton ──────────────────────────────────────────────────────────────

function PanelButton({ onClick, variant, children }) {
  const [hovered, setHovered] = useState(false);
  const isGold = variant === 'gold';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        border: 'none',
        borderTop: isGold
          ? `2px solid ${hovered ? '#f5c842' : 'rgba(201,150,58,0.6)'}`
          : `2px solid ${hovered ? 'rgba(240,235,224,0.5)' : 'rgba(240,235,224,0.18)'}`,
        borderBottom: isGold
          ? `2px solid ${hovered ? '#f5c842' : 'rgba(201,150,58,0.6)'}`
          : `2px solid ${hovered ? 'rgba(240,235,224,0.5)' : 'rgba(240,235,224,0.18)'}`,
        background: hovered
          ? isGold ? 'rgba(201,150,58,0.12)' : 'rgba(240,235,224,0.06)'
          : 'transparent',
        color: isGold
          ? (hovered ? '#f5c842' : '#c9963a')
          : (hovered ? '#f0ebe0' : 'rgba(240,235,224,0.38)'),
        fontSize: 'clamp(1.1rem, 2.2vw, 1.65rem)',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        transition: 'all 0.18s ease',
        padding: '2rem',
      }}
    >
      {children}
    </button>
  );
}
