'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --black: #080808; --gold: #C9A84C; --gold-light: #E8C97A; --gold-dim: #7A6330; --white: #F5F0E8; }
        body { background: var(--black); color: var(--white); font-family: 'Tenor Sans', sans-serif; min-height: 100vh; }
        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .left {
          background: radial-gradient(ellipse 80% 80% at 30% 50%, rgba(107,63,160,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 60%);
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px; position: relative; border-right: 1px solid rgba(201,168,76,0.08);
        }
        .left-logo { position: absolute; top: 48px; left: 80px; font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: 0.3em; color: var(--gold); text-decoration: none; }
        .left-eyebrow { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.3em; color: var(--gold-dim); text-transform: uppercase; margin-bottom: 24px; }
        .left-title { font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 300; line-height: 1.1; color: var(--white); margin-bottom: 24px; }
        .left-title em { font-style: italic; color: var(--gold); }
        .left-sub { font-size: 14px; color: rgba(245,240,232,0.5); line-height: 1.7; max-width: 360px; }
        .right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; }
        .form-box { width: 100%; max-width: 400px; }
        .form-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.3em; color: var(--gold); text-transform: uppercase; margin-bottom: 12px; }
        .form-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: var(--white); margin-bottom: 48px; }
        .google-btn {
          width: 100%; padding: 16px 24px; background: transparent;
          border: 1px solid rgba(245,240,232,0.15); color: var(--white);
          font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .google-btn:hover { border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.04); }
        .google-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .google-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .divider { display: flex; align-items: center; gap: 16px; margin: 32px 0; }
        .divider-line { flex: 1; height: 1px; background: rgba(245,240,232,0.08); }
        .divider-text { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: rgba(245,240,232,0.2); }
        .tagline { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: rgba(245,240,232,0.25); text-align: center; line-height: 1.8; }
        .error-msg { margin-top: 16px; font-family: 'Space Mono', monospace; font-size: 10px; color: #C0392B; letter-spacing: 0.05em; }
        .form-footer { margin-top: 32px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: rgba(245,240,232,0.3); text-align: center; }
        .form-footer a { color: var(--gold); text-decoration: none; }
        .form-footer a:hover { color: var(--gold-light); }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 40px 24px; }
        }
      `}</style>
      <div className="page">
        <div className="left">
          <a href="/" className="left-logo">SOVIRON</a>
          <p className="left-eyebrow">Welcome back</p>
          <h1 className="left-title">Your voice,<br /><em>perfected.</em></h1>
          <p className="left-sub">Sign in to access your dashboard, generate speech, and manage your voice clones.</p>
        </div>
        <div className="right">
          <div className="form-box">
            <p className="form-label">Account Access</p>
            <h2 className="form-title">Sign in</h2>
            <button className="google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">FREE TO START</span>
              <div className="divider-line"></div>
            </div>
            <p className="tagline">5,000 characters free every month.<br />No credit card required.</p>
            {error && <p className="error-msg">{error}</p>}
            <p className="form-footer">Don't have an account? <a href="/signup">Sign up free →</a></p>
          </div>
        </div>
      </div>
    </>
  );
}