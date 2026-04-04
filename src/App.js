import React, { useState, useRef, useCallback, useEffect } from 'react';
import Teleprompter from './components/Teleprompter';
import CritiqueDisplay from './components/CritiqueDisplay';
import FilmEmbed from './components/FilmEmbed';

// ─── Font shorthand ────────────────────────────────────────────────────────────
const JOAN = "'Joan', 'Georgia', serif";

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
  // phase: 'idle' | 'listening' | 'critique' | 'film'
  const [phase, setPhase]           = useState('idle');
  const [jokeType, setJokeType]     = useState(null);
  const [stolenJoke, setStolenJoke] = useState(null);
  const [stealIntro, setStealIntro] = useState('');
  const [critique, setCritique]     = useState('');
  const [micError, setMicError]     = useState('');

  const jokeTypeRef   = useRef(null);
  const streamRef     = useRef(null);
  const audioCtxRef   = useRef(null);
  const animFrameRef  = useRef(null);
  const maxTimeoutRef = useRef(null);
  const laughRef      = useRef(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current)  { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (maxTimeoutRef.current) { clearTimeout(maxTimeoutRef.current);        maxTimeoutRef.current = null; }
    if (streamRef.current)     { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current)   { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
  }, []);

  // Laugh starts playing, then we bridge into critique after ~1.2s
  // Audio continues under the new content — natural transition
  const playLaughAndBridge = useCallback((critiqueText) => {
    if (laughRef.current) {
      laughRef.current.currentTime = 0;
      const p = laughRef.current.play();
      if (p) p.catch(() => {});
    }
    // Bridge: transition while laugh is still playing
    setTimeout(() => {
      setCritique(critiqueText);
      setPhase('critique');
    }, 1200);
  }, []);

  const stopRecording = useCallback(() => {
    cleanup();
    const pool = jokeTypeRef.current === 'steal' ? STEAL_RESPONSES : TELL_RESPONSES;
    playLaughAndBridge(pick(pool));
  }, [cleanup, playLaughAndBridge]);

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
    <div className="relative w-full overflow-hidden bg-black" style={{ minHeight: '100dvh', fontFamily: JOAN }}>

      <audio ref={laughRef} src="/assets/laugh.wav" preload="auto" />

      {phase === 'film' ? (
        <FilmEmbed vimeoId={VIMEO_ID} onBack={handleReset} />
      ) : (
        <>
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/bg.png')" }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
          <div className="grain-overlay" />
          <div className="scanlines" />

          {/* UI layer */}
          <div className="relative z-10" style={{ minHeight: '100dvh' }}>

            {/* ── Header — flex row so elements can never overlap ── */}
            {/* Left / Center / Right compress against each other before intersecting */}
            <header style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: 'clamp(10px, 2vh, 32px) clamp(14px, 2.5vw, 40px)',
              gap: 'clamp(6px, 1.5vw, 20px)',
              zIndex: 10,
            }}>
              {/* Logo — left */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src="/assets/logo.png"
                  alt="3 Months of Killing"
                  style={{
                    height: 'clamp(44px, 12vh, 160px)',
                    width: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.7))',
                  }}
                />
                <p style={{
                  color: 'rgba(240,235,224,0.6)',
                  fontSize: 'clamp(0.45rem, 0.85vw, 1rem)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  marginTop: 'clamp(2px, 0.4vh, 8px)',
                  fontFamily: JOAN,
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                }}>
                  Written by Jon Ryan Sugimoto
                </p>
              </div>

              {/* TELL A JOKE — center, shrinks before it ever touches neighbours */}
              <div style={{
                flex: 1,
                textAlign: 'center',
                minWidth: 0,
                paddingTop: 'clamp(4px, 0.8vh, 14px)',
              }}>
                <h1 style={{
                  color: '#f0ebe0',
                  fontSize: 'clamp(1.2rem, 4.4vw, 7rem)',
                  fontFamily: JOAN,
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  margin: 0,
                  textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}>
                  TELL A JOKE
                </h1>

                {phase === 'listening' && jokeType === 'tell' && (
                  <p className="fade-up" style={{
                    color: 'rgba(240,235,224,0.78)',
                    fontSize: 'clamp(0.75rem, 1.7vw, 2rem)',
                    fontFamily: JOAN,
                    letterSpacing: '0.08em',
                    marginTop: 'clamp(3px, 0.4vh, 8px)',
                    textShadow: '0 1px 10px rgba(0,0,0,0.9)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}>
                    The audience is listening
                  </p>
                )}
              </div>

              {/* Just play the video — right */}
              <div style={{ flexShrink: 0, paddingTop: 'clamp(4px, 0.8vh, 14px)' }}>
                <BoxButton small onClick={() => setPhase('film')}>
                  Just play the video
                </BoxButton>
              </div>
            </header>

            {/* ── IDLE: Both buttons flanking the mic ── */}
            {phase === 'idle' && (
              <div style={{
                position: 'absolute',
                top: '57%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(48px, 13vw, 320px)',
              }}>
                <BoxButton onClick={handleTellJoke}>Say my own joke</BoxButton>
                <BoxButton onClick={handleStealJoke}>Steal a joke</BoxButton>
              </div>
            )}

            {/* ── TELL LISTENING: only "Say my own joke" stays, REC badge ── */}
            {phase === 'listening' && jokeType === 'tell' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '57%',
                  left: '50%',
                  transform: 'translate(calc(-50% - clamp(80px, 12vw, 160px)), -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <BoxButton disabled style={{ opacity: 0.55, cursor: 'default' }}>
                    Say my own joke
                  </BoxButton>
                  <RecBadge />
                </div>

                <DoneButton onClick={stopRecording} />
              </>
            )}

            {/* ── STEAL LISTENING: Teleprompter ── */}
            {phase === 'listening' && jokeType === 'steal' && stolenJoke && (
              <Teleprompter
                intro={stealIntro}
                joke={stolenJoke.text}
                comedian={stolenJoke.comedian}
                onStop={stopRecording}
              />
            )}

            {/* ── CRITIQUE — left of the mic ── */}
            {phase === 'critique' && (
              <div className="fade-up" style={{
                position: 'absolute',
                left: '3vw',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'clamp(260px, 40vw, 580px)',
                padding: 'clamp(1rem, 2vh, 2rem) clamp(1rem, 2vw, 2.5rem)',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
              }}>
                <CritiqueDisplay
                  text={critique}
                  jokeType={jokeType}
                  onWatchFilm={() => setPhase('film')}
                  onTryAgain={handleReset}
                />
              </div>
            )}

            {/* ── Error ── */}
            {micError && (
              <div style={{
                position: 'absolute', bottom: 28, left: '50%',
                transform: 'translateX(-50%)',
                border: '1px solid rgba(220,38,38,0.5)',
                background: 'rgba(0,0,0,0.8)',
                padding: '0.8rem 1.4rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                maxWidth: 440, backdropFilter: 'blur(4px)',
              }}>
                <p style={{ color: '#ef4444', fontSize: '0.9rem', fontFamily: JOAN, margin: 0 }}>{micError}</p>
                <button onClick={() => setMicError('')} style={{
                  background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)',
                  cursor: 'pointer', fontSize: '1rem', padding: 0, fontFamily: JOAN,
                }}>✕</button>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}

// ─── Shared UI components ─────────────────────────────────────────────────────

// Dark bordered box button — matches the Figma style
function BoxButton({ onClick, children, small, disabled, style = {} }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(20,15,10,0.82)' : 'rgba(8,6,4,0.70)',
        border: `1px solid ${hov ? 'rgba(240,228,200,0.65)' : 'rgba(240,228,200,0.38)'}`,
        color: '#f0ebe0',
        fontFamily: JOAN,
        fontSize: small ? 'clamp(0.6rem, 1.2vw, 1.6rem)' : 'clamp(0.85rem, 2.3vw, 3.2rem)',
        letterSpacing: small ? '0.06em' : '0.04em',
        fontWeight: 400,
        padding: small
          ? 'clamp(0.3rem, 0.6vh, 0.8rem) clamp(0.5rem, 1vw, 1.4rem)'
          : 'clamp(0.5rem, 1vh, 1.2rem) clamp(0.8rem, 2vw, 2.8rem)',
        cursor: disabled ? 'default' : 'pointer',
        backdropFilter: 'blur(6px)',
        transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
        transform: hov && !disabled ? 'scale(1.03)' : 'scale(1)',
        whiteSpace: 'nowrap',
        textShadow: '0 1px 6px rgba(0,0,0,0.6)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function RecBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="rec-dot" style={{
        width: 8, height: 8, borderRadius: '50%', background: '#dc2626', flexShrink: 0,
      }} />
      <span style={{
        color: '#dc2626', fontSize: '0.6rem', letterSpacing: '0.5em',
        fontWeight: 700, textTransform: 'uppercase', fontFamily: JOAN,
      }}>
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
        background: hov ? 'rgba(220,38,38,0.22)' : 'rgba(0,0,0,0.5)',
        color: '#ef4444',
        padding: '0.7rem 2.4rem',
        fontSize: 'clamp(0.8rem, 1.6vw, 2rem)',
        fontFamily: JOAN,
        letterSpacing: '0.15em',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.15s',
      }}
    >
      Done
    </button>
  );
}
