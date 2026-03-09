export default function TermsPage() {
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