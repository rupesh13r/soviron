'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setDropdownOpen(false);
  };

  const getInitials = (email: string) => email?.slice(0, 2).toUpperCase() || '??';
  const getAvatarUrl = () => user?.user_metadata?.avatar_url || null;
  const charsUsed = profile?.chars_used || 0;
  const charsLimit = profile?.chars_limit || 5000;
  const charsRemaining = Math.max(charsLimit - charsUsed, 0);
  const charsPercent = Math.min((charsUsed / charsLimit) * 100, 100);

  const plans = [
    { name: 'Free', price: 0, chars: '5,000', period: '/ forever', features: ['5,000 characters per month', 'Upload voice sample each time', 'WAV download included', 'Standard speed'], cta: 'Get Started', ctaHref: '/signup', planKey: null, style: 'outline' },
    { name: 'Starter', price: 79, chars: '50,000', period: '/ month', features: ['50,000 characters per month', 'Upload voice sample each time', 'WAV download included', 'Standard speed'], cta: 'Get Starter', ctaHref: null, planKey: 'starter', style: 'outline' },
    { name: 'Standard', price: 149, chars: '100,000', period: '/ month', features: ['100,000 characters per month', 'Save up to 5 voice profiles', 'WAV download included', 'Priority speed'], cta: 'Get Standard', ctaHref: null, planKey: 'standard', style: 'solid', badge: 'POPULAR' },
    { name: 'Creator', price: 349, chars: '300,000', period: '/ month', features: ['300,000 characters per month', 'Save up to 5 voice profiles', 'Priority speed', 'API access'], cta: 'Get Creator', ctaHref: null, planKey: 'creator', style: 'outline' },
    { name: 'Pro', price: 699, chars: '700,000', period: '/ month', features: ['700,000 characters per month', 'Save up to 5 voice profiles', 'Priority speed', 'API access'], cta: 'Get Pro', ctaHref: null, planKey: 'pro', style: 'outline' },
    { name: 'Studio', price: 1299, chars: '1,500,000', period: '/ month', features: ['1,500,000 characters per month', 'Save up to 5 voice profiles', 'Priority speed', 'API access', 'Dedicated support'], cta: 'Get Studio', ctaHref: null, planKey: 'studio', style: 'outline' },
  ];

  const topups = [
    { chars: '50k chars', price: 79, topupKey: '50k' },
    { chars: '200k chars', price: 249, topupKey: '200k' },
    { chars: '1M chars', price: 799, topupKey: '1m' },
  ];

  const handlePlanClick = async (planKey: string | null, ctaHref: string | null) => {
    if (!planKey) { window.location.href = ctaHref!; return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/signup?plan=${planKey}`; return; }
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
      prefill: { email: user.email },
      theme: { color: '#C9A84C' },
    };
    new window.Razorpay(options).open();
  };

  const handleTopupClick = async (topupKey: string, price: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
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
        if (result.success) { alert('Credits added successfully!'); window.location.href = '/dashboard'; }
        else alert('Payment verification failed. Contact support.');
      },
      prefill: { email: user.email },
      theme: { color: '#C9A84C' },
    };
    new window.Razorpay(options).open();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --black: #080808; --gold: #C9A84C; --gold-light: #E8C97A;
          --gold-dim: #7A6330; --purple: #6B3FA0; --white: #F5F0E8; --grey: #2A2A2A;
        }
        body { background: var(--black); color: var(--white); font-family: 'Tenor Sans', sans-serif; overflow-x: hidden; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 28px 60px; background: linear-gradient(to bottom, rgba(8,8,8,0.95), transparent); }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 300; letter-spacing: 0.3em; color: var(--gold); text-transform: uppercase; }
        .nav-links { display: flex; gap: 48px; list-style: none; }
        .nav-links a { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: var(--white); text-decoration: none; opacity: 0.6; text-transform: uppercase; transition: opacity 0.3s, color 0.3s; }
        .nav-links a:hover { opacity: 1; color: var(--gold); }
        .nav-cta { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; padding: 12px 28px; border: 1px solid var(--gold-dim); color: var(--gold); background: transparent; cursor: pointer; transition: all 0.3s; text-decoration: none; }
        .nav-cta:hover { background: var(--gold); color: var(--black); border-color: var(--gold); }

        .nav-avatar-wrap { position: relative; }
        .nav-avatar { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--gold-dim); background: rgba(201,168,76,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s; flex-shrink: 0; }
        .nav-avatar:hover { border-color: var(--gold); box-shadow: 0 0 16px rgba(201,168,76,0.2); }
        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .nav-avatar-initials { font-family: 'Space Mono', monospace; font-size: 13px; color: var(--gold); letter-spacing: 0.05em; font-weight: 700; }
        .avatar-dropdown { position: absolute; top: 56px; right: 0; width: 290px; background: #0D0D0D; border: 1px solid rgba(201,168,76,0.12); z-index: 200; animation: dropIn 0.18s ease; }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .dd-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(201,168,76,0.07); display: flex; align-items: center; gap: 14px; }
        .dd-avatar-sm { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--gold-dim); background: rgba(201,168,76,0.08); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .dd-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .dd-avatar-sm span { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--gold); font-weight: 700; }
        .dd-user-info { min-width: 0; }
        .dd-email { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.05em; color: rgba(245,240,232,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .dd-plan-badge { display: inline-block; font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); border: 1px solid var(--gold-dim); padding: 2px 7px; }
        .dd-quota { padding: 16px 24px; border-bottom: 1px solid rgba(201,168,76,0.07); }
        .dd-quota-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .dd-quota-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,240,232,0.25); }
        .dd-quota-count { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; color: var(--white); }
        .dd-quota-sub { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.1em; color: rgba(245,240,232,0.2); margin-bottom: 10px; }
        .dd-bar-bg { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; }
        .dd-bar-fill { height: 2px; background: linear-gradient(to right, var(--gold-dim), var(--gold)); border-radius: 1px; transition: width 0.6s ease; }
        .dd-links { padding: 6px 0; border-bottom: 1px solid rgba(201,168,76,0.07); }
        .dd-link { display: flex; align-items: center; gap: 10px; padding: 10px 24px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,240,232,0.4); text-decoration: none; cursor: pointer; transition: all 0.2s; background: none; border: none; width: 100%; text-align: left; }
        .dd-link:hover { color: var(--white); background: rgba(255,255,255,0.02); }
        .dd-link-icon { font-size: 14px; }
        .dd-footer { padding: 6px 0; }
        .dd-signout { display: flex; align-items: center; gap: 10px; padding: 10px 24px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,240,232,0.3); cursor: pointer; transition: all 0.2s; background: none; border: none; width: 100%; text-align: left; }
        .dd-signout:hover { color: #e05555; background: rgba(224,85,85,0.04); }

        .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 0 60px; position: relative; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 60% 60% at 70% 50%, rgba(107,63,160,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(201,168,76,0.06) 0%, transparent 60%); }
        .hero-line { pointer-events: none; position: absolute; top: 0; right: 160px; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, var(--gold-dim), transparent); opacity: 0.3; }
        .hero-tag { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.4em; color: var(--gold); text-transform: uppercase; margin-bottom: 32px; opacity: 0.8; }
        .hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(72px, 10vw, 140px); font-weight: 300; line-height: 0.92; letter-spacing: -0.02em; color: var(--white); margin-bottom: 8px; }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-title .outline { -webkit-text-stroke: 1px rgba(245,240,232,0.3); color: transparent; }
        .hero-sub { font-size: 16px; color: rgba(245,240,232,0.45); max-width: 420px; line-height: 1.7; margin-top: 40px; margin-bottom: 56px; letter-spacing: 0.03em; }
        .hero-actions { display: flex; gap: 20px; align-items: center; }
        .btn-primary { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; padding: 18px 48px; background: var(--gold); color: var(--black); border: none; cursor: pointer; text-decoration: none; transition: all 0.3s; display: inline-block; }
        .btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); }
        .btn-ghost { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; padding: 18px 48px; background: transparent; color: var(--white); border: 1px solid rgba(245,240,232,0.2); cursor: pointer; text-decoration: none; transition: all 0.3s; display: inline-block; }
        .btn-ghost:hover { border-color: var(--gold-dim); color: var(--gold); }
        .hero-scroll { position: absolute; bottom: 48px; left: 60px; display: flex; align-items: center; gap: 16px; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(245,240,232,0.3); }
        .scroll-line { width: 48px; height: 1px; background: var(--gold-dim); animation: scrollPulse 2s infinite; }
        @keyframes scrollPulse { 0%, 100% { opacity: 0.3; width: 48px; } 50% { opacity: 1; width: 72px; } }
        .section-divider { height: 1px; margin: 0 60px; background: linear-gradient(to right, transparent, var(--gold-dim), transparent); opacity: 0.3; }
        .demo-section { padding: 140px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .demo-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.4em; color: var(--gold); text-transform: uppercase; margin-bottom: 24px; }
        .demo-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 5vw, 64px); font-weight: 300; line-height: 1.1; margin-bottom: 24px; }
        .demo-title em { font-style: italic; color: var(--gold); }
        .demo-desc { font-size: 15px; color: rgba(245,240,232,0.5); line-height: 1.8; letter-spacing: 0.02em; }
        .demo-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,168,76,0.15); padding: 48px; position: relative; }
        .demo-card::before { content: ''; position: absolute; top: -1px; left: 40px; width: 60px; height: 2px; background: var(--gold); }
        .demo-textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.1); padding: 20px; color: var(--white); font-family: 'Tenor Sans', sans-serif; font-size: 14px; line-height: 1.7; resize: none; height: 120px; outline: none; transition: border-color 0.3s; letter-spacing: 0.02em; }
        .demo-textarea:focus { border-color: rgba(201,168,76,0.4); }
        .demo-textarea::placeholder { color: rgba(245,240,232,0.2); }
        .demo-btn { width: 100%; margin-top: 16px; padding: 16px; background: var(--gold); color: var(--black); border: none; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
        .demo-btn:hover { background: var(--gold-light); }
        .demo-btn:disabled { background: var(--grey); color: rgba(245,240,232,0.3); cursor: not-allowed; }
        .features { padding: 140px 60px; }
        .section-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.4em; color: var(--gold); text-transform: uppercase; margin-bottom: 16px; }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 5vw, 64px); font-weight: 300; line-height: 1.1; }
        .section-title em { font-style: italic; color: var(--gold); }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 80px; background: rgba(201,168,76,0.1); }
        .feature-card { background: var(--black); padding: 48px 40px; position: relative; transition: background 0.3s; }
        .feature-card:hover { background: rgba(107,63,160,0.06); }
        .feature-num { font-family: 'Cormorant Garamond', serif; font-size: 72px; font-weight: 300; color: rgba(201,168,76,0.08); position: absolute; top: 24px; right: 32px; line-height: 1; }
        .feature-icon { font-size: 28px; margin-bottom: 24px; display: block; }
        .feature-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; margin-bottom: 12px; color: var(--white); }
        .feature-desc { font-size: 13px; color: rgba(245,240,232,0.4); line-height: 1.8; letter-spacing: 0.02em; }
        .pricing { padding: 140px 60px; }
        .pricing-header { text-align: center; margin-bottom: 80px; }
        .plans-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1px; background: rgba(201,168,76,0.1); margin-bottom: 2px; }
        .plan-card { background: var(--black); padding: 40px 28px; position: relative; transition: background 0.3s; }
        .plan-card:hover { background: rgba(107,63,160,0.06); }
        .plan-card.featured { background: rgba(107,63,160,0.1); }
        .plan-badge { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.25em; color: var(--gold); border: 1px solid var(--gold-dim); padding: 3px 8px; white-space: nowrap; }
        .plan-name { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(245,240,232,0.4); margin-bottom: 20px; margin-top: 8px; }
        .plan-card.featured .plan-name { margin-top: 28px; }
        .plan-price { font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 300; line-height: 1; color: var(--white); margin-bottom: 2px; }
        .plan-price .rupee { color: var(--gold); font-size: 24px; vertical-align: super; }
        .plan-price .free-text { font-size: 36px; }
        .plan-period { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: rgba(245,240,232,0.25); margin-bottom: 16px; }
        .plan-chars { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: var(--gold-dim); margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(201,168,76,0.1); }
        .plan-features-list { list-style: none; margin-bottom: 32px; }
        .plan-features-list li { font-size: 11px; color: rgba(245,240,232,0.45); padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.03); letter-spacing: 0.01em; display: flex; gap: 8px; line-height: 1.4; }
        .plan-features-list li::before { content: '—'; color: var(--gold-dim); flex-shrink: 0; }
        .plan-btn { width: 100%; padding: 12px 8px; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; text-decoration: none; display: block; text-align: center; }
        .plan-btn.outline { background: transparent; color: var(--white); border: 1px solid rgba(245,240,232,0.15); }
        .plan-btn.outline:hover { border-color: var(--gold-dim); color: var(--gold); }
        .plan-btn.solid { background: var(--gold); color: var(--black); border: none; }
        .plan-btn.solid:hover { background: var(--gold-light); }
        .topup-section { margin-top: 60px; padding: 48px; background: rgba(255,255,255,0.02); border: 1px solid rgba(201,168,76,0.12); position: relative; }
        .topup-section::before { content: ''; position: absolute; top: -1px; left: 40px; width: 80px; height: 2px; background: var(--gold); }
        .topup-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .topup-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; }
        .topup-title em { font-style: italic; color: var(--gold); }
        .topup-desc { font-size: 13px; color: rgba(245,240,232,0.4); max-width: 320px; line-height: 1.7; letter-spacing: 0.02em; }
        .topup-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(201,168,76,0.1); }
        .topup-card { background: var(--black); padding: 32px 28px; display: flex; justify-content: space-between; align-items: center; transition: background 0.3s; cursor: pointer; }
        .topup-card:hover { background: rgba(107,63,160,0.06); }
        .topup-chars { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: var(--white); }
        .topup-price { font-family: 'Space Mono', monospace; font-size: 18px; color: var(--gold); }
        .topup-btn { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; padding: 8px 16px; background: transparent; border: 1px solid rgba(201,168,76,0.25); color: var(--gold-dim); cursor: pointer; transition: all 0.3s; margin-top: 8px; }
        .topup-card:hover .topup-btn { border-color: var(--gold); color: var(--gold); }
        footer { padding: 60px; border-top: 1px solid rgba(201,168,76,0.1); display: flex; justify-content: space-between; align-items: center; margin-top: 140px; }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; letter-spacing: 0.3em; color: var(--gold); text-transform: uppercase; }
        .footer-copy { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.15em; color: rgba(245,240,232,0.2); }
        @media (max-width: 1024px) { .plans-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) {
          nav { padding: 20px 24px; } .nav-links { display: none; } .hero { padding: 0 24px; }
          .section-divider { margin: 0 24px; } .demo-section { grid-template-columns: 1fr; padding: 80px 24px; }
          .features { padding: 80px 24px; } .features-grid { grid-template-columns: 1fr; }
          .pricing { padding: 80px 24px; } .plans-grid { grid-template-columns: 1fr 1fr; }
          .topup-grid { grid-template-columns: 1fr; } .topup-header { flex-direction: column; gap: 16px; }
          footer { padding: 40px 24px; flex-direction: column; gap: 16px; text-align: center; }
          .avatar-dropdown { width: 260px; }
        }
      `}</style>

      <nav>
        <div className="nav-logo">Soviron</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          {!user && <li><a href="/login">Login</a></li>}
        </ul>

        {user ? (
          <div className="nav-avatar-wrap" ref={dropdownRef}>
            <div className="nav-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {getAvatarUrl()
                ? <img src={getAvatarUrl()} alt="avatar" />
                : <span className="nav-avatar-initials">{getInitials(user.email)}</span>
              }
            </div>
            {dropdownOpen && (
              <div className="avatar-dropdown">
                <div className="dd-header">
                  <div className="dd-avatar-sm">
                    {getAvatarUrl()
                      ? <img src={getAvatarUrl()} alt="avatar" />
                      : <span>{getInitials(user.email)}</span>
                    }
                  </div>
                  <div className="dd-user-info">
                    <p className="dd-email">{user.email}</p>
                    <span className="dd-plan-badge">{profile?.plan || 'free'} plan</span>
                  </div>
                </div>
                <div className="dd-quota">
                  <div className="dd-quota-top">
                    <span className="dd-quota-label">Chars remaining</span>
                    <span className="dd-quota-count">{charsRemaining.toLocaleString()}</span>
                  </div>
                  <p className="dd-quota-sub">of {charsLimit.toLocaleString()} total this month</p>
                  <div className="dd-bar-bg">
                    <div className="dd-bar-fill" style={{ width: `${100 - charsPercent}%` }} />
                  </div>
                </div>
                <div className="dd-links">
                  <a href="/dashboard" className="dd-link"><span className="dd-link-icon">🎙</span> Dashboard</a>
                  <a href="/dashboard/voices" className="dd-link"><span className="dd-link-icon">🔊</span> My Voices</a>
                  <a href="#pricing" className="dd-link" onClick={() => setDropdownOpen(false)}><span className="dd-link-icon">⭐</span> Upgrade Plan</a>
                </div>
                <div className="dd-footer">
                  <button className="dd-signout" onClick={handleLogout}><span className="dd-link-icon">↩</span> Sign Out</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <a href="/signup" className="nav-cta">Start Free</a>
        )}
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-line" />
        <p className="hero-tag">AI Voice Cloning — Powered by Soviron</p>
        <h1 className="hero-title">
          Your voice,<br />
          <em>anywhere</em><br />
          <span className="outline">you need it.</span>
        </h1>
        <p className="hero-sub">
          Clone any voice with a short audio sample. Generate natural, expressive speech in seconds. Professional quality, at a fraction of the cost.
        </p>
        <div className="hero-actions">
          <a href={user ? '/dashboard' : '/signup'} className="btn-primary">
            {user ? 'Go to Dashboard' : 'Clone Your Voice'}
          </a>
          <a href="#demo" className="btn-ghost">Hear a Demo</a>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
          Scroll to explore
        </div>
      </section>

      <div className="section-divider" />

      <section className="demo-section" id="demo">
        <div>
          <p className="demo-label">Try it now</p>
          <h2 className="demo-title">Hear the <em>difference</em> yourself</h2>
          <p className="demo-desc">
            Type any text below and generate speech instantly. No signup needed for this demo. Experience the quality Soviron delivers before you commit.
          </p>
        </div>
        <DemoWidget />
      </section>

      <div className="section-divider" />

      <section className="features" id="features">
        <div>
          <p className="section-label">Why Soviron</p>
          <h2 className="section-title">Built for <em>creators</em></h2>
        </div>
        <div className="features-grid">
          {[
            { icon: '🎙', title: 'Voice Cloning', desc: 'Upload a 10–30 second sample and clone any voice with remarkable accuracy. Paid users save up to 5 voice profiles.', num: '01' },
            { icon: '⚡', title: 'Fast Generation', desc: 'Results in under 15 seconds. No queues, no waiting. Scale from 5K to 1.5M characters per month.', num: '02' },
            { icon: '🔒', title: 'Your Voice, Private', desc: 'Voice samples are encrypted and never shared. Stored securely, deleted on request. Full control, always.', num: '03' },
            { icon: '🌐', title: 'Any Language', desc: 'Soviron handles multiple languages naturally. Generate content for global audiences without re-recording.', num: '04' },
            { icon: '📥', title: 'Download as WAV', desc: 'Every generation is a high-quality WAV file. Ready for podcasts, videos, voiceovers, or any use case.', num: '05' },
            { icon: '🤖', title: 'API Access', desc: 'Integrate Soviron into your workflow. API access available on Creator, Pro, and Studio plans.', num: '06' },
          ].map((f) => (
            <div className="feature-card" key={f.num}>
              <span className="feature-num">{f.num}</span>
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      <section className="pricing" id="pricing">
        <div className="pricing-header">
          <p className="section-label">Pricing</p>
          <h2 className="section-title">Start free, <em>scale</em> when ready</h2>
        </div>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div className={`plan-card ${plan.badge ? 'featured' : ''}`} key={plan.name}>
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <p className="plan-name">{plan.name}</p>
              <div className="plan-price">
                {plan.price === 0
                  ? <span className="free-text">Free</span>
                  : <><span className="rupee">₹</span>{plan.price}</>
                }
              </div>
              <p className="plan-period">{plan.period}</p>
              <p className="plan-chars">{plan.chars} chars / mo</p>
              <ul className="plan-features-list">
                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <button className={`plan-btn ${plan.style}`} onClick={() => handlePlanClick(plan.planKey, plan.ctaHref)}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="topup-section">
          <div className="topup-header">
            <div>
              <p className="section-label">Top-up Credits</p>
              <h3 className="topup-title">Need more? <em>Top up anytime.</em></h3>
            </div>
            <p className="topup-desc">Heavy users can purchase additional character credits on any paid plan. Credits never expire.</p>
          </div>
          <div className="topup-grid">
            {topups.map((t) => (
              <div className="topup-card" key={t.chars} onClick={() => handleTopupClick(t.topupKey, t.price)}>
                <div>
                  <div className="topup-chars">{t.chars}</div>
                  <button className="topup-btn">Add Credits</button>
                </div>
                <div className="topup-price">₹{t.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">Soviron</div>
        <p className="footer-copy">© 2026 Soviron. All rights reserved.</p>
      </footer>
    </>
  );
}

function DemoWidget() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch('http://35.194.128.213:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch {
      setError('VM may be offline. Start the GCP VM to enable generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-card">
      <textarea
        className="demo-textarea"
        placeholder="Type something to hear it spoken..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'rgba(245,240,232,0.25)', letterSpacing: '0.15em' }}>
          {text.length}/500
        </span>
      </div>
      <button className="demo-btn" onClick={handleGenerate} disabled={loading || !text.trim()}>
        {loading ? 'Generating...' : 'Generate Speech →'}
      </button>
      {error && (
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#C0392B', marginTop: 12, letterSpacing: '0.05em' }}>
          {error}
        </p>
      )}
      {audioUrl && (
        <div style={{ marginTop: 20, padding: 16, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.7)', marginBottom: 12, textTransform: 'uppercase' }}>
            Your audio
          </p>
          <audio controls style={{ width: '100%' }} src={audioUrl} />
        </div>
      )}
    </div>
  );
}