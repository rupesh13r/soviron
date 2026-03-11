'use client';

export default function ApiDocs() {
  return (
    <>
      <style>{`
        .apid-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 60px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.85); border-bottom: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(20px); }
        .apid-nav-logo { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #080808; text-decoration: none; }
        .apid-nav-links { display: flex; gap: 32px; align-items: center; }
        .apid-nav-link { font-size: 13px; font-weight: 500; color: #6B7280; text-decoration: none; transition: color 0.3s; }
        .apid-nav-link:hover { color: #080808; }
        .apid-nav-btn { font-size: 13px; font-weight: 600; color: #FFFFFF; background: #080808; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; text-decoration: none; transition: all 0.3s; }
        .apid-nav-btn:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .apid-layout { display: flex; padding-top: 80px; min-height: 100vh; background: #FFFFFF; }
        .apid-sidebar { width: 240px; flex-shrink: 0; position: sticky; top: 80px; height: calc(100vh - 80px); overflow-y: auto; padding: 40px 24px; border-right: 1px solid rgba(0,0,0,0.08); }
        .apid-sidebar-section { margin-bottom: 28px; }
        .apid-sidebar-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 10px; }
        .apid-sidebar-link { display: block; font-size: 13px; font-weight: 500; color: #6B7280; text-decoration: none; padding: 6px 0; transition: color 0.2s; }
        .apid-sidebar-link:hover { color: #080808; }
        .apid-main { flex: 1; padding: 48px 72px 80px; max-width: 860px; }
        .apid-section { margin-bottom: 64px; }
        .apid-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #6B7280; margin-bottom: 12px; }
        .apid-section-title { font-size: 36px; font-weight: 700; line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.02em; color: #080808; }
        .apid-section-sub { font-size: 15px; color: #6B7280; line-height: 1.8; margin-bottom: 28px; }
        .apid-divider { height: 1px; background: rgba(0,0,0,0.08); margin-bottom: 36px; }
        .apid-endpoint-box { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
        .apid-method-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #FFFFFF; background: #080808; padding: 4px 12px; border-radius: 4px; flex-shrink: 0; }
        .apid-endpoint-url { font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 13px; color: #080808; }
        .apid-code-block { background: #F5F5F5; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 24px 28px; font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 12px; color: #080808; line-height: 1.9; overflow-x: auto; white-space: pre; margin-bottom: 24px; position: relative; }
        .apid-code-label { position: absolute; top: 12px; right: 16px; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9CA3AF; }
        .apid-param-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .apid-param-table th { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9CA3AF; padding: 10px 16px; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .apid-param-table td { font-size: 13px; color: #6B7280; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.04); vertical-align: top; }
        .apid-param-table td:first-child { color: #080808; font-weight: 600; font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 12px; }
        .apid-required { color: #ef4444; font-size: 10px; font-weight: 600; margin-left: 4px; }
        .apid-optional { color: #9CA3AF; font-size: 10px; margin-left: 4px; }
        .apid-error-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .apid-error-table th { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9CA3AF; padding: 10px 16px; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .apid-error-table td { font-size: 13px; color: #6B7280; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .apid-error-table td:first-child { color: #ef4444; font-weight: 700; }
        .apid-inline-code { font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 12px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; padding: 2px 8px; color: #080808; }
        .apid-info-box { background: rgba(0,0,0,0.02); border-left: 3px solid #080808; border-radius: 0 10px 10px 0; padding: 16px 20px; margin-bottom: 24px; }
        .apid-info-box p { font-size: 14px; color: #6B7280; line-height: 1.7; }
        .apid-info-box a { color: #080808; text-decoration: underline; text-underline-offset: 3px; }
        .apid-sub-heading { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin-bottom: 12px; margin-top: 28px; }
        @media (max-width: 900px) { .apid-sidebar { display: none; } .apid-main { padding: 32px 24px 60px; } .apid-nav { padding: 16px 24px; } }
        @media (max-width: 640px) { 
          .apid-section-title { font-size: 28px; } 
          .apid-endpoint-url { font-size: 11px; word-break: break-all; }
          .apid-code-block { padding: 24px 16px; font-size: 11px; }
          .apid-param-table th, .apid-param-table td, .apid-error-table th, .apid-error-table td { padding: 10px 12px; font-size: 12px; }
        }
      `}</style>

      <nav className="apid-nav">
        <a href="/" className="apid-nav-logo">Soviron</a>
        <div className="apid-nav-links">
          <a href="/pricing" className="apid-nav-link">Pricing</a>
          <a href="/dashboard" className="apid-nav-btn">Dashboard</a>
        </div>
      </nav>

      <div className="apid-layout">
        <aside className="apid-sidebar">
          <div className="apid-sidebar-section">
            <p className="apid-sidebar-label">Getting Started</p>
            <a href="#overview" className="apid-sidebar-link">Overview</a>
            <a href="#authentication" className="apid-sidebar-link">Authentication</a>
            <a href="#quickstart" className="apid-sidebar-link">Quickstart</a>
          </div>
          <div className="apid-sidebar-section">
            <p className="apid-sidebar-label">Endpoints</p>
            <a href="#tts" className="apid-sidebar-link">POST /api/tts</a>
          </div>
          <div className="apid-sidebar-section">
            <p className="apid-sidebar-label">Reference</p>
            <a href="#parameters" className="apid-sidebar-link">Parameters</a>
            <a href="#response" className="apid-sidebar-link">Response</a>
            <a href="#errors" className="apid-sidebar-link">Error Codes</a>
          </div>
          <div className="apid-sidebar-section">
            <p className="apid-sidebar-label">Examples</p>
            <a href="#curl" className="apid-sidebar-link">cURL</a>
            <a href="#python" className="apid-sidebar-link">Python</a>
            <a href="#javascript" className="apid-sidebar-link">JavaScript</a>
            <a href="#nodejs" className="apid-sidebar-link">Node.js</a>
          </div>
        </aside>

        <main className="apid-main">

          <div className="apid-section" id="overview">
            <p className="apid-eyebrow">Soviron API v1.0</p>
            <h1 className="apid-section-title">Voice Cloning API</h1>
            <p className="apid-section-sub">Clone any voice and generate speech programmatically. Save a voice in your dashboard, then pass its ID in API requests to generate audio in that voice. Available on Creator, Pro, and Studio plans.</p>
            <div className="apid-info-box">
              <p>Base URL: <span className="apid-inline-code">https://soviron.vercel.app</span></p>
            </div>
            <div className="apid-divider" />
          </div>

          <div className="apid-section" id="authentication">
            <p className="apid-eyebrow">Authentication</p>
            <h2 className="apid-section-title">API Keys</h2>
            <p className="apid-section-sub">All requests must include your API key in the <span className="apid-inline-code">x-api-key</span> header. Generate your key from the dashboard under Developer → API Access.</p>
            <div className="apid-code-block">
              <span className="apid-code-label">HEADER</span>
{`x-api-key: sov_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
            </div>
            <div className="apid-info-box">
              <p>Keep your API key secret. Do not expose it in client-side code or public repositories. You can generate up to 3 active keys and revoke them anytime from your <a href="/dashboard">dashboard</a>.</p>
            </div>
            <div className="apid-divider" />
          </div>

          <div className="apid-section" id="quickstart">
            <p className="apid-eyebrow">Quickstart</p>
            <h2 className="apid-section-title">Your first request</h2>
            <p className="apid-section-sub">Two ways to use the API — with a saved voice clone, or without (uses default Soviron voice).</p>

            <p className="apid-sub-heading">Without voice cloning (default voice)</p>
            <div className="apid-code-block">
              <span className="apid-code-label">CURL</span>
{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Namaste, this is Soviron."}' \\
  --output speech.wav`}
            </div>

            <p className="apid-sub-heading">With voice cloning (your saved voice)</p>
            <div className="apid-code-block">
              <span className="apid-code-label">CURL</span>
{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Namaste, this is Soviron.",
    "voice_id": "YOUR_VOICE_UUID"
  }' \\
  --output speech.wav`}
            </div>
            <div className="apid-info-box">
              <p>Find your voice UUIDs in the dashboard under My Voices, or by calling <span className="apid-inline-code">GET /api/tts</span> which returns your account info.</p>
            </div>
            <div className="apid-divider" />
          </div>

          <div className="apid-section" id="tts">
            <p className="apid-eyebrow">Endpoint</p>
            <h2 className="apid-section-title">Generate Speech</h2>
            <p className="apid-section-sub">Convert text to speech using your saved voice clone or the default voice.</p>
            <div className="apid-endpoint-box">
              <span className="apid-method-badge">POST</span>
              <span className="apid-endpoint-url">/api/tts</span>
            </div>

            <div id="parameters">
              <p className="apid-sub-heading">Request Body (JSON)</p>
              <table className="apid-param-table">
                <thead>
                  <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>text <span className="apid-required">required</span></td>
                    <td>string</td>
                    <td>The text to convert to speech. Maximum 50,000 characters per request.</td>
                  </tr>
                  <tr>
                    <td>voice_id <span className="apid-optional">optional</span></td>
                    <td>string (UUID)</td>
                    <td>UUID of a saved voice from your account. If provided, output will clone that voice. If omitted, uses the default Soviron voice.</td>
                  </tr>
                  <tr>
                    <td>speed <span className="apid-optional">optional</span></td>
                    <td>number</td>
                    <td>Playback speed multiplier. Range: 0.5 – 2.0. Default: 1.0</td>
                  </tr>
                  <tr>
                    <td>pitch <span className="apid-optional">optional</span></td>
                    <td>number</td>
                    <td>Pitch adjustment in semitones. Range: -10 to +10. Default: 0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div id="response">
              <p className="apid-sub-heading">Response</p>
              <div className="apid-info-box">
                <p>Returns a <span className="apid-inline-code">audio/wav</span> binary on success (HTTP 200). Check response headers for quota info.</p>
              </div>
              <table className="apid-param-table">
                <thead>
                  <tr><th>Header</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>Content-Type</td><td>audio/wav</td></tr>
                  <tr><td>X-Chars-Used</td><td>Characters consumed by this request</td></tr>
                  <tr><td>X-Chars-Remaining</td><td>Characters remaining in your monthly quota</td></tr>
                </tbody>
              </table>
            </div>

            <div id="errors">
              <p className="apid-sub-heading">Error Codes</p>
              <table className="apid-error-table">
                <thead>
                  <tr><th>Status</th><th>Error</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>401</td><td>Missing API key</td><td>No x-api-key header provided</td></tr>
                  <tr><td>401</td><td>Invalid API key</td><td>Key not found or does not exist</td></tr>
                  <tr><td>401</td><td>API key is revoked</td><td>Key was revoked from dashboard</td></tr>
                  <tr><td>402</td><td>Insufficient characters</td><td>Not enough quota remaining for this request</td></tr>
                  <tr><td>403</td><td>Plan required</td><td>Your plan does not include API access</td></tr>
                  <tr><td>404</td><td>Voice not found</td><td>voice_id does not exist or does not belong to your account</td></tr>
                  <tr><td>400</td><td>text field required</td><td>Request body missing text field</td></tr>
                  <tr><td>400</td><td>Text exceeds limit</td><td>text exceeds 50,000 character limit</td></tr>
                  <tr><td>503</td><td>TTS generation failed</td><td>Backend VM is offline or unreachable</td></tr>
                </tbody>
              </table>
            </div>
            <div className="apid-divider" />
          </div>

          <div className="apid-section" id="curl">
            <p className="apid-eyebrow">Examples</p>
            <h2 className="apid-section-title">Code Examples</h2>

            <p className="apid-sub-heading">cURL</p>
            <div className="apid-code-block">
              <span className="apid-code-label">CURL</span>
{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello, welcome to Soviron.",
    "voice_id": "YOUR_VOICE_UUID",
    "speed": 1.0,
    "pitch": 0
  }' \\
  --output output.wav`}
            </div>

            <p className="apid-sub-heading" id="python">Python</p>
            <div className="apid-code-block">
              <span className="apid-code-label">PYTHON</span>
{`import requests

response = requests.post(
    "https://soviron.vercel.app/api/tts",
    headers={
        "x-api-key": "YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "text": "Hello, welcome to Soviron.",
        "voice_id": "YOUR_VOICE_UUID",  # optional
        "speed": 1.0,
        "pitch": 0
    }
)

if response.status_code == 200:
    with open("output.wav", "wb") as f:
        f.write(response.content)
    print("Saved to output.wav")
    print("Chars used:", response.headers.get("X-Chars-Used"))
    print("Chars remaining:", response.headers.get("X-Chars-Remaining"))
else:
    print("Error:", response.json())`}
            </div>

            <p className="apid-sub-heading" id="javascript">JavaScript (Browser)</p>
            <div className="apid-code-block">
              <span className="apid-code-label">JAVASCRIPT</span>
{`const response = await fetch("https://soviron.vercel.app/api/tts", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Hello, welcome to Soviron.",
    voice_id: "YOUR_VOICE_UUID", // optional
    speed: 1.0,
    pitch: 0
  })
});

if (response.ok) {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.wav";
  a.click();
} else {
  const error = await response.json();
  console.error("Error:", error);
}`}
            </div>

            <p className="apid-sub-heading" id="nodejs">Node.js</p>
            <div className="apid-code-block">
              <span className="apid-code-label">NODE.JS</span>
{`const fs = require("fs");

const response = await fetch("https://soviron.vercel.app/api/tts", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Hello, welcome to Soviron.",
    voice_id: "YOUR_VOICE_UUID", // optional
    speed: 1.0,
    pitch: 0
  })
});

if (response.ok) {
  const buffer = await response.arrayBuffer();
  fs.writeFileSync("output.wav", Buffer.from(buffer));
  console.log("Saved to output.wav");
  console.log("Chars used:", response.headers.get("X-Chars-Used"));
} else {
  const error = await response.json();
  console.error("Error:", error);
}`}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}