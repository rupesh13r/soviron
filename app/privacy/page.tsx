export default function PrivacyPage() {
  return (
    <>
      <style>{`
        .priv-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.85); border-bottom: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(20px); }
        .priv-nav a { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #080808; text-decoration: none; }
        .priv-page { padding: 120px 60px 80px; max-width: 720px; margin: 0 auto; background: #FFFFFF; min-height: 100vh; }
        .priv-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #6B7280; margin-bottom: 12px; }
        .priv-title { font-size: 42px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.03em; color: #080808; line-height: 1.1; }
        .priv-updated { font-size: 13px; color: #9CA3AF; margin-bottom: 40px; }
        .priv-divider { height: 1px; background: rgba(0,0,0,0.08); margin-bottom: 36px; }
        .priv-page h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; margin-top: 36px; color: #6B7280; letter-spacing: -0.01em; }
        .priv-page h2:first-of-type { margin-top: 0; }
        .priv-page p { font-size: 15px; color: #4B5563; line-height: 1.8; margin-bottom: 16px; }
        .priv-page ul { margin-bottom: 20px; padding-left: 20px; }
        .priv-page li { font-size: 15px; color: #4B5563; line-height: 1.8; margin-bottom: 6px; }
        .priv-page li strong { color: #080808; }
        .priv-page a { color: #080808; text-decoration: underline; text-underline-offset: 3px; }
        .priv-page a:hover { color: #6B7280; }
        .priv-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.08); font-size: 13px; color: #9CA3AF; }
        @media (max-width: 640px) { .priv-page { padding: 100px 24px 60px; } .priv-nav { padding: 16px 24px; } .priv-title { font-size: 32px; } }
      `}</style>
      <nav className="priv-nav"><a href="/">SOVIRON</a></nav>
      <div className="priv-page">
        <p className="priv-eyebrow">Legal</p>
        <h1 className="priv-title">Privacy Policy</h1>
        <p className="priv-updated">Last updated: March 10, 2026</p>
        <div className="priv-divider"></div>

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

        <p className="priv-footer">© 2026 Soviron. All rights reserved.</p>
      </div>
    </>
  );
}