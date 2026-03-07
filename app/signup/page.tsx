'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirm) return;
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

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
          --white: #F5F0E8;
        }
        body {
          background: var(--black);
          color: var(--white);
          font-family: 'Tenor Sans', sans-serif;
          min-height: 100vh;
        }
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .left {
          background:
            radial-gradient(ellipse 80% 80% at 30% 50%, rgba(107,63,160,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          position: relative;
          border-right: 1px solid rgba(201,168,76,0.08);
        }
        .left-logo {
          position: absolute;
          top: 48px; left: 80px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300;
          letter-spacing: 0.3em;
          color: var(--gold);
          text-transform: uppercase;
          text-decoration: none;
        }
        .left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px; font-weight: 300;
          line-height: 0.95;
          letter-spacing: -0.02em;
        }
        .left-title em { font-style: italic; color: var(--gold); }
        .left-sub {
          font-size: 15px;
          color: rgba(245,240,232,0.4);
          line-height: 1.7;
          margin-top: 28px;
          max-width: 340px;
          letter-spacing: 0.02em;
        }
        .left-perks {
          margin-top: 40px;
          list-style: none;
        }
        .left-perks li {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.35);
          padding: 8px 0;
          border-bottom: 1px solid rgba(201,168,76,0.06);
          display: flex; gap: 12px;
        }
        .left-perks li::before { content: '—'; color: var(--gold-dim); }
        .right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
        }
        .form-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.4em;
          color: var(--gold); text-transform: uppercase;
          margin-bottom: 40px;
        }
        .form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px; font-weight: 300;
          margin-bottom: 40px;
        }
        .google-btn {
          width: 100%;
          padding: 16px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.2);
          color: var(--white);
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .google-btn:hover { border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.04); }
        .google-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .google-icon { width: 16px; height: 16px; flex-shrink: 0; }
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(201,168,76,0.1);
        }
        .divider-text {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.3em;
          color: rgba(245,240,232,0.2);
          text-transform: uppercase;
        }
        .field { margin-bottom: 20px; }
        .field-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.35);
          margin-bottom: 8px;
          display: block;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.12);
          padding: 16px 20px;
          color: var(--white);
          font-family: 'Tenor Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s;
          letter-spacing: 0.02em;
        }
        .field-input:focus { border-color: rgba(201,168,76,0.4); }
        .field-input::placeholder { color: rgba(245,240,232,0.15); }
        .submit-btn {
          width: 100%;
          margin-top: 8px;
          padding: 18px;
          background: var(--gold);
          color: var(--black);
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .submit-btn:hover { background: var(--gold-light); }
        .submit-btn:disabled { background: #2A2A2A; color: rgba(245,240,232,0.3); cursor: not-allowed; }
        .error-msg {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #e05555;
          margin-top: 12px; letter-spacing: 0.05em;
        }
        .success-box {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.2);
          padding: 32px;
          text-align: center;
        }
        .success-box h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 300;
          margin-bottom: 12px; color: var(--gold);
        }
        .success-box p {
          font-size: 13px;
          color: rgba(245,240,232,0.5);
          line-height: 1.7; letter-spacing: 0.02em;
        }
        .form-footer {
          margin-top: 28px;
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.1em;
          color: rgba(245,240,232,0.3);
        }
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
          <a href="/" className="left-logo">Soviron</a>
          <h1 className="left-title">
            Clone your<br /><em>voice today.</em>
          </h1>
          <p className="left-sub">
            Create your free account and get 5,000 characters to start generating speech instantly.
          </p>
          <ul className="left-perks">
            <li>5,000 free characters on signup</li>
            <li>Upload voice sample each session</li>
            <li>Download as WAV instantly</li>
            <li>Upgrade anytime from ₹99/mo</li>
          </ul>
        </div>

        <div className="right">
          <p className="form-label">Create Account</p>
          <h2 className="form-title">Get started free</h2>

          {success ? (
            <div className="success-box">
              <h3>Check your email ✦</h3>
              <p>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start cloning.</p>
            </div>
          ) : (
            <>
              <button className="google-btn" onClick={handleGoogleSignup} disabled={googleLoading}>
                <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">or</span>
                <div className="divider-line"></div>
              </div>

              <div className="field">
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Confirm Password</label>
                <input
                  className="field-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <button className="submit-btn" onClick={handleSignup} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>

              {error && <p className="error-msg">{error}</p>}

              <p className="form-footer">
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}