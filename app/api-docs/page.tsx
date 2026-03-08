'use client';

export default function ApiDocs() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --black: #080808; --gold: #C9A84C; --gold-light: #E8C97A; --gold-dim: #7A6330; --white: #F5F0E8; --border: rgba(201,168,76,0.1); }
        html, body { background: var(--black); color: var(--white); font-family: 'Tenor Sans', sans-serif; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 24px 60px; display: flex; align-items: center; justify-content: space-between; background: rgba(8,8,8,0.92); border-bottom: 1px solid var(--border); backdrop-filter: blur(12px); }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; letter-spacing: 0.35em; color: var(--gold); text-transform: uppercase; text-decoration: none; }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-link { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,240,232,0.4); text-decoration: none; transition: color 0.3s; }
        .nav-link:hover { color: var(--white); }
        .nav-btn { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--black); background: var(--gold); border: none; padding: 10px 20px; cursor: pointer; text-decoration: none; transition: background 0.3s; }
        .nav-btn:hover { background: var(--gold-light); }
        .layout { display: flex; padding-top: 80px; min-height: 100vh; }
        .sidebar { width: 240px; flex-shrink: 0; position: sticky; top: 80px; height: calc(100vh - 80px); overflow-y: auto; padding: 40px 24px; border-right: 1px solid var(--border); }
        .sidebar-section { margin-bottom: 28px; }
        .sidebar-label { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(245,240,232,0.2); margin-bottom: 8px; }
        .sidebar-link { display: block; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: rgba(245,240,232,0.4); text-decoration: none; padding: 6px 0; transition: color 0.2s; }
        .sidebar-link:hover { color: var(--gold); }
        .main { flex: 1; padding: 52px 72px 100px; max-width: 860px; }
        .section { margin-bottom: 72px; }
        .eyebrow { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; line-height: 1; margin-bottom: 16px; }
        .section-title em { font-style: italic; color: var(--gold); }
        .section-sub { font-size: 15px; color: rgba(245,240,232,0.45); line-height: 1.8; letter-spacing: 0.02em; margin-bottom: 32px; }
        .divider { height: 1px; background: var(--border); margin-bottom: 40px; }
        .endpoint-box { display: flex; align-items: center; gap: 12px; background: rgba(201,168,76,0.05); border: 1px solid var(--border); padding: 16px 20px; margin-bottom: 24px; }
        .method-badge { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.15em; color: var(--black); background: var(--gold); padding: 4px 10px; flex-shrink: 0; }
        .endpoint-url { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 0.05em; color: var(--white); }
        .code-block { background: #0D0D0D; border: 1px solid rgba(201,168,76,0.08); padding: 24px 28px; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.03em; color: rgba(245,240,232,0.55); line-height: 1.9; overflow-x: auto; white-space: pre; margin-bottom: 24px; position: relative; }
        .code-label { position: absolute; top: 12px; right: 16px; font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,240,232,0.15); }
        .param-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .param-table th { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(245,240,232,0.2); padding: 10px 16px; text-align: left; border-bottom: 1px solid var(--border); }
        .param-table td { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.05em; color: rgba(245,240,232,0.5); padding: 12px 16px; border-bottom: 1px solid rgba(201,168,76,0.04); vertical-align: top; }
        .param-table td:first-child { color: var(--gold); }
        .required { color: #e05555; font-size: 8px; margin-left: 4px; }
        .optional { color: rgba(245,240,232,0.2); font-size: 8px; margin-left: 4px; }
        .error-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .error-table th { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(245,240,232,0.2); padding: 10px 16px; text-align: left; border-bottom: 1px solid var(--border); }
        .error-table td { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.05em; color: rgba(245,240,232,0.5); padding: 12px 16px; border-bottom: 1px solid rgba(201,168,76,0.04); }
        .error-table td:first-child { color: #e05555; font-weight: 700; }
        .inline-code { font-family: 'Space Mono', monospace; font-size: 11px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15); padding: 2px 7px; color: var(--gold); }
        .info-box { background: rgba(201,168,76,0.04); border-left: 2px solid var(--gold); padding: 16px 20px; margin-bottom: 24px; }
        .info-box p { font-size: 13px; color: rgba(245,240,232,0.45); line-height: 1.7; letter-spacing: 0.01em; }
        .sub-heading { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 12px; margin-top: 32px; }
        @media (max-width: 900px) { .sidebar { display: none; } .main { padding: 32px 24px 60px; } .nav { padding: 20px 24px; } }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Soviron</a>
        <div className="nav-links">
          <a href="/pricing" className="nav-link">Pricing</a>
          <a href="/dashboard" className="nav-btn">Dashboard</a>
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-label">Getting Started</p>
            <a href="#overview" className="sidebar-link">Overview</a>
            <a href="#authentication" className="sidebar-link">Authentication</a>
            <a href="#quickstart" className="sidebar-link">Quickstart</a>
          </div>
          <div className="sidebar-section">
            <p className="sidebar-label">Endpoints</p>
            <a href="#tts" className="sidebar-link">POST /api/tts</a>
          </div>
          <div className="sidebar-section">
            <p className="sidebar-label">Reference</p>
            <a href="#parameters" className="sidebar-link">Parameters</a>
            <a href="#response" className="sidebar-link">Response</a>
            <a href="#errors" className="sidebar-link">Error Codes</a>
          </div>
          <div className="sidebar-section">
            <p className="sidebar-label">Examples</p>
            <a href="#curl" className="sidebar-link">cURL</a>
            <a href="#python" className="sidebar-link">Python</a>
            <a href="#javascript" className="sidebar-link">JavaScript</a>
            <a href="#nodejs" className="sidebar-link">Node.js</a>
          </div>
        </aside>

        <main className="main">

          <div className="section" id="overview">
            <p className="eyebrow">Soviron API v1.0</p>
            <h1 className="section-title">Voice Cloning <em>API</em></h1>
            <p className="section-sub">Clone any voice and generate speech programmatically. Save a voice in your dashboard, then pass its ID in API requests to generate audio in that voice. Available on Creator, Pro, and Studio plans.</p>
            <div className="info-box">
              <p>Base URL: <span className="inline-code">https://soviron.vercel.app</span></p>
            </div>
            <div className="divider" />
          </div>

          <div className="section" id="authentication">
            <p className="eyebrow">Authentication</p>
            <h2 className="section-title">API <em>Keys</em></h2>
            <p className="section-sub">All requests must include your API key in the <span className="inline-code">x-api-key</span> header. Generate your key from the dashboard under Developer → API Access.</p>
            <div className="code-block">
              <span className="code-label">HEADER</span>
{`x-api-key: sov_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
            </div>
            <div className="info-box">
              <p>Keep your API key secret. Do not expose it in client-side code or public repositories. You can generate up to 3 active keys and revoke them anytime from your <a href="/dashboard" style={{color: 'var(--gold)'}}>dashboard</a>.</p>
            </div>
            <div className="divider" />
          </div>

          <div className="section" id="quickstart">
            <p className="eyebrow">Quickstart</p>
            <h2 className="section-title">Your first <em>request</em></h2>
            <p className="section-sub">Two ways to use the API — with a saved voice clone, or without (uses default Soviron voice).</p>

            <p className="sub-heading">Without voice cloning (default voice)</p>
            <div className="code-block">
              <span className="code-label">CURL</span>
{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Namaste, this is Soviron."}' \\
  --output speech.wav`}
            </div>

            <p className="sub-heading">With voice cloning (your saved voice)</p>
            <div className="code-block">
              <span className="code-label">CURL</span>
{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Namaste, this is Soviron.",
    "voice_id": "YOUR_VOICE_UUID"
  }' \\
  --output speech.wav`}
            </div>
            <div className="info-box">
              <p>Find your voice UUIDs in the dashboard under My Voices, or by calling <span className="inline-code">GET /api/tts</span> which returns your account info.</p>
            </div>
            <div className="divider" />
          </div>

          <div className="section" id="tts">
            <p className="eyebrow">Endpoint</p>
            <h2 className="section-title">Generate <em>Speech</em></h2>
            <p className="section-sub">Convert text to speech using your saved voice clone or the default voice.</p>
            <div className="endpoint-box">
              <span className="method-badge">POST</span>
              <span className="endpoint-url">/api/tts</span>
            </div>

            <div id="parameters">
              <p className="sub-heading">Request Body (JSON)</p>
              <table className="param-table">
                <thead>
                  <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>text <span className="required">required</span></td>
                    <td>string</td>
                    <td>The text to convert to speech. Maximum 50,000 characters per request.</td>
                  </tr>
                  <tr>
                    <td>voice_id <span className="optional">optional</span></td>
                    <td>string (UUID)</td>
                    <td>UUID of a saved voice from your account. If provided, output will clone that voice. If omitted, uses the default Soviron voice.</td>
                  </tr>
                  <tr>
                    <td>speed <span className="optional">optional</span></td>
                    <td>number</td>
                    <td>Playback speed multiplier. Range: 0.5 – 2.0. Default: 1.0</td>
                  </tr>
                  <tr>
                    <td>pitch <span className="optional">optional</span></td>
                    <td>number</td>
                    <td>Pitch adjustment in semitones. Range: -10 to +10. Default: 0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div id="response">
              <p className="sub-heading">Response</p>
              <div className="info-box">
                <p>Returns a <span className="inline-code">audio/wav</span> binary on success (HTTP 200). Check response headers for quota info.</p>
              </div>
              <table className="param-table">
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
              <p className="sub-heading">Error Codes</p>
              <table className="error-table">
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
            <div className="divider" />
          </div>

          <div className="section" id="curl">
            <p className="eyebrow">Examples</p>
            <h2 className="section-title">Code <em>Examples</em></h2>

            <p className="sub-heading">cURL</p>
            <div className="code-block">
              <span className="code-label">CURL</span>
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

            <p className="sub-heading" id="python">Python</p>
            <div className="code-block">
              <span className="code-label">PYTHON</span>
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

            <p className="sub-heading" id="javascript">JavaScript (Browser)</p>
            <div className="code-block">
              <span className="code-label">JAVASCRIPT</span>
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

            <p className="sub-heading" id="nodejs">Node.js</p>
            <div className="code-block">
              <span className="code-label">NODE.JS</span>
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