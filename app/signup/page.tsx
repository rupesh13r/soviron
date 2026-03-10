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
        .signup-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #FFFFFF; }
        .signup-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px; position: relative; border-right: 1px solid rgba(0,0,0,0.08);
        }
        .signup-left-logo { position: absolute; top: 48px; left: 80px; font-size: 18px; font-weight: 700; color: #080808; text-decoration: none; letter-spacing: -0.02em; }
        .signup-left-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; color: #6B7280; text-transform: uppercase; margin-bottom: 20px; }
        .signup-left-title { font-size: 48px; font-weight: 700; line-height: 1.1; color: #080808; margin-bottom: 20px; letter-spacing: -0.03em; }
        .signup-left-title em { font-style: normal; color: #080808; }
        .signup-left-sub { font-size: 16px; color: #6B7280; line-height: 1.7; max-width: 360px; }
        .signup-checks { margin-top: 40px; }
        .signup-check { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; font-size: 14px; color: #6B7280; }
        .signup-check::before { content: '✓'; color: #080808; font-weight: 600; font-size: 14px; }
        .signup-right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; }
        .signup-form-box { width: 100%; max-width: 400px; }
        .signup-form-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: #6B7280; text-transform: uppercase; margin-bottom: 12px; }
        .signup-form-title { font-size: 36px; font-weight: 700; color: #080808; margin-bottom: 48px; letter-spacing: -0.02em; }
        .signup-google-btn {
          width: 100%; padding: 16px 24px; background: transparent;
          border: 1px solid rgba(0,0,0,0.12); color: #080808;
          font-size: 14px; font-weight: 600;
          border-radius: 12px; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          font-family: inherit;
        }
        .signup-google-btn:hover { border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.02); transform: scale(1.02); }
        .signup-google-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .signup-google-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .signup-divider { display: flex; align-items: center; gap: 16px; margin: 32px 0; }
        .signup-divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
        .signup-divider-text { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: #9CA3AF; }
        .signup-tagline { font-size: 14px; color: #6B7280; text-align: center; line-height: 1.8; }
        .signup-error-msg { margin-top: 16px; font-size: 13px; color: #ef4444; }
        .signup-form-footer { margin-top: 32px; font-size: 13px; color: #9CA3AF; text-align: center; }
        .signup-form-footer a { color: #080808; text-decoration: none; font-weight: 600; }
        .signup-form-footer a:hover { text-decoration: underline; }
        .signup-legal-note { margin-top: 24px; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.6; }
        .signup-legal-note a { color: #080808; text-decoration: none; }
        .signup-legal-note a:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .signup-page { grid-template-columns: 1fr; }
          .signup-left { display: none; }
          .signup-right { padding: 40px 24px; }
        }
      `}</style>
      <div className="signup-page">
        <div className="signup-left">
          <a href="/" className="signup-left-logo">SOVIRON</a>
          <p className="signup-left-eyebrow">Get started free</p>
          <h1 className="signup-left-title">Clone your<br /><em>voice today.</em></h1>
          <p className="signup-left-sub">Join creators, podcasters, and developers using Soviron to generate lifelike Indian voices.</p>
          <div className="signup-checks">
            <div className="signup-check">5,000 free characters every month</div>
            <div className="signup-check">Clone your voice in seconds</div>
            <div className="signup-check">Hindi, Tamil, Telugu &amp; more</div>
            <div className="signup-check">No credit card required</div>
          </div>
        </div>
        <div className="signup-right">
          <div className="signup-form-box">
            <p className="signup-form-label">Create Account</p>
            <h2 className="signup-form-title">Start for free</h2>
            <button className="signup-google-btn" onClick={handleGoogleSignup} disabled={googleLoading}>
              <svg className="signup-google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
            <div className="signup-divider">
              <div className="signup-divider-line"></div>
              <span className="signup-divider-text">SECURE &amp; INSTANT</span>
              <div className="signup-divider-line"></div>
            </div>
            <p className="signup-tagline">One click. No passwords.<br />Your Google account keeps it secure.</p>
            {error && <p className="signup-error-msg">{error}</p>}
            <p className="signup-form-footer">Already have an account? <a href="/login">Sign in →</a></p>
            <p className="signup-legal-note">By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
    </>
  );
}