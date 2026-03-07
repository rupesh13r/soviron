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

type Tab = 'generate' | 'clone' | 'voices';

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
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

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

  const cloneInputRef = useRef<HTMLInputElement>(null);
  const sessionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      setUser(session.user);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      // Load saved voices
      const { data: voiceData } = await supabase.from('voices').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (voiceData) setVoices(voiceData);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isPaid = profile?.plan && profile.plan !== 'free';
  const charsRemaining = profile ? profile.chars_limit - profile.chars_used : 0;
  const charsPercent = profile ? Math.min((profile.chars_used / profile.chars_limit) * 100, 100) : 0;

  // --- GENERATE ---
  const handleGenerate = async () => {
    if (!text.trim()) { setGenError('Please enter some text.'); return; }
    if (text.length > charsRemaining) { setGenError('Not enough characters remaining. Please upgrade.'); return; }
    setGenerating(true); setGenError(null); setAudioUrl(null);
    try {
      const formData = new FormData();
      formData.append('text', text);
      // Use saved voice if selected (paid), else session upload
      if (selectedVoice && isPaid) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('voices')
          .createSignedUrl(selectedVoice.file_path, 60);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_VM_URL}/generate`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('failed');
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      await supabase.from('profiles').update({ chars_used: (profile?.chars_used || 0) + text.length }).eq('id', user.id);
      setProfile((prev: any) => ({ ...prev, chars_used: (prev?.chars_used || 0) + text.length }));
    } catch {
      setGenError('Generation failed. Make sure the VM is running.');
    } finally {
      setGenerating(false);
    }
  };

  // --- CLONE SAVE ---
  const handleSaveVoice = async () => {
    if (!cloneFile) { setCloneError('Please upload a voice sample.'); return; }
    if (!cloneName.trim()) { setCloneError('Please enter a name for this voice.'); return; }
    if (!isPaid) { setCloneError('Voice saving is available on paid plans only.'); return; }
    setCloneSaving(true); setCloneError(null);
    try {
      const filePath = `${user.id}/${Date.now()}-${cloneFile.name}`;
      // Upload to Supabase Storage (voices bucket) or GCS
      const { error: uploadError } = await supabase.storage.from('voices').upload(filePath, cloneFile);
      if (uploadError) throw uploadError;
      const { error: dbError } = await supabase.from('voices').insert({
        user_id: user.id,
        name: cloneName,
        language: cloneLanguage,
        gender: cloneGender,
        description: cloneDescription,
        file_path: filePath,
      });
      if (dbError) throw dbError;
      // Refresh voices
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
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(245,240,232,0.3)' }}>LOADING...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --black: #080808;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: #7A6330;
          --white: #F5F0E8;
          --grey: #141414;
          --border: rgba(201,168,76,0.1);
        }
        html, body { background: var(--black); color: var(--white); font-family: 'Tenor Sans', sans-serif; height: 100%; }
        .layout { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          background: #0A0A0A;
          border-right: 1px solid var(--border);
          padding: 36px 24px;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
          overflow-y: auto; z-index: 10;
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 300;
          letter-spacing: 0.35em; color: var(--gold);
          text-transform: uppercase; text-decoration: none;
          display: block; margin-bottom: 44px;
        }
        .nav-label {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.45em;
          text-transform: uppercase; color: rgba(245,240,232,0.18);
          margin-bottom: 8px; margin-top: 20px; padding-left: 12px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; margin-bottom: 2px;
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.4);
          border: 1px solid transparent;
          cursor: pointer; transition: all 0.2s;
          background: none; width: 100%; text-align: left;
          text-decoration: none;
        }
        .nav-item:hover { color: var(--white); border-color: var(--border); }
        .nav-item.active {
          color: var(--gold);
          background: rgba(201,168,76,0.06);
          border-color: rgba(201,168,76,0.15);
        }
        .nav-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor; opacity: 0.6; flex-shrink: 0;
        }
        .nav-item.active .nav-dot { opacity: 1; }

        .sidebar-bottom { margin-top: auto; padding-top: 24px; }
        .quota-box {
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.12);
          padding: 16px; margin-bottom: 12px;
        }
        .quota-plan {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.4em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 6px;
        }
        .quota-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 300; color: var(--white);
          line-height: 1;
        }
        .quota-sub {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.25); margin-top: 2px;
        }
        .quota-track { height: 1px; background: rgba(255,255,255,0.06); margin-top: 10px; }
        .quota-fill { height: 1px; background: var(--gold); transition: width 0.5s; }
        .btn-logout {
          width: 100%; padding: 11px;
          background: transparent;
          border: 1px solid rgba(245,240,232,0.08);
          color: rgba(245,240,232,0.25);
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; cursor: pointer; transition: all 0.3s;
        }
        .btn-logout:hover { color: rgba(245,240,232,0.5); border-color: rgba(245,240,232,0.15); }

        /* MAIN */
        .main { margin-left: 260px; padding: 52px 56px; min-height: 100vh; flex: 1; width: calc(100vw - 260px); max-width: 100%; }
        .page-header { margin-bottom: 40px; }
        .page-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.35em;
          text-transform: uppercase; color: rgba(245,240,232,0.28);
          margin-bottom: 8px;
        }
        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px; font-weight: 300; line-height: 1;
        }
        .page-title em { font-style: italic; color: var(--gold); }

        /* CARDS */
        .card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          padding: 36px; margin-bottom: 16px;
          position: relative; width: 100%;
        }
        .card-accent::before {
          content: ''; position: absolute;
          top: -1px; left: 36px;
          width: 60px; height: 2px;
          background: var(--gold);
        }
        .card-title {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.4em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 20px;
        }

        /* TEXTAREA */
        .tts-textarea {
          width: 100%; height: 150px; resize: none;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,168,76,0.1);
          padding: 18px 20px;
          color: var(--white); font-family: 'Tenor Sans', sans-serif;
          font-size: 15px; line-height: 1.7;
          outline: none; transition: border-color 0.3s;
          letter-spacing: 0.02em;
        }
        .tts-textarea:focus { border-color: rgba(201,168,76,0.3); }
        .tts-textarea::placeholder { color: rgba(245,240,232,0.12); }
        .char-row {
          display: flex; justify-content: space-between;
          margin-top: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.12em;
          color: rgba(245,240,232,0.22);
        }
        .char-row .warn { color: #e05555; }

        /* TWO COL */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; width: 100%; }

        /* VOICE SELECTOR */
        .voice-selector-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px;
          margin-bottom: 4px;
        }
        .voice-chip {
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(201,168,76,0.1);
          cursor: pointer; transition: all 0.2s;
          position: relative;
        }
        .voice-chip:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.04); }
        .voice-chip.selected { border-color: var(--gold); background: rgba(201,168,76,0.08); }
        .voice-chip-name {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.1em;
          color: var(--white); margin-bottom: 3px;
        }
        .voice-chip-meta {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.1em;
          color: rgba(245,240,232,0.3); text-transform: uppercase;
        }
        .voice-chip.selected .voice-chip-name { color: var(--gold); }
        .voice-chip-check {
          position: absolute; top: 8px; right: 8px;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold); display: none;
        }
        .voice-chip.selected .voice-chip-check { display: block; }
        .no-voices-msg {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.2); padding: 16px 0;
        }

        /* SESSION UPLOAD */
        .upload-zone {
          border: 1px dashed rgba(201,168,76,0.2);
          padding: 20px; text-align: center;
          cursor: pointer; transition: all 0.3s;
          position: relative;
        }
        .upload-zone:hover { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.02); }
        .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .upload-zone-title {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,240,232,0.35);
          margin-bottom: 3px;
        }
        .upload-zone-sub { font-size: 11px; color: rgba(245,240,232,0.18); }
        .upload-zone-selected {
          font-family: 'Space Mono', monospace;
          font-size: 9px; color: var(--gold); letter-spacing: 0.1em;
        }

        /* SLIDERS */
        .slider-row { display: flex; flex-direction: column; gap: 16px; }
        .slider-item {}
        .slider-label {
          display: flex; justify-content: space-between; align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,240,232,0.35);
          margin-bottom: 8px;
        }
        .slider-label span { color: var(--gold); }
        input[type=range] {
          width: 100%; height: 2px;
          -webkit-appearance: none; appearance: none;
          background: rgba(255,255,255,0.08);
          outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--gold); cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--gold); cursor: pointer; border: none;
        }

        /* GENERATE BTN */
        .gen-btn {
          width: 100%; padding: 18px;
          background: var(--gold); color: var(--black);
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer; transition: all 0.3s;
        }
        .gen-btn:hover { background: var(--gold-light); }
        .gen-btn:disabled { background: #1A1A1A; color: rgba(245,240,232,0.15); cursor: not-allowed; }

        /* AUDIO */
        .audio-card {
          background: rgba(201,168,76,0.04);
          border: 1px solid rgba(201,168,76,0.14);
          padding: 28px;
        }
        .audio-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 14px;
        }
        audio { width: 100%; margin-bottom: 12px; }
        .download-btn {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--gold-dim);
          text-decoration: none; transition: color 0.3s;
        }
        .download-btn:hover { color: var(--gold); }

        /* ERROR */
        .error-msg {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: #e05555;
          margin-top: 12px; letter-spacing: 0.05em;
        }
        .success-msg {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: #5ec97a;
          margin-top: 12px; letter-spacing: 0.05em;
        }

        /* CLONE GRID */
        .clone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }
        .field { margin-bottom: 16px; }
        .field-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(245,240,232,0.3);
          margin-bottom: 8px; display: block;
        }
        .field-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.1);
          color: var(--white); font-family: 'Tenor Sans', sans-serif;
          font-size: 14px; outline: none; transition: border-color 0.3s;
        }
        .field-input:focus { border-color: rgba(201,168,76,0.35); }
        .field-input::placeholder { color: rgba(245,240,232,0.12); }
        select.field-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(201,168,76,0.4)'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          padding-right: 36px;
        }
        select.field-input option { background: #1a1a1a; }
        .clone-upload-zone {
          border: 1px dashed rgba(201,168,76,0.2);
          padding: 40px 24px; text-align: center;
          cursor: pointer; transition: all 0.3s;
          position: relative; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
        }
        .clone-upload-zone:hover { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.02); }
        .clone-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .upload-icon-large { font-size: 32px; }
        .clone-upload-title {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,240,232,0.4);
        }
        .clone-upload-sub { font-size: 12px; color: rgba(245,240,232,0.2); }
        .clone-upload-selected {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: var(--gold); letter-spacing: 0.1em;
        }
        .requirements-list {
          list-style: none; margin-top: 12px;
        }
        .requirements-list li {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.12em;
          color: rgba(245,240,232,0.2); padding: 4px 0;
          border-bottom: 1px solid rgba(201,168,76,0.04);
          display: flex; gap: 8px; align-items: center;
        }
        .requirements-list li::before { content: '—'; color: var(--gold-dim); }
        .locked-overlay {
          background: rgba(8,8,8,0.85);
          border: 1px solid rgba(201,168,76,0.15);
          padding: 24px; text-align: center;
          margin-bottom: 16px;
        }
        .locked-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300; color: var(--gold);
          margin-bottom: 6px;
        }
        .locked-sub {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.3);
        }
        .upgrade-link {
          display: inline-block; margin-top: 12px;
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          text-decoration: none; border: 1px solid rgba(201,168,76,0.3);
          padding: 8px 16px; transition: all 0.3s;
        }
        .upgrade-link:hover { background: rgba(201,168,76,0.08); }

        /* VOICES LIST */
        .voices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2px; }
        .voice-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          padding: 24px; position: relative;
          transition: border-color 0.2s;
        }
        .voice-card:hover { border-color: rgba(201,168,76,0.25); }
        .voice-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 300;
          margin-bottom: 4px;
        }
        .voice-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .voice-tag {
          font-family: 'Space Mono', monospace;
          font-size: 8px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(245,240,232,0.35);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,168,76,0.1);
          padding: 3px 8px;
        }
        .voice-card-desc {
          font-size: 12px; color: rgba(245,240,232,0.3);
          line-height: 1.5; margin-bottom: 16px;
        }
        .voice-card-actions { display: flex; gap: 8px; }
        .btn-use {
          flex: 1; padding: 9px;
          background: var(--gold); color: var(--black);
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer; transition: all 0.3s;
        }
        .btn-use:hover { background: var(--gold-light); }
        .btn-delete {
          padding: 9px 12px;
          background: transparent;
          border: 1px solid rgba(245,240,232,0.08);
          color: rgba(245,240,232,0.25);
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.1em;
          cursor: pointer; transition: all 0.3s;
        }
        .btn-delete:hover { border-color: #e05555; color: #e05555; }
        .empty-voices {
          grid-column: 1 / -1; padding: 60px; text-align: center;
          border: 1px dashed rgba(201,168,76,0.1);
        }
        .empty-voices-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 300; color: rgba(245,240,232,0.3);
          margin-bottom: 8px;
        }
        .empty-voices-sub {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.15em;
          color: rgba(245,240,232,0.15);
        }

        @media (max-width: 900px) {
          .sidebar { position: relative; width: 100%; height: auto; bottom: auto; }
          .main { margin-left: 0; padding: 24px; width: 100%; }
          .two-col, .clone-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
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

        {/* MAIN */}
        <main className="main">

          {/* ── GENERATE TAB ── */}
          {tab === 'generate' && (
            <>
              <div className="page-header">
                <p className="page-eyebrow">Welcome back, {user?.email?.split('@')[0]}</p>
                <h1 className="page-title">Generate <em>Speech</em></h1>
              </div>

              <div className="two-col">
                {/* LEFT: text + voice */}
                <div>
                  <div className="card card-accent" style={{ marginBottom: 16 }}>
                    <p className="card-title">01 — Your Text</p>
                    <textarea
                      className="tts-textarea"
                      placeholder="Type or paste the text you want to convert to speech..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
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
                            <div
                              key={v.id}
                              className={`voice-chip ${selectedVoice?.id === v.id ? 'selected' : ''}`}
                              onClick={() => setSelectedVoice(selectedVoice?.id === v.id ? null : v)}
                            >
                              <div className="voice-chip-check" />
                              <p className="voice-chip-name">{v.name}</p>
                              <p className="voice-chip-meta">{v.language} · {v.gender}</p>
                            </div>
                          ))}
                        </div>
                        <p style={{ fontFamily: 'Space Mono', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(245,240,232,0.2)', marginTop: 8 }}>
                          OR UPLOAD FOR THIS SESSION ONLY
                        </p>
                      </>
                    ) : (
                      <p className="no-voices-msg">No saved voices yet. {isPaid ? 'Clone a voice first.' : 'Upgrade to save voices.'}</p>
                    )}

                    <div className="upload-zone" style={{ marginTop: 12 }}>
                      <input
                        ref={sessionInputRef}
                        type="file" accept="audio/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) { setSessionVoiceFile(f); setSessionVoiceFileName(f.name); setSelectedVoice(null); }
                        }}
                      />
                      {sessionVoiceFileName ? (
                        <p className="upload-zone-selected">✓ {sessionVoiceFileName}</p>
                      ) : (
                        <>
                          <p className="upload-zone-title">Upload voice sample</p>
                          <p className="upload-zone-sub">MP3, WAV · 10–30 seconds</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: sliders + generate */}
                <div>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <p className="card-title">03 — Voice Settings</p>
                    <div className="slider-row">
                      <div className="slider-item">
                        <div className="slider-label">Speed <span>{speed.toFixed(1)}x</span></div>
                        <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
                      </div>
                      <div className="slider-item">
                        <div className="slider-label">Pitch <span>{pitch > 0 ? `+${pitch}` : pitch}</span></div>
                        <input type="range" min="-10" max="10" step="1" value={pitch} onChange={e => setPitch(parseInt(e.target.value))} />
                      </div>
                    </div>
                  </div>

                  <div className="card card-accent">
                    <p className="card-title">04 — Generate</p>
                    <button
                      className="gen-btn"
                      onClick={handleGenerate}
                      disabled={generating || !text.trim()}
                    >
                      {generating ? 'Generating...' : 'Generate Speech →'}
                    </button>
                    {genError && <p className="error-msg">{genError}</p>}
                  </div>

                  {audioUrl && (
                    <div className="audio-card" style={{ marginTop: 16 }}>
                      <p className="audio-label">Generated Audio</p>
                      <audio controls src={audioUrl} />
                      <a href={audioUrl} download="soviron-output.wav" className="download-btn">↓ Download WAV</a>
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
                  <a href="/pricing" className="upgrade-link">Upgrade from ₹99 →</a>
                </div>
              )}

              <div className={`clone-grid ${!isPaid ? '' : ''}`} style={{ opacity: isPaid ? 1 : 0.4, pointerEvents: isPaid ? 'auto' : 'none' }}>
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
                        <option>Hindi</option>
                        <option>English</option>
                        <option>Marathi</option>
                        <option>Tamil</option>
                        <option>Telugu</option>
                        <option>Bengali</option>
                        <option>Kannada</option>
                        <option>Gujarati</option>
                        <option>Punjabi</option>
                        <option>Malayalam</option>
                        <option>Odia</option>
                        <option>Urdu</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">Gender</label>
                      <select className="field-input" value={cloneGender} onChange={e => setCloneGender(e.target.value)}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Neutral</option>
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
                  <div className="card" style={{ marginBottom: 2, height: 'fit-content' }}>
                    <p className="card-title">Upload Voice Sample</p>
                    <div className="clone-upload-zone">
                      <input
                        ref={cloneInputRef}
                        type="file" accept="audio/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) { setCloneFile(f); setCloneFileName(f.name); }
                        }}
                      />
                      {cloneFileName ? (
                        <p className="clone-upload-selected">✓ {cloneFileName}</p>
                      ) : (
                        <>
                          <div className="upload-icon-large">🎤</div>
                          <p className="clone-upload-title">Drop file or click to upload</p>
                          <p className="clone-upload-sub">MP3, WAV, M4A · up to 20MB</p>
                        </>
                      )}
                    </div>
                    <ul className="requirements-list" style={{ marginTop: 16 }}>
                      <li>Minimum 10 seconds, 30+ recommended</li>
                      <li>Only one speaker in the audio</li>
                      <li>No background music or noise</li>
                      <li>Speak clearly and naturally</li>
                    </ul>
                  </div>

                  <div className="card card-accent">
                    <button
                      className="gen-btn"
                      onClick={handleSaveVoice}
                      disabled={cloneSaving || !cloneFile || !cloneName.trim()}
                    >
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
                      <button className="btn-use" onClick={() => { setSelectedVoice(v); setTab('generate'); }}>
                        Use Voice
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteVoice(v.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}