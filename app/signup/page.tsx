'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --bg: #0a0b14; --accent: #6366f1; --accent-light: #818cf8; --cyan: #06b6d4; --text: #e2e8f0; --text-muted: #94a3b8; --text-dim: #64748b; --border-s: rgba(255,255,255,0.06); --r: 12px; --r-sm: 8px; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }
        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .left {
          background: radial-gradient(ellipse 70% 70% at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 60%);
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px; position: relative; border-right: 1px solid var(--border-s);
        }
        .left-logo { position: absolute; top: 48px; left: 80px; font-size: 18px; font-weight: 700; color: var(--text); text-decoration: none; }
        .left-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; color: var(--accent-light); text-transform: uppercase; margin-bottom: 20px; }
        .left-title { font-size: 48px; font-weight: 700; line-height: 1.1; color: var(--text); margin-bottom: 20px; letter-spacing: -0.02em; }
        .left-title em { font-style: normal; background: linear-gradient(135deg, var(--accent), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .left-sub { font-size: 16px; color: var(--text-muted); line-height: 1.7; max-width: 360px; }
        .checks { margin-top: 40px; }
        .check { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; font-size: 14px; color: var(--text-muted); }
        .check::before { content: '✓'; color: var(--cyan); font-weight: 600; font-size: 14px; }
        .right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; }
        .form-box { width: 100%; max-width: 400px; }
        .form-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: var(--accent-light); text-transform: uppercase; margin-bottom: 12px; }
        .form-title { font-size: 36px; font-weight: 700; color: var(--text); margin-bottom: 48px; letter-spacing: -0.02em; }
        .google-btn {
          width: 100%; padding: 16px 24px; background: transparent;
          border: 1px solid rgba(255,255,255,0.12); color: var(--text);
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
          border-radius: var(--r-sm); cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .google-btn:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.04); }
        .google-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .google-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .divider { display: flex; align-items: center; gap: 16px; margin: 32px 0; }
        .divider-line { flex: 1; height: 1px; background: var(--border-s); }
        .divider-text { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: var(--text-dim); }
        .tagline { font-size: 14px; color: var(--text-muted); text-align: center; line-height: 1.8; }
        .error-msg { margin-top: 16px; font-size: 13px; color: #ef4444; }
        .form-footer { margin-top: 32px; font-size: 13px; color: var(--text-dim); text-align: center; }
        .form-footer a { color: var(--accent-light); text-decoration: none; font-weight: 600; }
        .form-footer a:hover { color: var(--cyan); }
        .legal-note { margin-top: 24px; font-size: 12px; color: var(--text-dim); text-align: center; line-height: 1.6; }
        .legal-note a { color: var(--accent-light); text-decoration: none; }
        .legal-note a:hover { color: var(--cyan); }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 40px 24px; }
        }
      `}</style>
      <div className="page">
        <div className="left">
          <a href="/" className="left-logo">SOVIRON</a>
          <p className="left-eyebrow">Get started free</p>
          <h1 className="left-title">Clone your<br /><em>voice today.</em></h1>
          <p className="left-sub">Join creators, podcasters, and developers using Soviron to generate lifelike Indian voices.</p>
          <div className="checks">
            <div className="check">5,000 free characters every month</div>
            <div className="check">Clone your voice in seconds</div>
            <div className="check">Hindi, Tamil, Telugu & more</div>
            <div className="check">No credit card required</div>
          </div>
        </div>
        <div className="right">
          <div className="form-box">
            <p className="form-label">Create Account</p>
            <h2 className="form-title">Start for free</h2>
            <button className="google-btn" onClick={handleGoogleSignup} disabled={googleLoading}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">SECURE & INSTANT</span>
              <div className="divider-line"></div>
            </div>
            <p className="tagline">One click. No passwords.<br />Your Google account keeps it secure.</p>
            {error && <p className="error-msg">{error}</p>}
            <p className="form-footer">Already have an account? <a href="/login">Sign in →</a></p>
            <p className="legal-note">By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
    </>
  );
}