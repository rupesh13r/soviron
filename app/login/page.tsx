'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getDeviceFingerprint } from '../../lib/fingerprint';

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const fp = await getDeviceFingerprint();
      const res = await fetch(`/api/check-fingerprint?fp=${fp}`);
      const data = await res.json();
      localStorage.setItem('device_fp', fp);
      if (data.exists) {
        localStorage.setItem('hasExistingDevice', 'true');
      } else {
        localStorage.removeItem('hasExistingDevice');
      }
    } catch (e) {
      console.error('Fingerprint error:', e);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <>
      <style>{`
        .login-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #FFFFFF; }
        .login-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px; position: relative; border-right: 1px solid rgba(0,0,0,0.08);
        }
        .login-left-logo { position: absolute; top: 48px; left: 80px; font-size: 18px; font-weight: 700; color: #080808; text-decoration: none; letter-spacing: -0.02em; }
        .login-left-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; color: #6B7280; text-transform: uppercase; margin-bottom: 20px; }
        .login-left-title { font-size: 48px; font-weight: 700; line-height: 1.1; color: #080808; margin-bottom: 20px; letter-spacing: -0.03em; }
        .login-left-title em { font-style: normal; color: #080808; }
        .login-left-sub { font-size: 16px; color: #6B7280; line-height: 1.7; max-width: 360px; }
        .login-right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; }
        .login-form-box { width: 100%; max-width: 400px; }
        .login-form-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: #6B7280; text-transform: uppercase; margin-bottom: 12px; }
        .login-form-title { font-size: 36px; font-weight: 700; color: #080808; margin-bottom: 48px; letter-spacing: -0.02em; }
        .login-google-btn {
          width: 100%; padding: 16px 24px; background: transparent;
          border: 1px solid rgba(0,0,0,0.12); color: #080808;
          font-size: 14px; font-weight: 600;
          border-radius: 12px; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          font-family: inherit;
        }
        .login-google-btn:hover { border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.02); transform: scale(1.02); }
        .login-google-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .login-google-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .login-divider { display: flex; align-items: center; gap: 16px; margin: 32px 0; }
        .login-divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
        .login-divider-text { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: #9CA3AF; }
        .login-tagline { font-size: 14px; color: #6B7280; text-align: center; line-height: 1.8; }
        .login-error-msg { margin-top: 16px; font-size: 13px; color: #ef4444; }
        .login-form-footer { margin-top: 32px; font-size: 13px; color: #9CA3AF; text-align: center; }
        .login-form-footer a { color: #080808; text-decoration: none; font-weight: 600; }
        .login-form-footer a:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 40px 24px; }
        }
      `}</style>
      <div className="login-page">
        <div className="login-left">
          <a href="/" className="login-left-logo">SOVIRON</a>
          <p className="login-left-eyebrow">Welcome back</p>
          <h1 className="login-left-title">Your voice,<br /><em>perfected.</em></h1>
          <p className="login-left-sub">Sign in to access your dashboard, generate speech, and manage your voice clones.</p>
        </div>
        <div className="login-right">
          <div className="login-form-box">
            <p className="login-form-label">Account Access</p>
            <h2 className="login-form-title">Sign in</h2>
            <button className="login-google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
              <svg className="login-google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
            <div className="login-divider">
              <div className="login-divider-line"></div>
              <span className="login-divider-text">FREE TO START</span>
              <div className="login-divider-line"></div>
            </div>
            <p className="login-tagline">5,000 characters free every month.<br />No credit card required.</p>
            {error && <p className="login-error-msg">{error}</p>}
            <p className="login-form-footer">Don't have an account? <a href="/signup">Sign up free →</a></p>
          </div>
        </div>
      </div>
    </>
  );
}