'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceFileName, setVoiceFileName] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      setUser(session.user);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoiceFile(file);
      setVoiceFileName(file.name);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) { setError('Please enter some text.'); return; }
    if (text.length > (profile?.chars_limit - profile?.chars_used)) {
      setError('Not enough characters remaining. Please upgrade your plan.');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (voiceFile) formData.append('audio_prompt', voiceFile);

      const res = await fetch('http://35.194.128.213:8000/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Generation failed');

      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));

      // Deduct characters
      await supabase.from('profiles').update({
        chars_used: (profile?.chars_used || 0) + text.length
      }).eq('id', user.id);

      setProfile((prev: any) => ({ ...prev, chars_used: (prev?.chars_used || 0) + text.length }));

    } catch {
      setError('Generation failed. Make sure the VM is running.');
    } finally {
      setLoading(false);
    }
  };

  const charsRemaining = profile ? profile.chars_limit - profile.chars_used : 0;
  const charsPercent = profile ? (profile.chars_used / profile.chars_limit) * 100 : 0;

  if (!user) return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(245,240,232,0.3)' }}>LOADING...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --black: #080808;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: #7A6330;
          --purple: #6B3FA0;
          --white: #F5F0E8;
          --grey: #141414;
        }
        body {
          background: var(--black);
          color: var(--white);
          font-family: 'Tenor Sans', sans-serif;
          min-height: 100vh;
        }
        .layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          background: #0C0C0C;
          border-right: 1px solid rgba(201,168,76,0.08);
          padding: 40px 28px;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
        }
        .sidebar-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 300;
          letter-spacing: 0.3em; color: var(--gold);
          text-transform: uppercase;
          text-decoration: none;
          margin-bottom: 48px;
          display: block;
        }
        .sidebar-section {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.2);
          margin-bottom: 12px;
          margin-top: 24px;
        }
        .sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.5);
          text-decoration: none;
          transition: all 0.2s;
          border-left: 2px solid transparent;
          cursor: pointer;
        }
        .sidebar-item:hover { color: var(--white); border-left-color: var(--gold-dim); }
        .sidebar-item.active { color: var(--gold); border-left-color: var(--gold); }
        .sidebar-bottom { margin-top: auto; }
        .plan-badge {
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.15);
          padding: 16px;
          margin-bottom: 16px;
        }
        .plan-badge-name {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold); margin-bottom: 4px;
        }
        .plan-badge-chars {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300;
          color: var(--white);
        }
        .plan-badge-sub {
          font-family: 'Space Mono', monospace;
          font-size: 9px; color: rgba(245,240,232,0.3);
          letter-spacing: 0.1em;
        }
        .quota-bar-wrap { margin-top: 8px; }
        .quota-bar-bg {
          height: 2px;
          background: rgba(255,255,255,0.06);
          margin-top: 8px;
        }
        .quota-bar-fill {
          height: 2px;
          background: var(--gold);
          transition: width 0.5s ease;
        }
        .logout-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(245,240,232,0.08);
          color: rgba(245,240,232,0.3);
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer; transition: all 0.3s;
        }
        .logout-btn:hover { border-color: rgba(245,240,232,0.2); color: rgba(245,240,232,0.6); }

        /* MAIN */
        .main { margin-left: 260px; padding: 60px; }
        .main-header { margin-bottom: 48px; }
        .main-greeting {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.3);
          margin-bottom: 8px;
        }
        .main-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px; font-weight: 300;
          line-height: 1;
        }
        .main-title em { font-style: italic; color: var(--gold); }

        .generate-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,168,76,0.1);
          padding: 48px;
          position: relative;
          margin-bottom: 2px;
        }
        .generate-card::before {
          content: '';
          position: absolute; top: -1px; left: 40px;
          width: 80px; height: 2px;
          background: var(--gold);
        }
        .card-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold); margin-bottom: 20px;
        }
        .gen-textarea {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,168,76,0.08);
          padding: 20px;
          color: var(--white);
          font-family: 'Tenor Sans', sans-serif;
          font-size: 15px; line-height: 1.7;
          resize: none; height: 160px;
          outline: none; transition: border-color 0.3s;
          letter-spacing: 0.02em;
        }
        .gen-textarea:focus { border-color: rgba(201,168,76,0.3); }
        .gen-textarea::placeholder { color: rgba(245,240,232,0.15); }
        .char-count {
          display: flex; justify-content: space-between;
          margin-top: 8px; margin-bottom: 24px;
        }
        .char-count span {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.25);
        }
        .char-count span.warn { color: #e05555; }

        /* Voice upload */
        .voice-upload-area {
          border: 1px dashed rgba(201,168,76,0.2);
          padding: 24px;
          text-align: center;
          margin-bottom: 24px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }
        .voice-upload-area:hover { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.02); }
        .voice-upload-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .upload-icon { font-size: 24px; margin-bottom: 8px; }
        .upload-title {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.4);
          margin-bottom: 4px;
        }
        .upload-sub {
          font-size: 12px;
          color: rgba(245,240,232,0.2);
          letter-spacing: 0.02em;
        }
        .upload-selected {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: var(--gold);
          letter-spacing: 0.1em;
        }

        .gen-btn {
          width: 100%; padding: 18px;
          background: var(--gold); color: var(--black);
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer; transition: all 0.3s;
        }
        .gen-btn:hover { background: var(--gold-light); }
        .gen-btn:disabled { background: #1A1A1A; color: rgba(245,240,232,0.2); cursor: not-allowed; }

        .error-msg {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #e05555;
          margin-top: 12px; letter-spacing: 0.05em;
        }

        .audio-card {
          background: rgba(201,168,76,0.04);
          border: 1px solid rgba(201,168,76,0.12);
          padding: 32px; margin-top: 2px;
        }
        .audio-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold); margin-bottom: 16px;
        }
        .audio-player { width: 100%; margin-bottom: 16px; }
        .download-link {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold-dim); text-decoration: none;
          transition: color 0.3s;
        }
        .download-link:hover { color: var(--gold); }

        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .sidebar { position: relative; width: 100%; height: auto; }
          .main { margin-left: 0; padding: 24px; }
        }
      `}</style>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <a href="/" className="sidebar-logo">Soviron</a>

          <p className="sidebar-section">Menu</p>
          <a className="sidebar-item active" href="/dashboard">🎙 Generate</a>
          <a className="sidebar-item" href="/dashboard/history">📋 History</a>
          <a className="sidebar-item" href="/dashboard/voices">🔊 My Voices</a>
          <a className="sidebar-item" href="/pricing">⭐ Upgrade</a>

          <div className="sidebar-bottom">
            <div className="plan-badge">
              <p className="plan-badge-name">{profile?.plan || 'free'} plan</p>
              <p className="plan-badge-chars">{charsRemaining.toLocaleString()}</p>
              <p className="plan-badge-sub">chars remaining</p>
              <div className="quota-bar-wrap">
                <div className="quota-bar-bg">
                  <div className="quota-bar-fill" style={{ width: `${Math.min(charsPercent, 100)}%` }} />
                </div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="main-header">
            <p className="main-greeting">Welcome back, {user?.email?.split('@')[0]}</p>
            <h1 className="main-title">Generate <em>Speech</em></h1>
          </div>

          <div className="generate-card">
            <p className="card-label">01 — Enter your text</p>
            <textarea
              className="gen-textarea"
              placeholder="Type or paste the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="char-count">
              <span className={text.length > charsRemaining ? 'warn' : ''}>{text.length} chars typed</span>
              <span>{charsRemaining.toLocaleString()} remaining</span>
            </div>

            <p className="card-label">02 — Upload voice sample</p>
            <div className="voice-upload-area">
              <input type="file" accept="audio/*" onChange={handleVoiceUpload} />
              <div className="upload-icon">🎤</div>
              {voiceFileName ? (
                <p className="upload-selected">✓ {voiceFileName}</p>
              ) : (
                <>
                  <p className="upload-title">Click to upload voice sample</p>
                  <p className="upload-sub">MP3, WAV, M4A — 10 to 30 seconds recommended</p>
                </>
              )}
            </div>

            <button
              className="gen-btn"
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
            >
              {loading ? 'Generating your voice...' : 'Generate Speech →'}
            </button>

            {error && <p className="error-msg">{error}</p>}
          </div>

          {audioUrl && (
            <div className="audio-card">
              <p className="audio-label">Your generated audio</p>
              <audio controls className="audio-player" src={audioUrl} />
              <a href={audioUrl} download="soviron-output.wav" className="download-link">
                ↓ Download WAV
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  );
}