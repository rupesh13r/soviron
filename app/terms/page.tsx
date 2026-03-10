export default function TermsPage() {
  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --bg: #0a0b14; --accent: #6366f1; --accent-light: #818cf8; --cyan: #06b6d4; --text: #e2e8f0; --text-muted: #94a3b8; --text-dim: #64748b; --border-s: rgba(255,255,255,0.06); --r: 12px; --r-sm: 8px; }
        html, body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px; display: flex; align-items: center; justify-content: space-between; background: rgba(10,11,20,0.85); border-bottom: 1px solid var(--border-s); backdrop-filter: blur(20px); }
        .nav-logo { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); text-decoration: none; }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-link { font-size: 13px; font-weight: 500; color: var(--text-muted); text-decoration: none; transition: color 0.3s; }
        .nav-link:hover { color: var(--text); }
        .nav-btn { font-size: 13px; font-weight: 600; color: #fff; background: var(--accent); border: none; padding: 10px 24px; border-radius: var(--r-sm); cursor: pointer; text-decoration: none; transition: all 0.3s; }
        .nav-btn:hover { background: var(--accent-light); box-shadow: 0 4px 20px rgba(99,102,241,0.35); }
        .page { padding: 120px 60px 80px; max-width: 800px; margin: 0 auto; }
        .page-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent-light); margin-bottom: 12px; }
        .page-title { font-size: 40px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em; }
        .page-title em { font-style: normal; background: linear-gradient(135deg, var(--accent), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .updated { font-size: 13px; color: var(--text-dim); margin-bottom: 40px; }
        .divider { height: 1px; background: var(--border-s); margin-bottom: 36px; }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: var(--text); }
        .body-text { font-size: 15px; color: var(--text-muted); line-height: 1.8; margin-bottom: 28px; }
        @media (max-width: 640px) { .page { padding: 100px 24px 60px; } .nav { padding: 16px 24px; } .page-title { font-size: 32px; } }
      `}</style>
      <nav className="nav"><a href="/">SOVIRON</a></nav>
      <div className="container">
        <p className="eyebrow">Legal</p>
        <h1>Terms of Service</h1>
        <p className="updated">Last updated: March 10, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Soviron ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

        <h2>2. Description of Service</h2>
        <p>Soviron provides AI-powered text-to-speech and voice cloning services. Users can generate audio from text and clone voices using uploaded audio samples.</p>

        <h2>3. User Accounts</h2>
        <p>You must sign in with a valid Google account to use the Service. You are responsible for maintaining the security of your account and all activity that occurs under it.</p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Generate audio impersonating real individuals without their consent</li>
          <li>Create misleading, fraudulent, or harmful content</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Attempt to reverse engineer or abuse the Service</li>
          <li>Resell or redistribute the Service without authorization</li>
        </ul>

        <h2>5. Credits and Payments</h2>
        <p>Free users receive 5,000 characters per month. Paid plans and top-ups are available. All payments are processed securely via Razorpay. Refunds are handled on a case-by-case basis — contact support@soviron.tech.</p>

        <h2>6. Intellectual Property</h2>
        <p>Audio generated using Soviron belongs to you. However, you are responsible for ensuring you have the rights to any voice samples you upload for cloning.</p>

        <h2>7. Limitation of Liability</h2>
        <p>Soviron is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service.</p>

        <h2>8. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

        <h2>9. Contact</h2>
        <p>For questions about these terms, email us at <a href="mailto:support@soviron.tech">support@soviron.tech</a>.</p>

        <p className="footer">© 2026 Soviron. All rights reserved.</p>
      </div>
    </>
  );
}