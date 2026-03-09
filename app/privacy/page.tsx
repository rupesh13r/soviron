export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #080808; color: #F5F0E8; font-family: 'Tenor Sans', sans-serif; }
        .nav { padding: 24px 80px; border-bottom: 1px solid rgba(201,168,76,0.08); }
        .nav a { font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: 0.3em; color: #C9A84C; text-decoration: none; }
        .container { max-width: 760px; margin: 0 auto; padding: 80px 40px; }
        .eyebrow { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.3em; color: #7A6330; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300; margin-bottom: 8px; }
        .updated { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(245,240,232,0.3); letter-spacing: 0.1em; margin-bottom: 48px; }
        h2 { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: #C9A84C; text-transform: uppercase; margin: 40px 0 16px; }
        p { font-size: 15px; line-height: 1.8; color: rgba(245,240,232,0.7); margin-bottom: 16px; }
        ul { padding-left: 24px; margin-bottom: 16px; }
        li { font-size: 15px; line-height: 1.8; color: rgba(245,240,232,0.7); margin-bottom: 8px; }
        a { color: #C9A84C; }
        .footer { margin-top: 80px; padding-top: 40px; border-top: 1px solid rgba(201,168,76,0.08); font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(245,240,232,0.2); letter-spacing: 0.1em; }
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