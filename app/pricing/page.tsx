'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

declare global { interface Window { Razorpay: any; } }

const loadRazorpayScript = () => new Promise<void>((resolve) => {
  if (document.getElementById('razorpay-script')) { resolve(); return; }
  const s = document.createElement('script');
  s.id = 'razorpay-script';
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve();
  document.body.appendChild(s);
});

const plans = [
  { name: 'Free', price: 0, chars: '5,000', period: '/ forever', features: ['5,000 characters per month', 'Upload voice sample each time', 'WAV download', 'Standard speed'], cta: 'Get Started', ctaHref: '/signup', planKey: null, style: 'outline' },
  { name: 'Starter', price: 79, chars: '50,000', period: '/ month', features: ['50,000 characters per month', 'Upload voice sample each time', 'WAV download', 'Standard speed'], cta: 'Get Starter', ctaHref: null, planKey: 'starter', style: 'outline' },
  { name: 'Standard', price: 149, chars: '100,000', period: '/ month', features: ['100,000 characters per month', 'Save up to 5 voice profiles', 'WAV download', 'Priority speed'], cta: 'Get Standard', ctaHref: null, planKey: 'standard', style: 'solid', badge: 'POPULAR' },
  { name: 'Creator', price: 349, chars: '300,000', period: '/ month', features: ['300,000 characters per month', 'Save up to 5 voice profiles', 'Priority speed', 'API access'], cta: 'Get Creator', ctaHref: null, planKey: 'creator', style: 'outline' },
  { name: 'Pro', price: 699, chars: '700,000', period: '/ month', features: ['700,000 characters per month', 'Save up to 5 voice profiles', 'Priority speed', 'API access'], cta: 'Get Pro', ctaHref: null, planKey: 'pro', style: 'outline' },
  { name: 'Studio', price: 1299, chars: '1,500,000', period: '/ month', features: ['1,500,000 characters per month', 'Save up to 5 voice profiles', 'Priority speed', 'API access', 'Dedicated support'], cta: 'Get Studio', ctaHref: null, planKey: 'studio', style: 'outline' },
];

const topups = [
  { chars: '50k chars', price: 79, topupKey: '50k' },
  { chars: '200k chars', price: 249, topupKey: '200k' },
  { chars: '1M chars', price: 799, topupKey: '1m' },
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
        if (data) setCurrentPlan(data.plan || 'free');
      }
    };
    getUser();
  }, []);

  const handlePlanClick = async (planKey: string | null, ctaHref: string | null) => {
    if (!planKey) { window.location.href = ctaHref!; return; }
    if (!user) { window.location.href = `/signup?plan=${planKey}`; return; }
    setLoading(planKey);
    try {
      await loadRazorpayScript();
      const res = await fetch('/api/razorpay/create-subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const { subscription_id, key } = await res.json();
      const options = {
        key, subscription_id, name: 'Soviron',
        description: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, plan: planKey }),
          });
          const result = await verifyRes.json();
          if (result.success) window.location.href = '/dashboard';
          else alert('Payment verification failed. Contact support.');
        },
        prefill: { email: user?.email },
        theme: { color: '#C9A84C' },
      };
      new window.Razorpay(options).open();
    } finally {
      setLoading(null);
    }
  };

  const handleTopupClick = async (topupKey: string, price: number) => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(`topup-${topupKey}`);
    try {
      await loadRazorpayScript();
      const res = await fetch('/api/razorpay/create-topup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topup: topupKey }),
      });
      const { order_id, amount, key } = await res.json();
      const options = {
        key, amount, currency: 'INR', order_id, name: 'Soviron',
        description: `Top-up ${topupKey} characters`,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify-topup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, topup: topupKey }),
          });
          const result = await verifyRes.json();
          if (result.success) window.location.href = '/dashboard';
          else alert('Top-up verification failed. Contact support.');
        },
        prefill: { email: user?.email },
        theme: { color: '#C9A84C' },
      };
      new window.Razorpay(options).open();
    } finally {
      setLoading(null);
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
          --purple: rgba(107,63,160,0.1);
        }
        html, body { background: var(--black); color: var(--white); font-family: 'Tenor Sans', sans-serif; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 24px 60px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(8,8,8,0.9);
          border-bottom: 1px solid rgba(201,168,76,0.08);
          backdrop-filter: blur(12px);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 300;
          letter-spacing: 0.35em; color: var(--gold);
          text-transform: uppercase; text-decoration: none;
        }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-link {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,240,232,0.4);
          text-decoration: none; transition: color 0.3s;
        }
        .nav-link:hover { color: var(--white); }
        .nav-btn {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--black);
          background: var(--gold); border: none;
          padding: 10px 20px; cursor: pointer;
          text-decoration: none; transition: background 0.3s;
        }
        .nav-btn:hover { background: var(--gold-light); }

        /* PAGE */
        .page { padding: 140px 60px 100px; max-width: 1400px; margin: 0 auto; }

        /* HEADER */
        .header { text-align: center; margin-bottom: 80px; }
        .header-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.45em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 16px;
        }
        .header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px; font-weight: 300; line-height: 1;
          margin-bottom: 16px;
        }
        .header-title em { font-style: italic; color: var(--gold); }
        .header-sub {
          font-size: 15px; color: rgba(245,240,232,0.4);
          line-height: 1.7; letter-spacing: 0.02em;
        }

        /* CURRENT PLAN BADGE */
        .current-plan-banner {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.15);
          padding: 14px 24px; text-align: center;
          margin-bottom: 40px;
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,240,232,0.4);
        }
        .current-plan-banner span { color: var(--gold); }

        /* PLANS GRID */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: rgba(201,168,76,0.08);
          margin-bottom: 2px;
        }
        .plan-card {
          background: var(--black);
          padding: 40px 24px;
          position: relative;
          transition: background 0.3s;
          display: flex; flex-direction: column;
        }
        .plan-card:hover { background: rgba(107,63,160,0.06); }
        .plan-card.featured { background: rgba(107,63,160,0.1); }
        .plan-card.current-plan { background: rgba(201,168,76,0.05); }
        .plan-badge {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          font-family: 'Space Mono', monospace;
          font-size: 7px; letter-spacing: 0.25em;
          color: var(--gold); border: 1px solid var(--gold-dim);
          padding: 2px 8px; white-space: nowrap;
        }
        .current-badge {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          font-family: 'Space Mono', monospace;
          font-size: 7px; letter-spacing: 0.25em;
          color: #5ec97a; border: 1px solid rgba(94,201,122,0.3);
          padding: 2px 8px; white-space: nowrap;
        }
        .plan-name {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.25em;
          text-transform: uppercase; color: rgba(245,240,232,0.35);
          margin-bottom: 16px; margin-top: 8px;
        }
        .plan-card.featured .plan-name,
        .plan-card .plan-badge ~ .plan-name,
        .plan-card .current-badge ~ .plan-name { margin-top: 28px; }
        .plan-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px; font-weight: 300; line-height: 1;
          color: var(--white); margin-bottom: 2px;
        }
        .plan-price .rupee { color: var(--gold); font-size: 22px; vertical-align: super; }
        .plan-price .free-text { font-size: 32px; }
        .plan-period {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.25); margin-bottom: 4px;
        }
        .plan-chars {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 300;
          color: var(--gold); margin-bottom: 24px;
          letter-spacing: 0.02em;
        }
        .plan-divider {
          height: 1px; background: rgba(201,168,76,0.08);
          margin-bottom: 20px;
        }
        .plan-features { list-style: none; flex: 1; margin-bottom: 28px; }
        .plan-features li {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.1em;
          color: rgba(245,240,232,0.35); padding: 5px 0;
          border-bottom: 1px solid rgba(201,168,76,0.04);
          display: flex; gap: 8px; align-items: flex-start;
        }
        .plan-features li::before { content: '—'; color: var(--gold-dim); flex-shrink: 0; }
        .plan-cta {
          width: 100%; padding: 13px;
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.3s; border: none;
          text-align: center; text-decoration: none;
          display: block;
        }
        .plan-cta.solid { background: var(--gold); color: var(--black); }
        .plan-cta.solid:hover { background: var(--gold-light); }
        .plan-cta.outline { background: transparent; color: var(--gold); border: 1px solid rgba(201,168,76,0.3); }
        .plan-cta.outline:hover { background: rgba(201,168,76,0.06); border-color: var(--gold); }
        .plan-cta.active-plan { background: transparent; color: rgba(94,201,122,0.6); border: 1px solid rgba(94,201,122,0.2); cursor: default; }
        .plan-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        /* TOPUP SECTION */
        .topup-section { margin-top: 60px; }
        .topup-header { margin-bottom: 32px; }
        .topup-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.4em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 8px;
        }
        .topup-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 300;
        }
        .topup-title em { font-style: italic; color: var(--gold); }
        .topup-sub {
          font-size: 13px; color: rgba(245,240,232,0.35);
          margin-top: 6px; letter-spacing: 0.02em;
        }
        .topup-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: rgba(201,168,76,0.08);
        }
        .topup-card {
          background: var(--black); padding: 36px 28px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; transition: background 0.3s;
        }
        .topup-card:hover { background: rgba(107,63,160,0.06); }
        .topup-chars {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 300; color: var(--white);
        }
        .topup-chars span { color: var(--gold); font-size: 18px; }
        .topup-price {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.3); margin-top: 4px;
        }
        .topup-btn {
          padding: 11px 20px; white-space: nowrap;
          background: transparent; color: var(--gold);
          border: 1px solid rgba(201,168,76,0.3);
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer; transition: all 0.3s;
          flex-shrink: 0;
        }
        .topup-btn:hover { background: rgba(201,168,76,0.06); border-color: var(--gold); }
        .topup-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* FAQ */
        .faq-section { margin-top: 80px; padding-top: 60px; border-top: 1px solid rgba(201,168,76,0.08); }
        .faq-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 300; margin-bottom: 40px;
        }
        .faq-title em { font-style: italic; color: var(--gold); }
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .faq-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,168,76,0.08);
          padding: 28px;
        }
        .faq-q {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--white);
          margin-bottom: 10px;
        }
        .faq-a {
          font-size: 13px; color: rgba(245,240,232,0.4);
          line-height: 1.7; letter-spacing: 0.01em;
        }

        @media (max-width: 1024px) {
          .plans-grid { grid-template-columns: repeat(3, 1fr); }
          .topup-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .page { padding: 100px 24px 60px; }
          .nav { padding: 20px 24px; }
          .plans-grid { grid-template-columns: 1fr 1fr; }
          .header-title { font-size: 40px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">Soviron</a>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          {user ? (
            <a href="/dashboard" className="nav-btn">Dashboard</a>
          ) : (
            <a href="/login" className="nav-btn">Sign In</a>
          )}
        </div>
      </nav>

      <div className="page">
        {/* HEADER */}
        <div className="header">
          <p className="header-eyebrow">Simple Pricing</p>
          <h1 className="header-title">Pay for what you <em>use</em></h1>
          <p className="header-sub">Start free. Upgrade when you need more characters.</p>
        </div>

        {/* CURRENT PLAN BANNER */}
        {user && (
          <div className="current-plan-banner">
            You are on the <span>{currentPlan.toUpperCase()}</span> plan
          </div>
        )}

        {/* PLANS */}
        <div className="plans-grid">
          {plans.map((plan) => {
            const isCurrent = user && plan.planKey === currentPlan;
            return (
              <div key={plan.name} className={`plan-card ${plan.style === 'solid' ? 'featured' : ''} ${isCurrent ? 'current-plan' : ''}`}>
                {plan.badge && !isCurrent && <span className="plan-badge">{plan.badge}</span>}
                {isCurrent && <span className="current-badge">CURRENT</span>}
                <p className="plan-name">{plan.name}</p>
                <p className="plan-price">
                  {plan.price === 0
                    ? <span className="free-text">Free</span>
                    : <><span className="rupee">₹</span>{plan.price}</>
                  }
                </p>
                <p className="plan-period">{plan.period}</p>
                <p className="plan-chars">{plan.chars} chars</p>
                <div className="plan-divider" />
                <ul className="plan-features">
                  {plan.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                {isCurrent ? (
                  <button className="plan-cta active-plan" disabled>Current Plan</button>
                ) : plan.ctaHref ? (
                  <a href={plan.ctaHref} className="plan-cta outline">{plan.cta}</a>
                ) : (
                  <button
                    className={`plan-cta ${plan.style === 'solid' ? 'solid' : 'outline'}`}
                    onClick={() => handlePlanClick(plan.planKey, plan.ctaHref)}
                    disabled={loading === plan.planKey}
                  >
                    {loading === plan.planKey ? 'Loading...' : plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* TOPUPS */}
        <div className="topup-section">
          <div className="topup-header">
            <p className="topup-eyebrow">Need More?</p>
            <h2 className="topup-title">One-time <em>Top-ups</em></h2>
            <p className="topup-sub">Add characters to your account without changing your plan.</p>
          </div>
          <div className="topup-grid">
            {topups.map(t => (
              <div key={t.topupKey} className="topup-card">
                <div>
                  <p className="topup-chars">{t.chars} <span>characters</span></p>
                  <p className="topup-price">₹{t.price} one-time</p>
                </div>
                <button
                  className="topup-btn"
                  onClick={() => handleTopupClick(t.topupKey, t.price)}
                  disabled={loading === `topup-${t.topupKey}`}
                >
                  {loading === `topup-${t.topupKey}` ? 'Loading...' : `Buy for ₹${t.price}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <h2 className="faq-title">Common <em>Questions</em></h2>
          <div className="faq-grid">
            <div className="faq-item">
              <p className="faq-q">What counts as a character?</p>
              <p className="faq-a">Every letter, number, space and punctuation mark counts as one character. 1,000 characters is roughly 150-200 words.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">Do unused characters roll over?</p>
              <p className="faq-a">No, monthly plan characters reset each billing cycle. Top-up characters never expire.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">Can I save my voice clone?</p>
              <p className="faq-a">Voice saving is available on Starter and above plans. Free users can upload a voice sample per session but it won't be saved.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">How do I cancel my subscription?</p>
              <p className="faq-a">Email us at support@soviron.com and we'll cancel within 24 hours. No questions asked.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">What languages are supported?</p>
              <p className="faq-a">Soviron supports Hindi, English, Marathi, Tamil, Telugu, Bengali, Kannada, Gujarati, Punjabi, Malayalam and more.</p>
            </div>
            <div className="faq-item">
              <p className="faq-q">Is there a refund policy?</p>
              <p className="faq-a">We offer a full refund within 7 days of purchase if you're not satisfied. Contact support@soviron.com.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}