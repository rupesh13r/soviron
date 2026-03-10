export default function TermsPage() {
  return (
    <>
      <style>{`
        .terms-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.85); border-bottom: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(20px); }
        .terms-nav a { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #080808; text-decoration: none; }
        .terms-page { padding: 120px 60px 80px; max-width: 720px; margin: 0 auto; background: #FFFFFF; min-height: 100vh; }
        .terms-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #6B7280; margin-bottom: 12px; }
        .terms-title { font-size: 42px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.03em; color: #080808; line-height: 1.1; }
        .terms-updated { font-size: 13px; color: #9CA3AF; margin-bottom: 40px; }
        .terms-divider { height: 1px; background: rgba(0,0,0,0.08); margin-bottom: 36px; }
        .terms-page h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; margin-top: 36px; color: #6B7280; letter-spacing: -0.01em; }
        .terms-page h2:first-of-type { margin-top: 0; }
        .terms-page p { font-size: 15px; color: #4B5563; line-height: 1.8; margin-bottom: 16px; }
        .terms-page ul { margin-bottom: 20px; padding-left: 20px; }
        .terms-page li { font-size: 15px; color: #4B5563; line-height: 1.8; margin-bottom: 6px; }
        .terms-page a { color: #080808; text-decoration: underline; text-underline-offset: 3px; }
        .terms-page a:hover { color: #6B7280; }
        .terms-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.08); font-size: 13px; color: #9CA3AF; }
        @media (max-width: 640px) { .terms-page { padding: 100px 24px 60px; } .terms-nav { padding: 16px 24px; } .terms-title { font-size: 32px; } }
      `}</style>
      <nav className="terms-nav"><a href="/">SOVIRON</a></nav>
      <div className="terms-page">
        <p className="terms-eyebrow">Legal</p>
        <h1 className="terms-title">Terms of Service</h1>
        <p className="terms-updated">Last updated: March 10, 2026</p>
        <div className="terms-divider"></div>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Soviron (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

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
        <p>Soviron is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the Service.</p>

        <h2>8. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

        <h2>9. Contact</h2>
        <p>For questions about these terms, email us at <a href="mailto:support@soviron.tech">support@soviron.tech</a>.</p>

        <p className="terms-footer">© 2026 Soviron. All rights reserved.</p>
      </div>
    </>
  );
}