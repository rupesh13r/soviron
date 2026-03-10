'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

type Voice = {
  id: string;
  name: string;
  language: string;
  gender: string;
  description: string;
  file_path: string;
  created_at: string;
};

type ApiKey = {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
  is_active: boolean;
};

type Tab = 'generate' | 'clone' | 'voices' | 'api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('generate');

  // Generate tab
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [sessionVoiceFile, setSessionVoiceFile] = useState<File | null>(null);
  const [sessionVoiceFileName, setSessionVoiceFileName] = useState('');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [format, setFormat] = useState('mp3');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState('');

  // Clone tab
  const [voices, setVoices] = useState<Voice[]>([]);
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [cloneFileName, setCloneFileName] = useState('');
  const [cloneName, setCloneName] = useState('');
  const [cloneLanguage, setCloneLanguage] = useState('Hindi');
  const [cloneGender, setCloneGender] = useState('Male');
  const [cloneDescription, setCloneDescription] = useState('');
  const [clonePreviewText, setClonePreviewText] = useState('');
  const [cloneSaving, setCloneSaving] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  // API tab
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cloneInputRef = useRef<HTMLInputElement>(null);
  const sessionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      setUser(session.user);
      // Clear any leftover voice state from previous session
      setSelectedVoice(null);
      setSessionVoiceFile(null);
      setSessionVoiceFileName('');
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      const { data: voiceData } = await supabase.from('voices').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (voiceData) setVoices(voiceData);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (tab === 'api') loadApiKeys();
  }, [tab]);

  const loadApiKeys = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/keys', {
      headers: { authorization: `Bearer ${session.access_token}` }
    });
    const data = await res.json();
    setApiKeys(data.keys || []);
  };

  const handleGenerateKey = async () => {
    setApiLoading(true); setApiError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: apiKeyName || 'Default Key' })
    });
    const data = await res.json();
    if (data.error) { setApiError(data.error); }
    else { setApiKeyName(''); loadApiKeys(); }
    setApiLoading(false);
  };

  const handleRevokeKey = async (keyId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/keys', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyId })
    });
    loadApiKeys();
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(val);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogout = async () => {
    // Clear all voice state before logging out
    setSelectedVoice(null);
    setSessionVoiceFile(null);
    setSessionVoiceFileName('');
    setAudioUrl(null);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isPaid = profile?.plan && profile.plan !== 'free';
  const isApiPlan = ['creator', 'pro', 'studio'].includes(profile?.plan);
  const charsRemaining = profile ? profile.chars_limit - profile.chars_used : 0;
  const charsPercent = profile ? Math.min((profile.chars_used / profile.chars_limit) * 100, 100) : 0;

  // BACKENDS in priority order — frontend tries each until one succeeds
  const BACKENDS = [
    { name: 'Cerebrium', url: 'https://api.aws.us-east-1.cerebrium.ai/v4/p-c85ac149/soviron-tts' },
    { name: 'GCP VM', url: 'http://35.206.231.152:8000' },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) { setGenError('Please enter some text.'); return; }
    if (text.length > charsRemaining) { setGenError('Not enough characters remaining. Please upgrade.'); return; }
    setGenerating(true); setGenError(null); setAudioUrl(null); setGenStatus('');

    // Build FormData once
    const buildFormData = async () => {
      const formData = new FormData();
      formData.append('text', text);
      if (selectedVoice && isPaid) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('voices').createSignedUrl(selectedVoice.file_path, 60);
        if (signedUrlError) throw new Error('Could not fetch saved voice');
        const voiceRes = await fetch(signedUrlData.signedUrl);
        const voiceBlob = await voiceRes.blob();
        const voiceFile = new File([voiceBlob], 'voice.wav', { type: 'audio/wav' });
        formData.append('audio_prompt', voiceFile);
      } else if (sessionVoiceFile) {
        formData.append('audio_prompt', sessionVoiceFile);
      }
      formData.append('speed', speed.toString());
      formData.append('pitch', pitch.toString());
      formData.append('format', format);
      return formData;
    };

    try {
      const formData = await buildFormData();
      let success = false;

      for (const backend of BACKENDS) {
        try {
          setGenStatus(backend.name === 'Cerebrium'
            ? 'Warming up servers... this may take up to 60 seconds on first use.'
            : `Trying backup server (${backend.name})...`
          );

          if (backend.name === 'Cerebrium') {
            // Cerebrium expects JSON with base64 audio
            const body: any = { text, speed: parseFloat(Number(speed).toFixed(2)), pitch: parseFloat(Number(pitch).toFixed(2)), format: String(format) };
            if (sessionVoiceFile) {
              const reader = new FileReader();
              const audioB64 = await new Promise<string>((resolve) => {
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(sessionVoiceFile);
              });
              body.audio_prompt_b64 = audioB64;
            } else if (selectedVoice && isPaid) {
              const { data: signedUrlData } = await supabase.storage
                .from('voices').createSignedUrl(selectedVoice.file_path, 60);
              if (signedUrlData) {
                const voiceRes = await fetch(signedUrlData.signedUrl);
                const voiceBlob = await voiceRes.blob();
                const reader = new FileReader();
                const audioB64 = await new Promise<string>((resolve) => {
                  reader.onload = () => resolve((reader.result as string).split(',')[1]);
                  reader.readAsDataURL(voiceBlob);
                });
                body.audio_prompt_b64 = audioB64;
              }
            }
            const res = await fetch(`${backend.url}/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CEREBRIUM_API_KEY}` },
              body: JSON.stringify(body),
            });
            if (res.ok) {
              const json = await res.json();
              const result = json.result || json; // Cerebrium wraps in result field
              const audioBytes = Uint8Array.from(atob(result.audio_b64), c => c.charCodeAt(0));
              const blob = new Blob([audioBytes], { type: result.media_type });
              setAudioUrl(URL.createObjectURL(blob));
              await supabase.from('profiles').update({ chars_used: (profile?.chars_used || 0) + text.length }).eq('id', user.id);
              setProfile((prev: any) => ({ ...prev, chars_used: (prev?.chars_used || 0) + text.length }));
              setGenStatus(''); success = true; break;
            }
          } else {
            // Modal and GCP VM — FormData, binary response
            const res = await fetch(`${backend.url}/generate`, { method: 'POST', body: formData });
            if (res.ok) {
              const blob = await res.blob();
              setAudioUrl(URL.createObjectURL(blob));
              await supabase.from('profiles').update({ chars_used: (profile?.chars_used || 0) + text.length }).eq('id', user.id);
              setProfile((prev: any) => ({ ...prev, chars_used: (prev?.chars_used || 0) + text.length }));
              setGenStatus(''); success = true; break;
            }
          }
        } catch {
          continue;
        }
      }

      if (!success) {
        setGenError('All servers are currently busy. Please try again in a moment.');
      } else {
        // Clear session voice after successful generation to prevent bleeding between users
        setSessionVoiceFile(null);
        setSessionVoiceFileName('');
      }
    } catch {
      setGenError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
      setGenStatus('');
    }
  };

  const handleSaveVoice = async () => {
    if (!cloneFile) { setCloneError('Please upload a voice sample.'); return; }
    if (!cloneName.trim()) { setCloneError('Please enter a name for this voice.'); return; }
    if (!isPaid) { setCloneError('Voice saving is available on paid plans only.'); return; }
    setCloneSaving(true); setCloneError(null);
    try {
      const filePath = `${user.id}/${Date.now()}-${cloneFile.name}`;
      const { error: uploadError } = await supabase.storage.from('voices').upload(filePath, cloneFile);
      if (uploadError) throw uploadError;
      const { error: dbError } = await supabase.from('voices').insert({
        user_id: user.id, name: cloneName, language: cloneLanguage,
        gender: cloneGender, description: cloneDescription, file_path: filePath,
      });
      if (dbError) throw dbError;
      const { data } = await supabase.from('voices').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setVoices(data);
      setCloneSuccess(true);
      setCloneFile(null); setCloneFileName(''); setCloneName(''); setCloneDescription('');
      setTimeout(() => { setCloneSuccess(false); setTab('voices'); }, 1500);
    } catch (e: any) {
      setCloneError(e.message || 'Failed to save voice.');
    } finally {
      setCloneSaving(false);
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    await supabase.from('voices').delete().eq('id', voiceId);
    setVoices(v => v.filter(x => x.id !== voiceId));
    if (selectedVoice?.id === voiceId) setSelectedVoice(null);
  };

  if (!user) return (
    <div style={{ background: '#0a0b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>LOADING...</p>
    </div>
  );

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #0a0b14; --bg-sec: #111225; --bg-card: rgba(17,18,37,0.7);
          --accent: #6366f1; --accent-light: #818cf8; --accent-dim: rgba(99,102,241,0.35);
          --cyan: #06b6d4; --cyan-dim: rgba(6,182,212,0.25);
          --text: #e2e8f0; --text-muted: #94a3b8; --text-dim: #64748b;
          --border: rgba(99,102,241,0.12); --border-s: rgba(255,255,255,0.06);
          --r: 12px; --r-sm: 8px;
        }
        html, body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; height: 100%; }
        .layout { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          background: var(--bg-sec); border-right: 1px solid var(--border-s);
          padding: 32px 20px; display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
          overflow-y: auto; z-index: 10;
        }
        .logo { font-size: 20px; font-weight: 700; color: var(--text); text-decoration: none; display: block; margin-bottom: 36px; letter-spacing: -0.02em; }
        .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; margin-top: 20px; padding-left: 12px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 2px; font-size: 13px; font-weight: 500; color: var(--text-muted); border: 1px solid transparent; border-radius: var(--r-sm); cursor: pointer; transition: all 0.2s; background: none; width: 100%; text-align: left; text-decoration: none; }
        .nav-item:hover { color: var(--text); background: rgba(99,102,241,0.04); border-color: var(--border-s); }
        .nav-item.active { color: var(--accent-light); background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.15); }
        .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.5; flex-shrink: 0; }
        .nav-item.active .nav-dot { opacity: 1; }
        .sidebar-bottom { margin-top: auto; padding-top: 24px; }
        .quota-box { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.12); border-radius: var(--r-sm); padding: 16px; margin-bottom: 12px; }
        .quota-plan { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-light); margin-bottom: 6px; }
        .quota-num { font-size: 28px; font-weight: 700; color: var(--text); line-height: 1; }
        .quota-sub { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
        .quota-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-top: 10px; }
        .quota-fill { height: 3px; background: linear-gradient(to right, var(--accent), var(--cyan)); border-radius: 2px; transition: width 0.5s; }
        .btn-logout { width: 100%; padding: 11px; background: transparent; border: 1px solid var(--border-s); border-radius: var(--r-sm); color: var(--text-dim); font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .btn-logout:hover { color: var(--text-muted); border-color: rgba(255,255,255,0.12); }

        /* MAIN */
        .main { margin-left: 260px; padding: 48px 52px; min-height: 100vh; flex: 1; width: calc(100vw - 260px); max-width: 100%; }
        .page-header { margin-bottom: 36px; }
        .page-eyebrow { font-size: 12px; font-weight: 500; letter-spacing: 0.05em; color: var(--text-dim); margin-bottom: 6px; }
        .page-title { font-size: 40px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
        .page-title em { font-style: normal; background: linear-gradient(135deg, var(--accent), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        /* CARDS */
        .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r); padding: 32px; margin-bottom: 16px; position: relative; width: 100%; backdrop-filter: blur(12px); }
        .card-accent::before { content: ''; position: absolute; top: -1px; left: 32px; width: 60px; height: 2px; background: linear-gradient(to right, var(--accent), var(--cyan)); border-radius: 1px; }
        .card-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent-light); margin-bottom: 18px; }

        /* TEXTAREA */
        .tts-textarea { width: 100%; height: 150px; resize: none; background: rgba(255,255,255,0.04); border: 1px solid var(--border-s); border-radius: var(--r-sm); padding: 16px 18px; color: var(--text); font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.7; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .tts-textarea:focus { border-color: var(--accent-dim); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .tts-textarea::placeholder { color: var(--text-dim); }
        .char-row { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--text-dim); }
        .char-row .warn { color: #ef4444; }

        /* GRID LAYOUTS */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; width: 100%; }

        /* VOICE SELECTOR */
        .voice-selector-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin-bottom: 4px; }
        .voice-chip { padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-s); border-radius: var(--r-sm); cursor: pointer; transition: all 0.2s; position: relative; }
        .voice-chip:hover { border-color: rgba(99,102,241,0.25); background: rgba(99,102,241,0.04); }
        .voice-chip.selected { border-color: var(--accent); background: rgba(99,102,241,0.1); }
        .voice-chip-name { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
        .voice-chip-meta { font-size: 11px; color: var(--text-dim); text-transform: uppercase; }
        .voice-chip.selected .voice-chip-name { color: var(--accent-light); }
        .voice-chip-check { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: none; }
        .voice-chip.selected .voice-chip-check { display: block; }
        .no-voices-msg { font-size: 13px; color: var(--text-dim); padding: 16px 0; }

        /* UPLOAD */
        .upload-zone { border: 1px dashed rgba(99,102,241,0.25); border-radius: var(--r-sm); padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; position: relative; }
        .upload-zone:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.03); }
        .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .upload-zone-title { font-size: 12px; font-weight: 500; color: var(--text-muted); margin-bottom: 3px; }
        .upload-zone-sub { font-size: 12px; color: var(--text-dim); }
        .upload-zone-selected { font-size: 12px; font-weight: 600; color: var(--cyan); }

        /* SLIDERS */
        .slider-row { display: flex; flex-direction: column; gap: 16px; }
        .slider-label { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .slider-label span { color: var(--accent-light); font-weight: 600; }
        input[type=range] { width: 100%; height: 3px; -webkit-appearance: none; appearance: none; background: rgba(255,255,255,0.08); border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; box-shadow: 0 0 8px rgba(99,102,241,0.3); }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; border: none; }

        /* BUTTONS */
        .gen-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--accent), #8b5cf6); color: #fff; border: none; border-radius: var(--r-sm); font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .gen-btn:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.35); transform: translateY(-1px); }
        .gen-btn:disabled { background: rgba(255,255,255,0.06); color: var(--text-dim); cursor: not-allowed; transform: none; box-shadow: none; }

        /* AUDIO */
        .audio-card { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: var(--r-sm); padding: 24px; }
        .audio-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-light); margin-bottom: 14px; }
        audio { width: 100%; margin-bottom: 12px; }
        .download-btn { font-size: 13px; font-weight: 500; color: var(--accent-light); text-decoration: none; transition: color 0.3s; }
        .download-btn:hover { color: var(--cyan); }
        .error-msg { font-size: 13px; color: #ef4444; margin-top: 12px; }
        .success-msg { font-size: 13px; color: #22c55e; margin-top: 12px; }

        /* CLONE TAB */
        .clone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }
        .field { margin-bottom: 16px; }
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; display: block; }
        .field-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-s); border-radius: var(--r-sm); color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .field-input:focus { border-color: var(--accent-dim); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .field-input::placeholder { color: var(--text-dim); }
        select.field-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(99,102,241,0.5)'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        select.field-input option { background: #12132a; }
        .clone-upload-zone { border: 1px dashed rgba(99,102,241,0.25); border-radius: var(--r-sm); padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.3s; position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
        .clone-upload-zone:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.03); }
        .clone-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .upload-icon-large { font-size: 32px; }
        .clone-upload-title { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .clone-upload-sub { font-size: 12px; color: var(--text-dim); }
        .clone-upload-selected { font-size: 13px; font-weight: 600; color: var(--cyan); }
        .requirements-list { list-style: none; margin-top: 12px; }
        .requirements-list li { font-size: 11px; color: var(--text-dim); padding: 4px 0; border-bottom: 1px solid var(--border-s); display: flex; gap: 8px; align-items: center; }
        .requirements-list li::before { content: '—'; color: var(--accent-light); }

        /* LOCKED */
        .locked-overlay { background: rgba(10,11,20,0.9); border: 1px solid rgba(99,102,241,0.15); border-radius: var(--r); padding: 24px; text-align: center; margin-bottom: 16px; }
        .locked-title { font-size: 22px; font-weight: 700; color: var(--accent-light); margin-bottom: 6px; }
        .locked-sub { font-size: 13px; color: var(--text-dim); }
        .upgrade-link { display: inline-block; margin-top: 12px; font-size: 13px; font-weight: 600; color: var(--accent-light); text-decoration: none; border: 1px solid rgba(99,102,241,0.3); border-radius: var(--r-sm); padding: 8px 16px; transition: all 0.3s; }
        .upgrade-link:hover { background: rgba(99,102,241,0.08); }

        /* VOICES TAB */
        .voices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .voice-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r); padding: 24px; position: relative; transition: all 0.3s; backdrop-filter: blur(12px); }
        .voice-card:hover { border-color: rgba(99,102,241,0.25); }
        .voice-card-name { font-size: 20px; font-weight: 600; margin-bottom: 6px; }
        .voice-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .voice-tag { font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); background: rgba(255,255,255,0.04); border: 1px solid var(--border-s); border-radius: 4px; padding: 3px 8px; }
        .voice-card-desc { font-size: 13px; color: var(--text-dim); line-height: 1.5; margin-bottom: 16px; }
        .voice-card-actions { display: flex; gap: 8px; }
        .btn-use { flex: 1; padding: 9px; background: linear-gradient(135deg, var(--accent), #8b5cf6); color: #fff; border: none; border-radius: var(--r-sm); font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-use:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.3); }
        .btn-delete { padding: 9px 12px; background: transparent; border: 1px solid var(--border-s); border-radius: var(--r-sm); color: var(--text-dim); font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .btn-delete:hover { border-color: #ef4444; color: #ef4444; }
        .empty-voices { grid-column: 1 / -1; padding: 60px; text-align: center; border: 1px dashed rgba(99,102,241,0.15); border-radius: var(--r); }
        .empty-voices-title { font-size: 24px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
        .empty-voices-sub { font-size: 13px; color: var(--text-dim); }

        /* API TAB */
        .api-key-row { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
        .api-key-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .api-key-value { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; color: var(--text-dim); word-break: break-all; }
        .api-key-meta { font-size: 11px; color: var(--text-dim); margin-top: 3px; }
        .api-key-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .btn-copy { padding: 8px 14px; background: rgba(99,102,241,0.1); color: var(--accent-light); border: 1px solid rgba(99,102,241,0.2); border-radius: var(--r-sm); font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
        .btn-copy:hover { background: rgba(99,102,241,0.15); border-color: var(--accent); }
        .btn-revoke { padding: 8px 14px; background: transparent; color: var(--text-dim); border: 1px solid var(--border-s); border-radius: var(--r-sm); font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
        .btn-revoke:hover { border-color: #ef4444; color: #ef4444; }
        .code-block { background: #0d0e1a; border: 1px solid var(--border-s); border-radius: var(--r-sm); padding: 20px 24px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; color: var(--text-muted); line-height: 1.9; overflow-x: auto; white-space: pre; }
        .key-gen-row { display: flex; gap: 8px; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .sidebar { position: relative; width: 100%; height: auto; bottom: auto; }
          .main { margin-left: 0; padding: 24px; width: 100%; }
          .two-col, .clone-grid, .key-gen-row { grid-template-columns: 1fr; flex-direction: column; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <a href="/" className="logo">Soviron</a>

          <p className="nav-label">Studio</p>
          <button className={`nav-item ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
            <span className="nav-dot" />Generate Speech
          </button>
          <button className={`nav-item ${tab === 'clone' ? 'active' : ''}`} onClick={() => setTab('clone')}>
            <span className="nav-dot" />Clone a Voice
          </button>
          <button className={`nav-item ${tab === 'voices' ? 'active' : ''}`} onClick={() => setTab('voices')}>
            <span className="nav-dot" />My Voices {voices.length > 0 && `(${voices.length})`}
          </button>

          <p className="nav-label">Developer</p>
          <button className={`nav-item ${tab === 'api' ? 'active' : ''}`} onClick={() => setTab('api')}>
            <span className="nav-dot" />API Access
          </button>

          <p className="nav-label">Account</p>
          <a className="nav-item" href="/pricing">Upgrade Plan</a>

          <div className="sidebar-bottom">
            <div className="quota-box">
              <p className="quota-plan">{profile?.plan || 'free'} plan</p>
              <p className="quota-num">{charsRemaining.toLocaleString()}</p>
              <p className="quota-sub">characters remaining</p>
              <div className="quota-track">
                <div className="quota-fill" style={{ width: `${charsPercent}%` }} />
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        <main className="main">

          {/* ── GENERATE TAB ── */}
          {tab === 'generate' && (
            <>
              <div className="page-header">
                <p className="page-eyebrow">Welcome back, {user?.email?.split('@')[0]}</p>
                <h1 className="page-title">Generate <em>Speech</em></h1>
              </div>
              <div className="two-col">
                <div>
                  <div className="card card-accent" style={{ marginBottom: 16 }}>
                    <p className="card-title">01 — Your Text</p>
                    <textarea className="tts-textarea" placeholder="Type or paste the text you want to convert to speech..." value={text} onChange={e => setText(e.target.value)} />
                    <div className="char-row">
                      <span className={text.length > charsRemaining ? 'warn' : ''}>{text.length} typed</span>
                      <span>{charsRemaining.toLocaleString()} remaining</span>
                    </div>
                  </div>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <p className="card-title">02 — Select Voice</p>
                    {voices.length > 0 ? (
                      <>
                        <div className="voice-selector-grid">
                          {voices.map(v => (
                            <div key={v.id} className={`voice-chip ${selectedVoice?.id === v.id ? 'selected' : ''}`} onClick={() => setSelectedVoice(selectedVoice?.id === v.id ? null : v)}>
                              <div className="voice-chip-check" />
                              <p className="voice-chip-name">{v.name}</p>
                              <p className="voice-chip-meta">{v.language} · {v.gender}</p>
                            </div>
                          ))}
                        </div>
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginTop: 8 }}>OR UPLOAD FOR THIS SESSION ONLY</p>
                      </>
                    ) : (
                      <p className="no-voices-msg">No saved voices yet. {isPaid ? 'Clone a voice first.' : 'Upgrade to save voices.'}</p>
                    )}
                    <div className="upload-zone" style={{ marginTop: 12 }}>
                      <input ref={sessionInputRef} type="file" accept="audio/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setSessionVoiceFile(f); setSessionVoiceFileName(f.name); setSelectedVoice(null); } }} />
                      {sessionVoiceFileName ? <p className="upload-zone-selected">✓ {sessionVoiceFileName}</p> : (<><p className="upload-zone-title">Upload voice sample</p><p className="upload-zone-sub">MP3, WAV · 10–30 seconds</p></>)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <p className="card-title">03 — Voice Settings</p>
                    <div className="slider-row">
                      <div>
                        <div className="slider-label">Speed <span>{speed.toFixed(1)}x</span></div>
                        <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <div className="slider-label">Pitch <span>{pitch > 0 ? `+${pitch}` : pitch}</span></div>
                        <input type="range" min="-10" max="10" step="1" value={pitch} onChange={e => setPitch(parseInt(e.target.value))} />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div className="slider-label">Output Format <span style={{ textTransform: 'uppercase' }}>{format}</span></div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                          {['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].map(f => (
                            <button key={f} onClick={() => setFormat(f)} style={{
                              padding: '6px 14px', fontFamily: 'Inter,sans-serif', fontSize: 12,
                              fontWeight: 500, textTransform: 'uppercase', cursor: 'pointer',
                              border: format === f ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                              background: format === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                              color: format === f ? '#818cf8' : '#94a3b8',
                              borderRadius: 8, transition: 'all 0.2s'
                            }}>{f}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card card-accent">
                    <p className="card-title">04 — Generate</p>
                    <button className="gen-btn" onClick={handleGenerate} disabled={generating || !text.trim()}>
                      {generating ? 'Generating...' : 'Generate Speech →'}
                    </button>
                    {generating && genStatus && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 }}>{genStatus}</p>}
                    {genError && <p className="error-msg">{genError}</p>}
                  </div>
                  {audioUrl && (
                    <div className="audio-card" style={{ marginTop: 16 }}>
                      <p className="audio-label">Generated Audio</p>
                      <audio controls src={audioUrl} />
                      <a href={audioUrl} download={`soviron-output.${format}`} className="download-btn">↓ Download {format.toUpperCase()}</a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── CLONE TAB ── */}
          {tab === 'clone' && (
            <>
              <div className="page-header">
                <p className="page-eyebrow">Studio</p>
                <h1 className="page-title">Clone a <em>Voice</em></h1>
              </div>
              {!isPaid && (
                <div className="locked-overlay">
                  <p className="locked-title">Paid Feature</p>
                  <p className="locked-sub">Voice saving is available on paid plans. Free users can still upload a sample per session.</p>
                  <a href="/pricing" className="upgrade-link">Upgrade from ₹79 →</a>
                </div>
              )}
              <div className="clone-grid" style={{ opacity: isPaid ? 1 : 0.4, pointerEvents: isPaid ? 'auto' : 'none' }}>
                <div>
                  <div className="card card-accent" style={{ marginBottom: 16 }}>
                    <p className="card-title">Voice Details</p>
                    <div className="field">
                      <label className="field-label">Voice Name *</label>
                      <input className="field-input" placeholder="e.g. My Podcast Voice" value={cloneName} onChange={e => setCloneName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Language *</label>
                      <select className="field-input" value={cloneLanguage} onChange={e => setCloneLanguage(e.target.value)}>
                        <option>Hindi</option><option>English</option><option>Marathi</option>
                        <option>Tamil</option><option>Telugu</option><option>Bengali</option>
                        <option>Kannada</option><option>Gujarati</option><option>Punjabi</option>
                        <option>Malayalam</option><option>Odia</option><option>Urdu</option><option>Other</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Gender</label>
                      <select className="field-input" value={cloneGender} onChange={e => setCloneGender(e.target.value)}>
                        <option>Male</option><option>Female</option><option>Neutral</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Description (optional)</label>
                      <input className="field-input" placeholder="e.g. Deep and calm, news anchor tone" value={cloneDescription} onChange={e => setCloneDescription(e.target.value)} />
                    </div>
                  </div>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <p className="card-title">Preview Text (optional)</p>
                    <input className="field-input" style={{ width: '100%' }} placeholder="Enter text to test this voice after saving..." value={clonePreviewText} onChange={e => setClonePreviewText(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="card" style={{ marginBottom: 2 }}>
                    <p className="card-title">Upload Voice Sample</p>
                    <div className="clone-upload-zone">
                      <input ref={cloneInputRef} type="file" accept="audio/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setCloneFile(f); setCloneFileName(f.name); } }} />
                      {cloneFileName ? <p className="clone-upload-selected">✓ {cloneFileName}</p> : (<><div className="upload-icon-large">🎤</div><p className="clone-upload-title">Drop file or click to upload</p><p className="clone-upload-sub">MP3, WAV, M4A · up to 20MB</p></>)}
                    </div>
                    <ul className="requirements-list" style={{ marginTop: 16 }}>
                      <li>Minimum 10 seconds, 30+ recommended</li>
                      <li>Only one speaker in the audio</li>
                      <li>No background music or noise</li>
                      <li>Speak clearly and naturally</li>
                    </ul>
                  </div>
                  <div className="card card-accent">
                    <button className="gen-btn" onClick={handleSaveVoice} disabled={cloneSaving || !cloneFile || !cloneName.trim()}>
                      {cloneSaving ? 'Saving Voice...' : 'Save Voice Clone →'}
                    </button>
                    {cloneError && <p className="error-msg">{cloneError}</p>}
                    {cloneSuccess && <p className="success-msg">✓ Voice saved successfully!</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── VOICES TAB ── */}
          {tab === 'voices' && (
            <>
              <div className="page-header">
                <p className="page-eyebrow">Studio</p>
                <h1 className="page-title">My <em>Voices</em></h1>
              </div>
              <div className="voices-grid">
                {voices.length === 0 ? (
                  <div className="empty-voices">
                    <p className="empty-voices-title">No voices saved yet</p>
                    <p className="empty-voices-sub">Clone your first voice to see it here</p>
                  </div>
                ) : voices.map(v => (
                  <div key={v.id} className="voice-card">
                    <p className="voice-card-name">{v.name}</p>
                    <div className="voice-card-tags">
                      <span className="voice-tag">{v.language}</span>
                      <span className="voice-tag">{v.gender}</span>
                    </div>
                    {v.description && <p className="voice-card-desc">{v.description}</p>}
                    <div className="voice-card-actions">
                      <button className="btn-use" onClick={() => { setSelectedVoice(v); setTab('generate'); }}>Use Voice</button>
                      <button className="btn-delete" onClick={() => handleDeleteVoice(v.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── API TAB ── */}
          {tab === 'api' && (
            <>
              <div className="page-header">
                <p className="page-eyebrow">Developer</p>
                <h1 className="page-title">API <em>Access</em></h1>
              </div>

              {!isApiPlan ? (
                <div className="locked-overlay">
                  <p className="locked-title">Creator Plan Required</p>
                  <p className="locked-sub">API access is available on Creator, Pro, and Studio plans.</p>
                  <a href="/pricing" className="upgrade-link">Upgrade from ₹349 →</a>
                </div>
              ) : (
                <>
                  <div className="card card-accent" style={{ marginBottom: 16 }}>
                    <p className="card-title">Generate API Key</p>
                    <div className="key-gen-row">
                      <input
                        className="field-input"
                        style={{ flex: 1 }}
                        placeholder="Key name (e.g. Production, Testing)"
                        value={apiKeyName}
                        onChange={e => setApiKeyName(e.target.value)}
                      />
                      <button
                        className="gen-btn"
                        style={{ width: 'auto', padding: '13px 24px' }}
                        onClick={handleGenerateKey}
                        disabled={apiLoading}
                      >
                        {apiLoading ? 'Generating...' : 'Generate Key →'}
                      </button>
                    </div>
                    {apiError && <p className="error-msg">{apiError}</p>}
                  </div>

                  {apiKeys.filter(k => k.is_active).length > 0 && (
                    <div className="card" style={{ marginBottom: 16 }}>
                      <p className="card-title">Your API Keys</p>
                      {apiKeys.filter(k => k.is_active).map(k => (
                        <div key={k.id} className="api-key-row">
                          <div style={{ minWidth: 0 }}>
                            <p className="api-key-name">{k.name}</p>
                            <p className="api-key-value">{k.key}</p>
                            <p className="api-key-meta">
                              Created {new Date(k.created_at).toLocaleDateString()}
                              {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="api-key-actions">
                            <button className="btn-copy" onClick={() => copyToClipboard(k.key)}>
                              {copiedKey === k.key ? '✓ Copied' : 'Copy'}
                            </button>
                            <button className="btn-revoke" onClick={() => handleRevokeKey(k.id)}>Revoke</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card" style={{ marginBottom: 16 }}>
                    <p className="card-title">Usage Example</p>
                    <div className="code-block">{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello from Soviron API", "speed": 1.0, "pitch": 0}' \\
  --output speech.wav`}</div>
                  </div>

                  <div className="card">
                    <p className="card-title">Parameters</p>
                    <div className="code-block">{`text        string   required   Text to convert (max 50,000 chars)
speed       number   optional   Playback speed: 0.5 – 2.0 (default: 1.0)
pitch       number   optional   Pitch shift: -10 to +10 (default: 0)

Response headers:
X-Chars-Used        Characters used in this request
X-Chars-Remaining   Characters left in your quota`}</div>
                  </div>
                </>
              )}
            </>
          )}

        </main>
      </div>
    </>
  );
}
