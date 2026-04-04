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
  // Mitch Hedberg
  { text: "An escalator can never break: it can only become stairs.", comedian: "Mitch Hedberg" },
  { text: "I'm against picketing, but I don't know how to show it.", comedian: "Mitch Hedberg" },
  { text: "I haven't slept for ten days, because that would be too long.", comedian: "Mitch Hedberg" },
  { text: "I used to do drugs. I still do, but I used to, too.", comedian: "Mitch Hedberg" },
  { text: "I'm sick of following my dreams. I'm just going to ask where they're going and hook up with them later.", comedian: "Mitch Hedberg" },
  { text: "I don't have a girlfriend. But I do know a woman who'd be mad at me for saying that.", comedian: "Mitch Hedberg" },
  { text: "I like rice. Rice is great if you're hungry and want 2,000 of something.", comedian: "Mitch Hedberg" },
  { text: "My fake plants died because I did not pretend to water them.", comedian: "Mitch Hedberg" },
  { text: "A severed foot is the ultimate stocking stuffer.", comedian: "Mitch Hedberg" },
  { text: "I went to a restaurant that serves 'breakfast at any time.' So I ordered French toast during the Renaissance.", comedian: "Mitch Hedberg" },
  { text: "I don't own a cell phone or a pager. I just hang around everyone I know, all the time.", comedian: "Mitch Hedberg" },
  { text: "I bought a doughnut and they gave me a receipt for the doughnut. I don't need a receipt for the doughnut. I'll just give you money and you give me the doughnut, end of transaction.", comedian: "Mitch Hedberg" },
  { text: "Wearing a turtleneck is like being strangled by a really weak guy. All day.", comedian: "Mitch Hedberg" },
  { text: "I remixed a remix, it was back to normal.", comedian: "Mitch Hedberg" },
  { text: "I'm a heroin addict. I need to do heroin before I get out of bed in the morning... Just kidding.", comedian: "Mitch Hedberg" },
  // Jerry Seinfeld
  { text: "There is no such thing as fun for the whole family.", comedian: "Jerry Seinfeld" },
  { text: "Men want the same thing from their underwear that they want from women: a little bit of support, and a little bit of freedom.", comedian: "Jerry Seinfeld" },
  { text: "According to most studies, people's number one fear is public speaking. Number two is death. This means to the average person, if you go to a funeral, you're better off in the casket than doing the eulogy.", comedian: "Jerry Seinfeld" },
  { text: "I was the best man at a wedding once. If I'm the best man, why is she marrying him?", comedian: "Jerry Seinfeld" },
  { text: "Dogs are the leaders of the planet. If you see two life forms, one of them's making a poop, the other one's carrying it for him, who would you assume is in charge?", comedian: "Jerry Seinfeld" },
  { text: "It's amazing that the amount of news that happens in the world every day always just exactly fits the newspaper.", comedian: "Jerry Seinfeld" },
  { text: "The big advantage of a book is it's very easy to rewind. Close it and you're right back at the beginning.", comedian: "Jerry Seinfeld" },
  // Steven Wright
  { text: "If at first you don't succeed, skydiving is not for you.", comedian: "Steven Wright" },
  { text: "I put instant coffee in a microwave oven and almost went back in time.", comedian: "Steven Wright" },
  { text: "I have an existential map. It has 'You are here' written all over it.", comedian: "Steven Wright" },
  { text: "Yesterday I told a chicken to cross the road. It said, 'What for?'", comedian: "Steven Wright" },
  { text: "I got a new shadow. I had to get rid of the other one — it wasn't doing what I was doing.", comedian: "Steven Wright" },
  { text: "Last night I stayed up late playing poker with Tarot cards. I got a full house and four people died.", comedian: "Steven Wright" },
  { text: "I couldn't fix your brakes, so I made your horn louder.", comedian: "Steven Wright" },
  { text: "I xeroxed a mirror. Now I have an extra Xerox machine.", comedian: "Steven Wright" },
  { text: "I used to work in a fire hydrant factory. You couldn't park anywhere near the place.", comedian: "Steven Wright" },
  { text: "I went to a general store. They wouldn't let me buy anything specific.", comedian: "Steven Wright" },
  { text: "Everywhere is within walking distance if you have the time.", comedian: "Steven Wright" },
  { text: "I was reading the dictionary. I thought it was a poem about everything.", comedian: "Steven Wright" },
  // Rodney Dangerfield
  { text: "My wife and I were happy for twenty years. Then we met.", comedian: "Rodney Dangerfield" },
  { text: "I could tell my parents hated me. My bath toys were a toaster and a radio.", comedian: "Rodney Dangerfield" },
  { text: "I told my psychiatrist that everyone hates me. He said I was being ridiculous — everyone hasn't met me yet.", comedian: "Rodney Dangerfield" },
  { text: "I drink too much. The last time I gave a urine sample it had an olive in it.", comedian: "Rodney Dangerfield" },
  { text: "My wife has to be the worst cook. In my house, we pray after we eat.", comedian: "Rodney Dangerfield" },
  { text: "Last week I told my psychiatrist, 'I keep thinking about suicide.' He told me from now on I have to pay in advance.", comedian: "Rodney Dangerfield" },
  { text: "I get no respect. The way my luck is running, if I was a politician I would be honest.", comedian: "Rodney Dangerfield" },
  // Norm Macdonald
  { text: "I asked my doctor how long I had to live. He said, '10.' I said, '10 what?' He said, '9...'", comedian: "Norm Macdonald" },
  { text: "I've been reading a lot about sociopaths lately. Apparently there are 29 million of them in the United States. When I discovered this, I was delighted.", comedian: "Norm Macdonald" },
  { text: "You know what they say: you can lead a horse to water, but you can't make him not be a horse.", comedian: "Norm Macdonald" },
  { text: "A lot of people think moths are ugly but I don't. I think they're beautiful. And I think they're misunderstood.", comedian: "Norm Macdonald" },
  // George Carlin
  { text: "Some people see the glass half full. Others see it half empty. I see a glass that's twice as big as it needs to be.", comedian: "George Carlin" },
  { text: "The reason I talk to myself is because I'm the only one whose answers I accept.", comedian: "George Carlin" },
  { text: "I have as much authority as the Pope, I just don't have as many people who believe it.", comedian: "George Carlin" },
  { text: "Think of how stupid the average person is, and realize half of them are stupider than that.", comedian: "George Carlin" },
  { text: "If you try to fail, and succeed, which have you done?", comedian: "George Carlin" },
  // Henny Youngman
  { text: "Take my wife... please.", comedian: "Henny Youngman" },
  { text: "I told the doctor I broke my leg in two places. He told me to quit going to those places.", comedian: "Henny Youngman" },
  { text: "I've got all the money I'll ever need, if I die by four o'clock.", comedian: "Henny Youngman" },
  // Demetri Martin
  { text: "A drunk driver is very dangerous. So is a drunk backseat driver if he's persuasive.", comedian: "Demetri Martin" },
  { text: "I asked my doctor, 'Will I be able to play violin after the surgery?' He said yes. I said great, because I couldn't before.", comedian: "Demetri Martin" },
  { text: "I wrapped my Christmas presents early this year, but I used the wrong paper. It said 'Happy Birthday' on it. I didn't want to waste it so I just wrote 'Jesus' on it.", comedian: "Demetri Martin" },
  { text: "I was at a flower shop. The sign said 'Say it with flowers.' I brought one rose and said, 'I'm a man of few words.'", comedian: "Demetri Martin" },
  // Mitch Hedberg (more)
  { text: "I would imagine if you could understand Morse code, a tap dancer would drive you crazy.", comedian: "Mitch Hedberg" },
  { text: "I played golf. I did not get a hole in one, but I did hit a guy, and that's way more satisfying.", comedian: "Mitch Hedberg" },
  { text: "I saw a human pyramid once. It was very unnecessary.", comedian: "Mitch Hedberg" },
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
  const [winW, setWinW]             = useState(() => window.innerWidth);

  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const isMobile = winW < 640;

  const jokeTypeRef     = useRef(null);
  const streamRef       = useRef(null);
  const audioCtxRef     = useRef(null);
  const animFrameRef    = useRef(null);
  const maxTimeoutRef   = useRef(null);
  const laughRef        = useRef(null);
  const crowdRef        = useRef(null);
  const crowdStarted    = useRef(false);
  const crowdFadeRef    = useRef(null);

  const startCrowd = useCallback(() => {
    if (crowdStarted.current || !crowdRef.current) return;
    crowdStarted.current = true;
    const audio = crowdRef.current;
    audio.volume = 0;
    const p = audio.play();
    if (p) {
      p.catch(() => { crowdStarted.current = false; return; });
      // Fade in to target volume over ~3s
      const target = 0.45;
      const step = target / 60; // 60 steps × 50ms = 3s
      const fade = setInterval(() => {
        if (audio.volume + step < target) {
          audio.volume = Math.min(target, audio.volume + step);
        } else {
          audio.volume = target;
          clearInterval(fade);
        }
      }, 50);
    } else {
      crowdStarted.current = false;
    }
  }, []);

  // Start on first pointerdown (covers mouse + touch, trusted by browsers for audio)
  useEffect(() => {
    const onGesture = () => {
      startCrowd();
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
    document.addEventListener('pointerdown', onGesture);
    document.addEventListener('keydown', onGesture);
    return () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
  }, [startCrowd]);

  // Fade crowd out over ~2.5s then pause
  const fadeCrowd = useCallback(() => {
    if (!crowdRef.current) return;
    if (crowdFadeRef.current) clearInterval(crowdFadeRef.current);
    const audio = crowdRef.current;
    crowdFadeRef.current = setInterval(() => {
      if (audio.volume > 0.008) {
        audio.volume = Math.max(0, audio.volume - 0.008);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(crowdFadeRef.current);
      }
    }, 50);
  }, []);

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

  // Fade crowd out when film starts
  useEffect(() => {
    if (phase === 'film') fadeCrowd();
  }, [phase, fadeCrowd]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ minHeight: '100dvh', fontFamily: JOAN }}>

      <audio ref={laughRef} src="/assets/laugh.wav" preload="auto" />
      <audio ref={crowdRef} src="/assets/crowd.wav" preload="auto" loop />

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

            {/* ── Header: logo left, button right — no title here ── */}
            <header style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: isMobile
                ? 'clamp(8px, 1.5vh, 20px) clamp(12px, 3vw, 24px)'
                : 'clamp(10px, 2vh, 32px) clamp(14px, 2.5vw, 40px)',
            }}>
              {/* Logo */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src="/assets/logo.png"
                  alt="3 Months of Killing"
                  style={{
                    height: isMobile ? 'clamp(36px, 10vw, 60px)' : 'clamp(44px, 12vh, 160px)',
                    width: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.7))',
                  }}
                />
                {!isMobile && (
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
                )}
              </div>

              {/* Just play the video */}
              <div style={{ flexShrink: 0, paddingTop: isMobile ? 2 : 'clamp(4px, 0.8vh, 14px)' }}>
                <BoxButton small onClick={() => setPhase('film')}>
                  Just play the video
                </BoxButton>
              </div>
            </header>

            {/* ── TELL A JOKE title — floats between header and mic ── */}
            {phase === 'idle' && (
              <div style={{
                position: 'absolute',
                top: isMobile ? '18%' : '22%',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                zIndex: 5,
              }}>
                <h1 style={{
                  color: '#f0ebe0',
                  fontSize: isMobile ? 'clamp(1.6rem, 7vw, 3rem)' : 'clamp(1.4rem, 4.8vw, 7.5rem)',
                  fontFamily: JOAN,
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  margin: 0,
                  textShadow: '0 2px 24px rgba(0,0,0,0.9)',
                  whiteSpace: 'nowrap',
                }}>
                  TELL A JOKE
                </h1>
                {phase === 'listening' && jokeType === 'tell' && (
                  <p className="fade-up" style={{
                    color: 'rgba(240,235,224,0.78)',
                    fontSize: isMobile ? 'clamp(0.8rem, 3.5vw, 1.2rem)' : 'clamp(0.9rem, 1.8vw, 2rem)',
                    fontFamily: JOAN,
                    letterSpacing: '0.08em',
                    marginTop: 'clamp(4px, 0.6vh, 10px)',
                    textShadow: '0 1px 10px rgba(0,0,0,0.9)',
                  }}>
                    The audience is listening
                  </p>
                )}
              </div>
            )}

            {/* ── IDLE: Both buttons flanking the mic ── */}
            {phase === 'idle' && (
              <div style={{
                position: 'absolute',
                top: '57%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(120px, 32vw, 640px)',
              }}>
                <BoxButton onClick={handleTellJoke}>Say my own joke</BoxButton>
                <BoxButton onClick={handleStealJoke}>Steal a joke</BoxButton>
              </div>
            )}

            {/* ── TELL LISTENING: full-screen overlay like teleprompter ── */}
            {phase === 'listening' && jokeType === 'tell' && (
              <div className="fade-up" style={{
                position: 'fixed', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.62)',
                backdropFilter: 'blur(2px)',
                zIndex: 30,
                padding: '6rem 2rem 5rem',
              }}>
                {/* REC indicator */}
                <div style={{
                  position: 'absolute', top: 32, left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div className="rec-dot" style={{ width: 9, height: 9, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                  <span style={{
                    color: '#dc2626', fontSize: '0.6rem',
                    letterSpacing: '0.5em', fontWeight: 700, textTransform: 'uppercase',
                    fontFamily: JOAN,
                  }}>REC</span>
                </div>

                {/* Waveform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        background: i % 3 === 0 ? '#dc2626' : 'rgba(220,38,38,0.55)',
                        animationDelay: `${(i * 0.08) % 0.65}s`,
                        animationDuration: `${0.38 + (i % 5) * 0.09}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Done button */}
                <DoneButton onClick={stopRecording} />
              </div>
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

            {/* ── CRITIQUE — full-screen overlay, centered ── */}
            {phase === 'critique' && (
              <div className="fade-up" style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(3px)',
                zIndex: 30,
                padding: 'clamp(2rem, 5vw, 6rem)',
              }}>
                <div style={{ maxWidth: 'clamp(280px, 60vw, 720px)', width: '100%' }}>
                  <CritiqueDisplay
                    text={critique}
                    jokeType={jokeType}
                    onWatchFilm={() => setPhase('film')}
                    onTryAgain={handleReset}
                  />
                </div>
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
