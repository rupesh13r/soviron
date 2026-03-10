export default function PrivacyPage() {
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
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: March 10, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>When you use Soviron, we collect:</p>
        <ul>
          <li>Your Google account information (name, email, profile picture) when you sign in</li>
          <li>Text you submit for speech generation</li>
          <li>Voice samples you upload for voice cloning</li>
          <li>Usage data including characters generated and API calls made</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve the Service</li>
          <li>Track your usage and enforce plan limits</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send transactional emails (account updates, payment receipts)</li>
        </ul>

        <h2>3. Voice Data</h2>
        <p>Voice samples you upload are stored securely and used only to generate audio for your account. We do not share, sell, or use your voice data to train AI models without your explicit consent.</p>

        <h2>4. Data Storage</h2>
        <p>Your data is stored securely using Supabase (PostgreSQL database and file storage). We implement industry-standard security measures to protect your data.</p>

        <h2>5. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Google OAuth</strong> — for authentication</li>
          <li><strong>Razorpay</strong> — for payment processing</li>
          <li><strong>Supabase</strong> — for database and file storage</li>
          <li><strong>Vercel</strong> — for hosting</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>We retain your data as long as your account is active. You can request deletion of your account and all associated data by emailing <a href="mailto:support@soviron.tech">support@soviron.tech</a>.</p>

        <h2>7. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data at any time. Contact us at <a href="mailto:support@soviron.tech">support@soviron.tech</a> to exercise these rights.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We will notify you of significant changes via email or a notice on our website.</p>

        <h2>9. Contact</h2>
        <p>For privacy-related questions, email us at <a href="mailto:support@soviron.tech">support@soviron.tech</a>.</p>

        <p className="footer">© 2026 Soviron. All rights reserved.</p>
      </div>
    </>
  );
}