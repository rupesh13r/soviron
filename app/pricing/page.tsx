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
      } else {
        setUser(null);
        setCurrentPlan('free');
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        supabase.from('profiles').select('plan').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setCurrentPlan(data.plan || 'free');
        });
      } else {
        setUser(null);
        setCurrentPlan('free');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlanClick = async (planKey: string | null, ctaHref: string | null) => {
    if (!user) {
      window.location.href = planKey ? `/signup?plan=${planKey}` : (ctaHref || '/signup');
      return;
    }
    if (!planKey) {
      window.location.href = '/dashboard';
      return;
    }
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
          if (result.success) {
            window.location.href = `/payment/success?plan=${planKey}&amount=${plans.find(p => p.planKey === planKey)?.price}&payment_id=${response.razorpay_payment_id}`;
          } else {
            alert('Payment verification failed. Contact support.');
          }
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
          if (result.success) {
            window.location.href = `/payment/success?plan=topup-${topupKey}&amount=${price}&payment_id=${response.razorpay_payment_id}`;
          } else {
            alert('Top-up verification failed. Contact support.');
          }
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
        .pr-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.85); border-bottom: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(20px); }
        .pr-nav-logo { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #080808; text-decoration: none; }
        .pr-nav-links { display: flex; gap: 32px; align-items: center; }
        .pr-nav-link { font-size: 13px; font-weight: 500; color: #6B7280; text-decoration: none; transition: color 0.3s; }
        .pr-nav-link:hover { color: #080808; }
        .pr-nav-btn { font-size: 13px; font-weight: 600; color: #FFFFFF; background: #080808; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; text-decoration: none; transition: all 0.3s; }
        .pr-nav-btn:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .pr-page { padding: 120px 60px 80px; max-width: 1400px; margin: 0 auto; background: #FFFFFF; }
        .pr-header { text-align: center; margin-bottom: 64px; }
        .pr-header-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #6B7280; margin-bottom: 16px; }
        .pr-header-title { font-size: 56px; font-weight: 700; line-height: 1; margin-bottom: 16px; letter-spacing: -0.03em; color: #080808; }
        .pr-header-sub { font-size: 16px; color: #6B7280; line-height: 1.7; }
        .pr-banner { background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 14px 24px; text-align: center; margin-bottom: 40px; font-size: 13px; font-weight: 500; color: #6B7280; }
        .pr-banner span { color: #080808; font-weight: 700; }
        .pr-plans-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1px; background: rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; margin-bottom: 2px; }
        .pr-plan-card { background: #FFFFFF; padding: 36px 24px; position: relative; transition: all 0.3s; display: flex; flex-direction: column; }
        .pr-plan-card:hover { background: rgba(0,0,0,0.01); }
        .pr-plan-card.featured { background: #FFFFFF; box-shadow: 0 4px 32px rgba(0,0,0,0.1); z-index: 1; border: 1px solid #080808; margin: -1px; border-radius: 16px; }
        .pr-plan-card.current-plan { background: rgba(34,197,94,0.03); }
        .pr-plan-badge { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: #FFFFFF; background: #080808; border-radius: 4px; padding: 3px 10px; white-space: nowrap; }
        .pr-current-badge { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: #22c55e; background: rgba(34,197,94,0.1); border-radius: 4px; padding: 3px 10px; white-space: nowrap; }
        .pr-plan-name { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 16px; margin-top: 8px; }
        .pr-plan-card.featured .pr-plan-name, .pr-plan-card .pr-plan-badge ~ .pr-plan-name, .pr-plan-card .pr-current-badge ~ .pr-plan-name { margin-top: 28px; }
        .pr-plan-price { font-size: 44px; font-weight: 700; line-height: 1; color: #080808; margin-bottom: 2px; }
        .pr-plan-price .rupee { color: #080808; font-size: 20px; vertical-align: super; }
        .pr-plan-price .free-text { font-size: 32px; }
        .pr-plan-period { font-size: 12px; color: #9CA3AF; margin-bottom: 4px; }
        .pr-plan-chars { font-size: 16px; font-weight: 700; color: #080808; margin-bottom: 20px; }
        .pr-plan-divider { height: 1px; background: rgba(0,0,0,0.06); margin-bottom: 20px; }
        .pr-plan-features { list-style: none; flex: 1; margin-bottom: 28px; }
        .pr-plan-features li { font-size: 12px; color: #6B7280; padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,0.04); display: flex; gap: 8px; align-items: flex-start; line-height: 1.5; }
        .pr-plan-features li::before { content: '✓'; color: #080808; flex-shrink: 0; font-weight: 600; }
        .pr-plan-cta { width: 100%; padding: 12px; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; border: none; border-radius: 10px; text-align: center; text-decoration: none; display: block; }
        .pr-plan-cta.solid { background: #080808; color: #FFFFFF; }
        .pr-plan-cta.solid:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .pr-plan-cta.outline { background: transparent; color: #080808; border: 1px solid rgba(0,0,0,0.1); }
        .pr-plan-cta.outline:hover { border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.02); }
        .pr-plan-cta.active-plan { background: transparent; color: rgba(34,197,94,0.6); border: 1px solid rgba(34,197,94,0.2); cursor: default; border-radius: 10px; }
        .pr-plan-cta:disabled { opacity: 0.5; cursor: not-allowed; }
        .pr-topup-section { margin-top: 48px; }
        .pr-topup-header { margin-bottom: 28px; }
        .pr-topup-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #6B7280; margin-bottom: 8px; }
        .pr-topup-title { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #080808; }
        .pr-topup-sub { font-size: 14px; color: #6B7280; margin-top: 6px; }
        .pr-topup-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(0,0,0,0.06); border-radius: 10px; overflow: hidden; }
        .pr-topup-card { background: #FFFFFF; padding: 28px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; transition: all 0.3s; }
        .pr-topup-card:hover { background: rgba(0,0,0,0.01); }
        .pr-topup-chars { font-size: 28px; font-weight: 600; color: #080808; }
        .pr-topup-chars span { color: #6B7280; font-size: 16px; }
        .pr-topup-price { font-size: 12px; font-weight: 500; color: #9CA3AF; margin-top: 4px; }
        .pr-topup-btn { padding: 10px 20px; white-space: nowrap; background: transparent; color: #080808; border: 1px solid rgba(0,0,0,0.12); font-family: inherit; font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
        .pr-topup-btn:hover { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.2); }
        .pr-topup-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pr-faq-section { margin-top: 64px; padding-top: 48px; border-top: 1px solid rgba(0,0,0,0.08); }
        .pr-faq-title { font-size: 32px; font-weight: 700; margin-bottom: 36px; letter-spacing: -0.02em; color: #080808; }
        .pr-faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pr-faq-item { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 24px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
        .pr-faq-q { font-size: 14px; font-weight: 600; color: #080808; margin-bottom: 10px; }
        .pr-faq-a { font-size: 14px; color: #6B7280; line-height: 1.7; }
        @media (max-width: 1024px) { .pr-plans-grid { grid-template-columns: repeat(3, 1fr); } .pr-topup-grid { grid-template-columns: 1fr; } .pr-faq-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .pr-plans-grid { grid-template-columns: 1fr; }
          .pr-nav-links { display: none; } /* Hide links on mobile, relying on a hamburger in a real app, but for now we'll just show the CTA or simplify nav */
        }
        @media (max-width: 640px) { .pr-page { padding: 100px 24px 60px; } .pr-nav { padding: 16px 24px; } .pr-header-title { font-size: 40px; } .pr-topup-card { flex-direction: column; text-align: center; } .pr-topup-btn { width: 100%; margin-top: 16px; } }
      `}</style>
      {/* NAV */}
      <nav className="pr-nav">
        <a href="/" className="pr-nav-logo">Soviron</a>
        <div className="pr-nav-links">
          <a href="/" className="pr-nav-link">Home</a>
          {user ? (
            <a href="/dashboard" className="pr-nav-btn">Dashboard</a>
          ) : (
            <a href="/login" className="pr-nav-btn">Sign In</a>
          )}
        </div>
      </nav >

      <div className="pr-page">
        {/* HEADER */}
        <div className="pr-header">
          <p className="pr-header-eyebrow">Simple Pricing</p>
          <h1 className="pr-header-title">Pay for what you use</h1>
          <p className="pr-header-sub">Start free. Upgrade when you need more characters.</p>
        </div>

        {/* CURRENT PLAN BANNER */}
        {user && (
          <div className="pr-banner">
            You are on the <span>{currentPlan.toUpperCase()}</span> plan
          </div>
        )}

        {/* PLANS */}
        <div className="pr-plans-grid">
          {plans.map((plan) => {
            const isCurrent = user && plan.planKey === currentPlan;
            return (
              <div key={plan.name} className={`pr-plan-card ${plan.style === 'solid' ? 'featured' : ''} ${isCurrent ? 'current-plan' : ''}`}>
                {plan.badge && !isCurrent && <span className="pr-plan-badge">{plan.badge}</span>}
                {isCurrent && <span className="pr-current-badge">CURRENT</span>}
                <p className="pr-plan-name">{plan.name}</p>
                <p className="pr-plan-price">
                  {plan.price === 0
                    ? <span className="free-text">Free</span>
                    : <><span className="rupee">₹</span>{plan.price}</>
                  }
                </p>
                <p className="pr-plan-period">{plan.period}</p>
                <p className="pr-plan-chars">{plan.chars} chars</p>
                <div className="pr-plan-divider" />
                <ul className="pr-plan-features">
                  {plan.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                {isCurrent ? (
                  <button className="pr-plan-cta active-plan" disabled>Current Plan</button>
                ) : plan.ctaHref ? (
                  <a href={plan.ctaHref} className="pr-plan-cta outline">{plan.cta}</a>
                ) : (
                  <button
                    className={`pr-plan-cta ${plan.style === 'solid' ? 'solid' : 'outline'}`}
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
        <div className="pr-topup-section">
          <div className="pr-topup-header">
            <p className="pr-topup-eyebrow">Need More?</p>
            <h2 className="pr-topup-title">One-time Top-ups</h2>
            <p className="pr-topup-sub">Add characters to your account without changing your plan.</p>
          </div>
          <div className="pr-topup-grid">
            {topups.map(t => (
              <div key={t.topupKey} className="pr-topup-card">
                <div>
                  <p className="pr-topup-chars">{t.chars} <span>characters</span></p>
                  <p className="pr-topup-price">₹{t.price} one-time</p>
                </div>
                <button
                  className="pr-topup-btn"
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
        <div className="pr-faq-section">
          <h2 className="pr-faq-title">Common Questions</h2>
          <div className="pr-faq-grid">
            <div className="pr-faq-item">
              <p className="pr-faq-q">What counts as a character?</p>
              <p className="pr-faq-a">Every letter, number, space and punctuation mark counts as one character. 1,000 characters is roughly 150-200 words.</p>
            </div>
            <div className="pr-faq-item">
              <p className="pr-faq-q">Do unused characters roll over?</p>
              <p className="pr-faq-a">No, monthly plan characters reset each billing cycle. Top-up characters never expire.</p>
            </div>
            <div className="pr-faq-item">
              <p className="pr-faq-q">Can I save my voice clone?</p>
              <p className="pr-faq-a">Voice saving is available on Starter and above plans. Free users can upload a voice sample per session but it won't be saved.</p>
            </div>
            <div className="pr-faq-item">
              <p className="pr-faq-q">How do I cancel my subscription?</p>
              <p className="pr-faq-a">Email us at support@soviron.com and we'll cancel within 24 hours. No questions asked.</p>
            </div>
            <div className="pr-faq-item">
              <p className="pr-faq-q">What languages are supported?</p>
              <p className="pr-faq-a">Soviron supports Hindi, English, Marathi, Tamil, Telugu, Bengali, Kannada, Gujarati, Punjabi, Malayalam and more.</p>
            </div>
            <div className="pr-faq-item">
              <p className="pr-faq-q">Is there a refund policy?</p>
              <p className="pr-faq-a">We offer a full refund within 7 days of purchase if you're not satisfied. Contact support@soviron.com.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}