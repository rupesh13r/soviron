'use client';
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'ru', label: 'Russian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
];

const EXAMPLE_PROMPTS = [
  'Warm professional female, slight British accent',
  'Deep authoritative male, American news anchor',
  'Energetic young male, friendly and conversational',
  'Calm meditation guide, soft and soothing',
];

export default function VoiceDesignPage() {
  const [voiceDescription, setVoiceDescription] = useState('');
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('en');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [generationComplete, setGenerationComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!voiceDescription.trim()) { setError('Please describe a voice.'); return; }
    if (!inputText.trim()) { setError('Please enter text to speak.'); return; }

    setGenerating(true);
    setError(null);
    setStatus('Warming up... starting stream');
    setGenerationComplete(false);
    setAudioUrl(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    let warmingUpTimer: NodeJS.Timeout | null = setTimeout(() => {
      setStatus('Warming up server... please wait a few seconds');
    }, 10000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }

      const body = {
        text: inputText,
        voice_design: voiceDescription.trim(),
        language,
        speed: 1,
        pitch: 0,
        volume: 1.0,
        exaggeration: 0.5,
        format: 'mp3',
      };

      const res = await fetch('https://soviron-proxy.azurewebsites.net/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error. Please try again.');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Stream closed instantly.');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        while (buffer.includes('\n\n')) {
          const splitPoint = buffer.indexOf('\n\n') + 2;
          const message = buffer.slice(0, splitPoint);
          buffer = buffer.slice(splitPoint);

          if (message.startsWith('data: ')) {
            const dataStr = message.replace('data: ', '').trim();
            let dataObj;
            try { dataObj = JSON.parse(dataStr); } catch { continue; }

            if (warmingUpTimer) { clearTimeout(warmingUpTimer); warmingUpTimer = null; }

            if (dataObj.type === 'error') {
              throw new Error(dataObj.message || 'Error occurred during generation');
            } else if (dataObj.type === 'chunk') {
              setStatus(`Generating chunk ${dataObj.index} of ${dataObj.total}...`);
              const byteChars = window.atob(dataObj.audio_b64);
              const byteNumbers = new Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'audio/mp3' });
              const newUrl = URL.createObjectURL(blob);
              setAudioUrl(prevUrl => { if (prevUrl) URL.revokeObjectURL(prevUrl); return newUrl; });
            } else if (dataObj.type === 'done') {
              setStatus('Generation complete ✓');
              setGenerationComplete(true);
            }
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed.');
    } finally {
      if (warmingUpTimer) clearTimeout(warmingUpTimer);
      setGenerating(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .vd-page { min-height: 100vh; background: #FFFFFF; font-family: 'Inter', -apple-system, sans-serif; }

        .vd-top-bar { padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .vd-logo { font-size: 20px; font-weight: 700; color: #080808; text-decoration: none; letter-spacing: -0.02em; }
        .vd-back { font-size: 13px; font-weight: 500; color: #6B7280; text-decoration: none; transition: color 0.2s; }
        .vd-back:hover { color: #080808; }

        .vd-container { max-width: 720px; margin: 0 auto; padding: 48px 24px 120px; }
        .vd-header { margin-bottom: 36px; }
        .vd-title { font-size: 36px; font-weight: 700; letter-spacing: -0.03em; color: #080808; line-height: 1.1; margin: 0 0 8px; }
        .vd-subtitle { font-size: 15px; color: #9CA3AF; line-height: 1.5; margin: 0; }

        .vd-card { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 28px 28px 24px; margin-bottom: 16px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
        .vd-card-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #6B7280; margin: 0 0 14px; }

        .vd-textarea { width: 100%; resize: none; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 16px 18px; color: #080808; font-family: inherit; font-size: 15px; line-height: 1.7; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .vd-textarea:focus { border-color: rgba(0,0,0,0.2); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
        .vd-textarea::placeholder { color: #BCC0C7; }

        .vd-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .vd-chip { padding: 8px 14px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08); border-radius: 100px; font-size: 12px; font-weight: 500; color: #6B7280; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .vd-chip:hover { color: #080808; border-color: rgba(0,0,0,0.2); background: rgba(0,0,0,0.04); }
        .vd-chip.active { color: #FFFFFF; background: #080808; border-color: #080808; }

        .vd-input { width: 100%; padding: 14px 18px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #080808; font-family: inherit; font-size: 15px; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .vd-input:focus { border-color: rgba(0,0,0,0.2); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
        .vd-input::placeholder { color: #BCC0C7; }

        .vd-select { width: 100%; padding: 14px 18px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #080808; font-family: inherit; font-size: 14px; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(0,0,0,0.3)'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; }
        .vd-select option { background: #FFFFFF; }

        .vd-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .vd-gen-btn { width: 100%; padding: 16px; background: #080808; color: #FFFFFF; border: none; border-radius: 12px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-top: 8px; }
        .vd-gen-btn:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .vd-gen-btn:disabled { background: rgba(0,0,0,0.08); color: #9CA3AF; cursor: not-allowed; transform: none; box-shadow: none; }

        .vd-status { font-size: 13px; color: #6B7280; text-align: center; margin-top: 14px; }
        .vd-error { font-size: 13px; color: #ef4444; margin-top: 12px; }

        .vd-audio-card { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 24px; margin-top: 16px; }
        .vd-audio-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin: 0 0 14px; }
        .vd-audio-card audio { width: 100%; margin-bottom: 12px; }
        .vd-download { font-size: 13px; font-weight: 500; color: #080808; text-decoration: none; transition: color 0.3s; }
        .vd-download:hover { color: #6B7280; }

        @media (max-width: 640px) {
          .vd-container { padding: 28px 16px 120px; }
          .vd-title { font-size: 28px; }
          .vd-card { padding: 22px 18px 20px; }
          .vd-two-col { grid-template-columns: 1fr; }
          .vd-top-bar { padding: 16px 16px; }
        }
      `}</style>

      <div className="vd-page">
        <div className="vd-top-bar">
          <a href="/" className="vd-logo">Soviron</a>
          <a href="/dashboard" className="vd-back">← Back to Dashboard</a>
        </div>

        <div className="vd-container">
          <div className="vd-header">
            <h1 className="vd-title">Voice Design</h1>
            <p className="vd-subtitle">Describe any voice and generate speech in that voice. No reference audio needed.</p>
          </div>

          {/* Voice Description */}
          <div className="vd-card">
            <p className="vd-card-label">01 — Describe Your Voice</p>
            <textarea
              className="vd-textarea"
              rows={4}
              value={voiceDescription}
              onChange={e => setVoiceDescription(e.target.value)}
              placeholder="Describe your voice... e.g. A warm, professional female voice with a slight British accent"
            />
            <div className="vd-chips">
              {EXAMPLE_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  className={`vd-chip ${voiceDescription === prompt ? 'active' : ''}`}
                  onClick={() => setVoiceDescription(voiceDescription === prompt ? '' : prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Text + Language */}
          <div className="vd-card">
            <p className="vd-card-label">02 — Your Text</p>
            <div className="vd-two-col" style={{ marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6, display: 'block', letterSpacing: '0.03em' }}>Language</label>
                <select className="vd-select" value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
                  Voice Design is powered by Qwen3-TTS and supports these 10 languages.
                </p>
              </div>
            </div>
            <textarea
              className="vd-textarea"
              rows={4}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type or paste the text you want to convert to speech..."
            />
          </div>

          {/* Generate */}
          <button
            className="vd-gen-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : '✦ Generate Speech'}
          </button>

          {status && <p className="vd-status">{status}</p>}
          {error && <p className="vd-error">{error}</p>}

          {/* Audio Output */}
          {audioUrl && (
            <div className="vd-audio-card">
              <p className="vd-audio-label">Output</p>
              <audio ref={audioRef} controls src={audioUrl} />
              {generationComplete && (
                <a className="vd-download" href={audioUrl} download={`voice-design-${Date.now()}.mp3`}>
                  ↓ Download MP3
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
