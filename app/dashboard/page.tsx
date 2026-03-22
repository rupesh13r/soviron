'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import VoiceLibrary, { type DefaultVoice } from '../../components/VoiceLibrary';
import { franc } from 'franc-min';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate tab
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedDefaultVoice, setSelectedDefaultVoice] = useState<DefaultVoice | null>(null);
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);
  const [sessionVoiceFile, setSessionVoiceFile] = useState<File | null>(null);
  const [sessionVoiceFileName, setSessionVoiceFileName] = useState('');
  const [voiceDesign, setVoiceDesign] = useState('');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [emotion, setEmotion] = useState(0.5);
  const [format, setFormat] = useState('mp3');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState('');
  // Audio handling state and refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [generationComplete, setGenerationComplete] = useState(false);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      setUser(session.user);
      
      const fp = localStorage.getItem('device_fp');
      if (fp) {
        try {
          await fetch('/api/check-fingerprint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ fingerprint: fp })
          });
        } catch (e) {
          console.error('Failed to submit fingerprint', e);
        } finally {
          localStorage.removeItem('device_fp');
          localStorage.removeItem('hasExistingDevice');
        }
      }

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

  const handleGenerate = async () => {
    if (!text.trim()) { setGenError('Please enter some text.'); return; }
    if (text.length > charsRemaining) { setGenError('Not enough characters remaining. Please upgrade.'); return; }
    
    setGenerating(true); 
    setGenError(null); 
    setGenStatus('Warming up... starting stream');
    setGenerationComplete(false);
    setAudioUrl(null);
    

    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    
    let warmingUpTimer: NodeJS.Timeout | null = setTimeout(() => {
        setGenStatus('Warming up server... please wait a few seconds');
    }, 10000);

    try {
      // Detect language automatically
      const detectedLang = franc(text, { minLength: 10 }) || 'und';
      const LANG_MAP: Record<string, string> = {
        'eng': 'en', 'zho': 'zh', 'jpn': 'ja', 'kor': 'ko',
        'deu': 'de', 'fra': 'fr', 'rus': 'ru', 'por': 'pt',
        'spa': 'es', 'ita': 'it', 'hin': 'hi', 'ara': 'ar',
        'tur': 'tr', 'pol': 'pl', 'nld': 'nl', 'swe': 'sv',
        'nor': 'no', 'dan': 'da', 'fin': 'fi', 'ell': 'el',
        'heb': 'he', 'msa': 'ms', 'swa': 'sw',
      };
      const language = LANG_MAP[detectedLang] || 'en';

      const body: any = { 
        text, 
        speed: parseFloat(Number(speed).toFixed(2)), 
        pitch: parseFloat(Number(pitch).toFixed(2)), 
        volume: parseFloat(Number(volume).toFixed(2)),
        exaggeration: parseFloat(Number(emotion).toFixed(2)), 
        format: String(format),
        language,
      };

      const QWEN3_LANGS = new Set(['en', 'zh', 'ja', 'ko', 'de', 'fr', 'ru', 'pt', 'es', 'it']);

      if (voiceDesign.trim() && QWEN3_LANGS.has(language)) {
        body.voice_design = voiceDesign.trim();
      } else if (voiceDesign.trim() && !QWEN3_LANGS.has(language)) {
        setGenError('Voice Design is not available for this language. Clear it or change your text language.');
        setGenerating(false);
        if (warmingUpTimer) clearTimeout(warmingUpTimer);
        return;
      } else if (sessionVoiceFile) {
        const reader = new FileReader();
        const audioB64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(sessionVoiceFile);
        });
        body.audio_prompt_b64 = audioB64;
      } else if (selectedDefaultVoice) {
        body.voice_id = selectedDefaultVoice.id;
      } else if (selectedVoice && isPaid) {
        body.voice_id = selectedVoice.id;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      abortControllerRef.current = new AbortController();
      const res = await fetch(`https://soviron-proxy-334768023018.us-east4.run.app/generate`, {
        signal: abortControllerRef.current.signal,
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error. Please try again.');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream closed instantly.");

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
                try {
                   dataObj = JSON.parse(dataStr);
                } catch(e) { continue; }

                if (warmingUpTimer) {
                    clearTimeout(warmingUpTimer);
                    warmingUpTimer = null;
                }

                if (dataObj.type === 'error') {
                    throw new Error(dataObj.message || 'Error occurred during generation');
                }
                else if (dataObj.type === 'chunk') {
                    setGenStatus(`Generating chunk ${dataObj.index} of ${dataObj.total}...`);

                    const byteChars = window.atob(dataObj.audio_b64);
                    const byteNumbers = new Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteNumbers[i] = byteChars.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    
                    const blob = new Blob([byteArray], { type: `audio/${format}` });
                    const newUrl = URL.createObjectURL(blob);

                    if (audioRef.current) {
                        const isPlaying = !audioRef.current.paused;
                        const currentTime = audioRef.current.currentTime || 0;
                        audioRef.current.dataset.resumeTime = currentTime.toString();
                        audioRef.current.dataset.resumePlaying = isPlaying ? 'true' : 'false';
                    }

                    setAudioUrl(prevUrl => {
                        if (prevUrl) URL.revokeObjectURL(prevUrl);
                        return newUrl;
                    });
                }
                else if (dataObj.type === 'done') {
                    if (dataObj.audio_b64) {
                        const byteChars = window.atob(dataObj.audio_b64);
                        const byteNumbers = new Array(byteChars.length);
                        for (let i = 0; i < byteChars.length; i++) { byteNumbers[i] = byteChars.charCodeAt(i); }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: `audio/${format}` });
                        const finalUrl = URL.createObjectURL(blob);
                        setAudioUrl(prevUrl => { if (prevUrl) URL.revokeObjectURL(prevUrl); return finalUrl; });
                    }
                    setGenStatus(`Generation complete ✓`);
                    setGenerationComplete(true);
                    
                    setSessionVoiceFile(null);
                    setSessionVoiceFileName('');

                    await supabase.from('profiles').update({ chars_used: (profile?.chars_used || 0) + text.length }).eq('id', user.id);
                    setProfile((prev: any) => ({ ...prev, chars_used: (prev?.chars_used || 0) + text.length }));
                }
            }
        }
      }

    } catch (e: any) {
      setGenError(e.message || 'Generation layout failed securely intercepting streaming chunks.');
    } finally {
      if (warmingUpTimer) clearTimeout(warmingUpTimer);
      setGenerating(false);
      if (generationComplete) setGenStatus('');
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
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: '#9CA3AF' }}>LOADING...</p>
    </div>
  );

  const firstName = user?.email?.split('@')[0].split('.')[0] || '';
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] 
    || user?.user_metadata?.name?.split(' ')[0] 
    || (firstName.charAt(0).toUpperCase() + firstName.slice(1));

  return (
    <>
      <style>{`
        /* ── DASHBOARD BASE ── */
        .dash-layout { display: flex; min-height: 100vh; background: #FFFFFF; }

        /* SIDEBAR */
        .dash-sidebar {
          background: #FFFFFF; border-right: 1px solid rgba(0,0,0,0.08);
          padding: 32px 20px; display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
          overflow-y: auto; z-index: 10;
        }
        .dash-logo { font-size: 20px; font-weight: 700; color: #080808; text-decoration: none; display: block; margin-bottom: 36px; letter-spacing: -0.02em; }
        .dash-nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 8px; margin-top: 20px; padding-left: 12px; }
        .dash-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 2px; font-size: 13px; font-weight: 500; color: #6B7280; border: 1px solid transparent; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: none; width: 100%; text-align: left; text-decoration: none; font-family: inherit; }
        .dash-nav-item:hover { color: #080808; background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.06); }
        .dash-nav-item.active { color: #FFFFFF; background: #080808; border-color: #080808; }
        .dash-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.5; flex-shrink: 0; }
        .dash-nav-item.active .dash-nav-dot { opacity: 1; }
        .dash-sidebar-bottom { margin-top: auto; padding-top: 24px; }
        .dash-quota-box { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .dash-quota-plan { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin-bottom: 6px; }
        .dash-quota-num { font-size: 28px; font-weight: 700; color: #080808; line-height: 1; }
        .dash-quota-sub { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
        .dash-quota-track { height: 3px; background: rgba(0,0,0,0.06); border-radius: 2px; margin-top: 10px; }
        .dash-quota-fill { height: 3px; background: #080808; border-radius: 2px; transition: width 0.5s; }
        .dash-btn-logout { width: 100%; padding: 11px; background: transparent; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #9CA3AF; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .dash-btn-logout:hover { color: #6B7280; border-color: rgba(0,0,0,0.15); }

        /* MAIN */
        .dash-main { margin-left: 260px; padding: 48px 52px; min-height: 100vh; flex: 1; width: calc(100vw - 260px); max-width: 100%; }
        .dash-page-header { margin-bottom: 36px; }
        .dash-page-eyebrow { font-size: 12px; font-weight: 500; letter-spacing: 0.05em; color: #9CA3AF; margin-bottom: 6px; }
        .dash-page-title { font-size: 40px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; color: #080808; }

        /* CARDS */
        .dash-card { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 32px; margin-bottom: 16px; position: relative; width: 100%; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
        .dash-card-accent::before { content: ''; position: absolute; top: -1px; left: 32px; width: 60px; height: 2px; background: #080808; border-radius: 1px; }
        .dash-card-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #6B7280; margin-bottom: 18px; }

        /* TEXTAREA */
        .dash-textarea { width: 100%; height: 150px; resize: none; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 16px 18px; color: #080808; font-family: inherit; font-size: 15px; line-height: 1.7; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .dash-textarea:focus { border-color: rgba(0,0,0,0.2); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
        .dash-textarea::placeholder { color: #9CA3AF; }
        .dash-char-row { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #9CA3AF; }
        .dash-char-row .warn { color: #ef4444; }

        /* GRID */
        .dash-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; width: 100%; }

        /* VOICE SELECTOR */
        .dash-voice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin-bottom: 4px; }
        .dash-voice-chip { padding: 12px 14px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; cursor: pointer; transition: all 0.2s; position: relative; }
        .dash-voice-chip:hover { border-color: rgba(0,0,0,0.2); background: rgba(0,0,0,0.01); }
        .dash-voice-chip.selected { border-color: #080808; background: rgba(0,0,0,0.03); }
        .dash-voice-chip-name { font-size: 13px; font-weight: 500; color: #080808; margin-bottom: 3px; }
        .dash-voice-chip-meta { font-size: 11px; color: #9CA3AF; text-transform: uppercase; }
        .dash-voice-chip.selected .dash-voice-chip-name { color: #080808; font-weight: 600; }
        .dash-voice-chip-check { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; border-radius: 50%; background: #080808; display: none; }
        .dash-voice-chip.selected .dash-voice-chip-check { display: block; }
        .dash-no-voices { font-size: 13px; color: #9CA3AF; padding: 16px 0; }

        /* UPLOAD */
        .dash-upload-zone { border: 1px dashed rgba(0,0,0,0.15); border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; position: relative; }
        .dash-upload-zone:hover { border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.01); }
        .dash-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .dash-upload-title { font-size: 12px; font-weight: 500; color: #6B7280; margin-bottom: 3px; }
        .dash-upload-sub { font-size: 12px; color: #9CA3AF; }
        .dash-upload-selected { font-size: 12px; font-weight: 600; color: #080808; }

        /* SLIDERS */
        .dash-slider-row { display: flex; flex-direction: column; gap: 16px; }
        .dash-slider-label { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #6B7280; margin-bottom: 8px; }
        .dash-slider-label span { color: #080808; font-weight: 600; }
        input[type=range] { width: 100%; height: 3px; -webkit-appearance: none; appearance: none; background: rgba(0,0,0,0.08); border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #080808; cursor: pointer; box-shadow: 0 0 8px rgba(0,0,0,0.15); }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #080808; cursor: pointer; border: none; }

        /* BUTTONS */
        .dash-gen-btn { width: 100%; padding: 16px; background: #080808; color: #FFFFFF; border: none; border-radius: 12px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .dash-gen-btn:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .dash-gen-btn:disabled { background: rgba(0,0,0,0.08); color: #9CA3AF; cursor: not-allowed; transform: none; box-shadow: none; }

        /* AUDIO */
        .dash-audio-card { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 24px; }
        .dash-audio-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin-bottom: 14px; }
        audio { width: 100%; margin-bottom: 12px; }
        .dash-download-btn { font-size: 13px; font-weight: 500; color: #080808; text-decoration: none; transition: color 0.3s; }
        .dash-download-btn:hover { color: #6B7280; }
        .dash-error-msg { font-size: 13px; color: #ef4444; margin-top: 12px; }
        .dash-success-msg { font-size: 13px; color: #22c55e; margin-top: 12px; }

        /* CLONE TAB */
        .dash-clone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }
        .dash-field { margin-bottom: 16px; }
        .dash-field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6B7280; margin-bottom: 8px; display: block; }
        .dash-field-input { width: 100%; padding: 12px 16px; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #080808; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .dash-field-input:focus { border-color: rgba(0,0,0,0.2); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
        .dash-field-input::placeholder { color: #9CA3AF; }
        select.dash-field-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(0,0,0,0.3)'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        select.dash-field-input option { background: #FFFFFF; }
        .dash-clone-upload { border: 1px dashed rgba(0,0,0,0.15); border-radius: 10px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.3s; position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
        .dash-clone-upload:hover { border-color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.01); }
        .dash-clone-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .dash-upload-icon { font-size: 32px; }
        .dash-clone-upload-title { font-size: 13px; font-weight: 500; color: #6B7280; }
        .dash-clone-upload-sub { font-size: 12px; color: #9CA3AF; }
        .dash-clone-upload-selected { font-size: 13px; font-weight: 600; color: #080808; }
        .dash-req-list { list-style: none; margin-top: 12px; }
        .dash-req-list li { font-size: 11px; color: #9CA3AF; padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; gap: 8px; align-items: center; }
        .dash-req-list li::before { content: '—'; color: #080808; }

        /* LOCKED */
        .dash-locked { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 16px; }
        .dash-locked-title { font-size: 22px; font-weight: 700; color: #080808; margin-bottom: 6px; }
        .dash-locked-sub { font-size: 13px; color: #9CA3AF; }
        .dash-upgrade-link { display: inline-block; margin-top: 12px; font-size: 13px; font-weight: 600; color: #FFFFFF; background: #080808; text-decoration: none; border: none; border-radius: 10px; padding: 10px 20px; transition: all 0.3s; }
        .dash-upgrade-link:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

        /* VOICES TAB */
        .dash-voices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .dash-voice-card { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 24px; position: relative; transition: all 0.3s; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
        .dash-voice-card:hover { border-color: rgba(0,0,0,0.15); box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        .dash-voice-card-name { font-size: 20px; font-weight: 600; margin-bottom: 6px; color: #080808; }
        .dash-voice-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .dash-voice-tag { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #6B7280; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; padding: 3px 8px; }
        .dash-voice-card-desc { font-size: 13px; color: #9CA3AF; line-height: 1.5; margin-bottom: 16px; }
        .dash-voice-card-actions { display: flex; gap: 8px; }
        .dash-btn-use { flex: 1; padding: 9px; background: #080808; color: #FFFFFF; border: none; border-radius: 10px; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .dash-btn-use:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .dash-btn-delete { padding: 9px 12px; background: transparent; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #9CA3AF; font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .dash-btn-delete:hover { border-color: #ef4444; color: #ef4444; }
        .dash-empty-voices { grid-column: 1 / -1; padding: 60px; text-align: center; border: 1px dashed rgba(0,0,0,0.1); border-radius: 16px; }
        .dash-empty-voices-title { font-size: 24px; font-weight: 600; color: #6B7280; margin-bottom: 8px; }
        .dash-empty-voices-sub { font-size: 13px; color: #9CA3AF; }

        /* API TAB */
        .dash-api-key-row { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
        .dash-api-key-name { font-size: 14px; font-weight: 600; color: #080808; margin-bottom: 4px; }
        .dash-api-key-value { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; color: #9CA3AF; word-break: break-all; }
        .dash-api-key-meta { font-size: 11px; color: #9CA3AF; margin-top: 3px; }
        .dash-api-key-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .dash-btn-copy { padding: 8px 14px; background: rgba(0,0,0,0.04); color: #080808; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
        .dash-btn-copy:hover { background: rgba(0,0,0,0.08); border-color: rgba(0,0,0,0.15); }
        .dash-btn-revoke { padding: 8px 14px; background: transparent; color: #9CA3AF; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
        .dash-btn-revoke:hover { border-color: #ef4444; color: #ef4444; }
        .dash-code-block { background: #F9FAFB; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 20px 24px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; color: #4B5563; line-height: 1.9; overflow-x: auto; white-space: pre; }
        .dash-key-gen-row { display: flex; gap: 8px; }

        /* RESPONSIVE */
        .dash-top-nav { position: absolute; right: 52px; top: 48px; z-index: 50; }
        .dash-mobile-quota { display: none; }
        @media (max-width: 900px) {
          .dash-top-nav { position: relative; right: auto; top: auto; display: flex; justify-content: flex-end; margin-bottom: 24px; width: 100%; z-index: 50; }
          .dash-sidebar { display: none; }
          .dash-main { margin-left: 0; padding: 24px 16px; padding-bottom: 100px; width: 100%; display: flex; flex-direction: column; }
          .dash-mobile-quota { display: block; padding: 20px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); background: #FFFFFF; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; width: 100%; }
          .dash-two-col, .dash-clone-grid, .dash-key-gen-row { grid-template-columns: 1fr; flex-direction: column; }
          .dash-card { padding: 24px 20px; }
          .dash-page-header { margin-bottom: 24px; width: 100%; }
          .dash-page-title { font-size: 32px; }
        }

        /* MOBILE BOTTOM NAV */
        .dash-mobile-nav {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(0,0,0,0.08); padding: 12px 16px 24px;
        }
        @media (max-width: 900px) {
          .dash-mobile-nav { display: flex; justify-content: space-around; align-items: center; }
        }
        .dash-mobile-nav-btn {
          display: flex; flex-direction: column; align-items: center; gap: 4px; border: none; background: transparent;
          color: #9CA3AF; font-size: 10px; font-weight: 600; text-transform: uppercase; cursor: pointer; transition: color 0.2s;
        }
        .dash-mobile-nav-btn.active { color: #080808; }
        .dash-mobile-nav-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: transparent; transition: background 0.2s; }
        .dash-mobile-nav-btn.active .dash-mobile-nav-icon { background: rgba(0,0,0,0.05); }
      `}</style>

      <div className="dash-layout">
        <aside className="dash-sidebar md:flex">
          <a href="/" className="dash-logo">Soviron</a>

          <p className="dash-nav-label">Studio</p>
          <button className={`dash-nav-item ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
            <span className="dash-nav-dot" />Generate Speech
          </button>
          <button className={`dash-nav-item ${tab === 'clone' ? 'active' : ''}`} onClick={() => setTab('clone')}>
            <span className="dash-nav-dot" />Clone a Voice
          </button>
          <button className="dash-nav-item" onClick={() => setShowVoiceLibrary(true)}>
            <span className="dash-nav-dot" />Voice Library
          </button>
          <a className="dash-nav-item" href="/voice-design" style={{ textDecoration: 'none' }}>
            <span className="dash-nav-dot" />Voice Design
          </a>
          <button className={`dash-nav-item ${tab === 'voices' ? 'active' : ''}`} onClick={() => setTab('voices')}>
            <span className="dash-nav-dot" />My Voices {voices.length > 0 && `(${voices.length})`}
          </button>

          <p className="dash-nav-label">Developer</p>
          <button className={`dash-nav-item ${tab === 'api' ? 'active' : ''}`} onClick={() => setTab('api')}>
            <span className="dash-nav-dot" />API Access
          </button>

          <p className="dash-nav-label">Account</p>
          <a className="dash-nav-item" href="/pricing">Upgrade Plan</a>

          <div className="dash-sidebar-bottom">
            <div className="dash-quota-box">
              <p className="dash-quota-plan">{profile?.plan || 'free'} plan</p>
              <p className="dash-quota-num">{charsRemaining.toLocaleString()}</p>
              <p className="dash-quota-sub">characters remaining</p>
              <div className="dash-quota-track">
                <div className="dash-quota-fill" style={{ width: `${charsPercent}%` }} />
              </div>
            </div>
          </div>
        </aside>

        <main className="dash-main">

          {/* ── TOP NAV DROPDOWN ── */}
          <div className="dash-top-nav">
            {user && (
              <div className="flex items-center gap-3" style={{ position: 'relative' }}>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden border border-black/10 hover:border-black/30 transition-colors bg-gray-100 flex items-center justify-center text-black font-semibold cursor-pointer"
                    style={{ padding: 0 }}
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 min-w-[220px] bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden flex flex-col pt-3"
                      >
                        <div className="px-4 pb-3 mb-2 border-b border-black/5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-black border border-black/5">
                            {user.user_metadata?.avatar_url ? (
                              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-black truncate">
                              {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col px-2 pb-2">
                          <a href="/pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between" style={{ textDecoration: 'none' }} onClick={() => setIsDropdownOpen(false)}>
                            Plan
                            <span className="text-[10px] font-bold tracking-wider text-black bg-gray-100 px-2 py-0.5 rounded-md uppercase">
                              {profile?.plan || 'free'}
                            </span>
                          </a>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">User ID</span>
                            <span className="text-[11px] font-mono text-gray-500">{user.id.substring(0, 8)}</span>
                          </div>
                          <div className="h-px bg-black/5 my-1 mx-1" />
                          <button 
                            onClick={handleLogout}
                            className="px-3 py-2 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left flex items-center gap-2 cursor-pointer border-none bg-transparent w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* ── MOBILE BOTTOM NAV ── */}
          <nav className="dash-mobile-nav">
            <a href="/" className="dash-mobile-nav-btn" style={{ textDecoration: 'none' }}>
              <div className="dash-mobile-nav-icon">🏠</div>
              <span>Home</span>
            </a>
            <button className={`dash-mobile-nav-btn ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
              <div className="dash-mobile-nav-icon">✨</div>
              <span>Generate</span>
            </button>
            <button className={`dash-mobile-nav-btn ${tab === 'clone' ? 'active' : ''}`} onClick={() => setTab('clone')}>
              <div className="dash-mobile-nav-icon">🎤</div>
              <span>Clone</span>
            </button>
            <button className="dash-mobile-nav-btn" onClick={() => setShowVoiceLibrary(true)}>
              <div className="dash-mobile-nav-icon">📚</div>
              <span>Library</span>
            </button>
            <a href="/voice-design" className="dash-mobile-nav-btn" style={{ textDecoration: 'none' }}>
              <div className="dash-mobile-nav-icon">🎨</div>
              <span>Design</span>
            </a>
            <button className={`dash-mobile-nav-btn ${tab === 'voices' ? 'active' : ''}`} onClick={() => setTab('voices')}>
              <div className="dash-mobile-nav-icon">👤</div>
              <span>Voices</span>
            </button>
            <a href="/pricing" className="dash-mobile-nav-btn" style={{ textDecoration: 'none' }}>
              <div className="dash-mobile-nav-icon">⭐</div>
              <span>Upgrade</span>
            </a>
            <button className={`dash-mobile-nav-btn ${tab === 'api' ? 'active' : ''}`} onClick={() => setTab('api')}>
              <div className="dash-mobile-nav-icon">⚡</div>
              <span>API</span>
            </button>
          </nav>

          {/* ── GENERATE TAB ── */}
          {tab === 'generate' && (
            <>
              <div className="dash-page-header">
                <p className="dash-page-eyebrow">Welcome back, {displayName}</p>
                <h1 className="dash-page-title">Generate Speech</h1>
              </div>
              <div className="dash-two-col">
                <div>
                  <div className="dash-card dash-card-accent" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">01 — Your Text</p>
                    <textarea className="dash-textarea" placeholder="Type or paste the text you want to convert to speech..." value={text} onChange={e => setText(e.target.value)} />
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Tip: Use commas and periods for natural pauses. Add a blank line between paragraphs for longer breaks.</p>
                    {text.length >= 5000 && text.length < 10000 && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm font-medium">
                        Long generation. This may take 5–10 minutes. Please keep this tab open.
                      </div>
                    )}
                    {text.length >= 10000 && text.length < 20000 && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl px-4 py-3 text-sm font-medium">
                        Very long generation. This could take 10–20 minutes. Do not close this tab.
                      </div>
                    )}
                    {text.length >= 20000 && text.length <= 40000 && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-medium">
                        Extremely long generation. This may take 20–30+ minutes. Do not close this tab.
                      </div>
                    )}
                    {text.length > 40000 && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-medium">
                        Maximum limit of 40,000 characters reached.
                      </div>
                    )}

                    <div className="dash-char-row">
                      <span className={text.length > charsRemaining || text.length > 40000 ? 'warn' : ''}>{text.length.toLocaleString()} typed</span>
                      <span>{charsRemaining.toLocaleString()} remaining</span>
                    </div>
                  </div>

                  {/* MOBILE QUOTA CARD */}
                  <div className="dash-mobile-quota">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                      <div>
                        <p className="dash-quota-plan">{profile?.plan || 'free'} plan</p>
                        <p className="dash-quota-num" style={{ fontSize: '24px' }}>{charsRemaining.toLocaleString()}</p>
                      </div>
                      <p className="dash-quota-sub" style={{ margin: 0 }}>chars remaining</p>
                    </div>
                    <div className="dash-quota-track">
                      <div className="dash-quota-fill" style={{ width: `${charsPercent}%` }} />
                    </div>
                  </div>

                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">02 — Select Voice</p>

                    {/* Currently selected voice display */}
                    {(selectedDefaultVoice || selectedVoice) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, marginBottom: 14 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#FFF', fontWeight: 700, fontSize: 13,
                          background: selectedDefaultVoice
                            ? `linear-gradient(135deg, hsl(${(selectedDefaultVoice.id * 37) % 360}, 65%, 55%), hsl(${((selectedDefaultVoice.id * 37) % 360 + 40) % 360}, 55%, 45%))`
                            : `linear-gradient(135deg, hsl(${((selectedVoice?.id.charCodeAt(0) || 0) * 37) % 360}, 65%, 55%), hsl(${(((selectedVoice?.id.charCodeAt(0) || 0) * 37) % 360 + 40) % 360}, 55%, 45%))`
                        }}>
                          {(selectedDefaultVoice?.name || selectedVoice?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#080808', margin: 0 }}>{selectedDefaultVoice?.name || selectedVoice?.name}</p>
                          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                            {selectedDefaultVoice ? `${selectedDefaultVoice.accent} · ${selectedDefaultVoice.gender}` : `${selectedVoice?.language} · ${selectedVoice?.gender}`}
                          </p>
                        </div>
                        <button onClick={() => { setSelectedDefaultVoice(null); setSelectedVoice(null); }} style={{
                          padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)',
                          background: 'transparent', color: '#9CA3AF', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                        }}>✕ Clear</button>
                      </div>
                    )}

                    <button onClick={() => setShowVoiceLibrary(true)} style={{
                      width: '100%', padding: '14px', background: 'transparent',
                      border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
                      color: '#080808', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', marginBottom: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}>
                      📚 Browse Voice Library →
                    </button>

                    {voices.length > 0 && (
                      <>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8, marginTop: 4 }}>My Cloned Voices</p>
                        <div className="dash-voice-grid">
                          {voices.map(v => (
                            <div key={v.id} className={`dash-voice-chip ${selectedVoice?.id === v.id ? 'selected' : ''}`} onClick={() => { setSelectedVoice(selectedVoice?.id === v.id ? null : v); setSelectedDefaultVoice(null); setSessionVoiceFile(null); setSessionVoiceFileName(''); }}>
                              <div className="dash-voice-chip-check" />
                              <p className="dash-voice-chip-name">{v.name}</p>
                              <p className="dash-voice-chip-meta">{v.language} · {v.gender}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8, marginTop: 14 }}>Or upload for this session</p>
                    <div className="dash-upload-zone">
                      <input ref={sessionInputRef} type="file" accept="audio/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setSessionVoiceFile(f); setSessionVoiceFileName(f.name); setSelectedVoice(null); setSelectedDefaultVoice(null); setVoiceDesign(''); } }} />
                      {sessionVoiceFileName ? <p className="dash-upload-selected">✓ {sessionVoiceFileName}</p> : (<><p className="dash-upload-title">Upload voice sample</p><p className="dash-upload-sub">MP3, WAV · 10–30 seconds</p></>)}
                    </div>

                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8, marginTop: 18 }}>Or describe a voice</p>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={voiceDesign}
                        onChange={e => {
                          if (e.target.value.length <= 200) {
                            setVoiceDesign(e.target.value);
                            if (e.target.value.trim()) {
                              setSessionVoiceFile(null);
                              setSessionVoiceFileName('');
                              setSelectedVoice(null);
                              setSelectedDefaultVoice(null);
                            }
                          }
                        }}
                        placeholder="Describe your voice... e.g. A warm, professional female voice with a slight British accent"
                        style={{
                          width: '100%', minHeight: 72, resize: 'none',
                          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 10, padding: '12px 36px 12px 14px',
                          color: '#080808', fontFamily: 'inherit', fontSize: 13,
                          lineHeight: 1.6, outline: 'none',
                          transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                      {voiceDesign && (
                        <button
                          onClick={() => setVoiceDesign('')}
                          style={{
                            position: 'absolute', top: 10, right: 10,
                            width: 22, height: 22, borderRadius: 6,
                            border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.03)',
                            color: '#9CA3AF', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontFamily: 'inherit',
                            transition: 'all 0.2s', lineHeight: 1, padding: 0,
                          }}
                        >✕</button>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>Works for English, Chinese, Japanese, Korean, German, French, Russian, Portuguese, Spanish, Italian</p>
                      <span style={{ fontSize: 11, color: voiceDesign.length >= 180 ? '#ef4444' : '#9CA3AF', flexShrink: 0, marginLeft: 12 }}>{200 - voiceDesign.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">03 — Voice Settings</p>
                    <div className="dash-slider-row">
                      <div>
                        <div className="dash-slider-label">Speed <span>{speed.toFixed(1)}x</span></div>
                        <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <div className="dash-slider-label">Pitch <span>{pitch > 0 ? `+${pitch}` : pitch}</span></div>
                        <input type="range" min="-10" max="10" step="1" value={pitch} onChange={e => setPitch(parseInt(e.target.value))} />
                      </div>
                      <div>
                        <div className="dash-slider-label">VOLUME <span>{volume.toFixed(1)}x</span></div>
                        <input type="range" min="0.5" max="2.0" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <div className="dash-slider-label">EMOTION <span>{emotion.toFixed(2)}</span></div>
                        <input type="range" min="0.0" max="1.0" step="0.05" value={emotion} onChange={e => setEmotion(parseFloat(e.target.value))} />
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Higher = more expressive and dramatic</p>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div className="dash-slider-label">Output Format <span style={{ textTransform: 'uppercase' }}>{format}</span></div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                          {['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].map(f => (
                            <button key={f} onClick={() => setFormat(f)} style={{
                              padding: '6px 14px', fontFamily: 'inherit', fontSize: 12,
                              fontWeight: 500, textTransform: 'uppercase', cursor: 'pointer',
                              border: format === f ? '1px solid #080808' : '1px solid rgba(0,0,0,0.08)',
                              background: format === f ? 'rgba(0,0,0,0.06)' : 'transparent',
                              color: format === f ? '#080808' : '#6B7280',
                              borderRadius: 8, transition: 'all 0.2s'
                            }}>{f}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="dash-card dash-card-accent">
                    <p className="dash-card-title">04 — Generate</p>
                    <button className="dash-gen-btn" onClick={generating ? () => { abortControllerRef.current?.abort(); setGenerating(false); setGenStatus("Generation cancelled."); } : handleGenerate} disabled={!text.trim() || text.length > 40000} style={generating ? { background: "#ef4444" } : {}}>
                      {generating ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                             Cancel ✕
                          </span>
                      ) : 'Generate Speech →'}
                    </button>
                    {genStatus && <p style={{ fontSize: 13, color: '#6B7280', marginTop: 12, lineHeight: 1.6, fontWeight: 500 }}>{genStatus}</p>}
                    {genError && <p className="dash-error-msg">{genError}</p>}
                  </div>
                  {audioUrl && (
                    <div className="dash-audio-card" style={{ marginTop: 16 }}>
                      <p className="dash-audio-label">Generated Audio</p>
                      
                      <audio 
                        controls 
                        ref={audioRef}
                        src={audioUrl} 
                        style={{ width: '100%', marginBottom: 16 }}
                        onLoadedData={(e) => {
                          const el = e.currentTarget;
                          if (el.dataset.resumeTime) {
                            el.currentTime = parseFloat(el.dataset.resumeTime);
                            if (el.dataset.resumePlaying === 'true') {
                              el.play().catch(() => {});
                            }
                            el.dataset.resumeTime = '';
                            el.dataset.resumePlaying = '';
                          }
                        }}
                      />

                      {generationComplete && (
                          <a href={audioUrl} download={`soviron-output.${format}`} className="dash-download-btn">↓ Download {format.toUpperCase()}</a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── CLONE TAB ── */}
          {tab === 'clone' && (
            <>
              <div className="dash-page-header">
                <p className="dash-page-eyebrow">Studio</p>
                <h1 className="dash-page-title">Clone a Voice</h1>
              </div>
              {!isPaid && (
                <div className="dash-locked">
                  <p className="dash-locked-title">Paid Feature</p>
                  <p className="dash-locked-sub">Voice saving is available on paid plans. Free users can still upload a sample per session.</p>
                  <a href="/pricing" className="dash-upgrade-link">Upgrade from ₹79 →</a>
                </div>
              )}
              <div className="dash-clone-grid" style={{ opacity: isPaid ? 1 : 0.4, pointerEvents: isPaid ? 'auto' : 'none' }}>
                <div>
                  <div className="dash-card dash-card-accent" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">Voice Details</p>
                    <div className="dash-field">
                      <label className="dash-field-label">Voice Name *</label>
                      <input className="dash-field-input" placeholder="e.g. My Podcast Voice" value={cloneName} onChange={e => setCloneName(e.target.value)} />
                    </div>
                    <div className="dash-field">
                      <label className="dash-field-label">Language *</label>
                      <select className="dash-field-input" value={cloneLanguage} onChange={e => setCloneLanguage(e.target.value)}>
                        <option>Hindi</option><option>English</option><option>Marathi</option>
                        <option>Tamil</option><option>Telugu</option><option>Bengali</option>
                        <option>Kannada</option><option>Gujarati</option><option>Punjabi</option>
                        <option>Malayalam</option><option>Odia</option><option>Urdu</option><option>Other</option>
                      </select>
                    </div>
                    <div className="dash-field">
                      <label className="dash-field-label">Gender</label>
                      <select className="dash-field-input" value={cloneGender} onChange={e => setCloneGender(e.target.value)}>
                        <option>Male</option><option>Female</option><option>Neutral</option>
                      </select>
                    </div>
                    <div className="dash-field">
                      <label className="dash-field-label">Description (optional)</label>
                      <input className="dash-field-input" placeholder="e.g. Deep and calm, news anchor tone" value={cloneDescription} onChange={e => setCloneDescription(e.target.value)} />
                    </div>
                  </div>
                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">Preview Text (optional)</p>
                    <input className="dash-field-input" style={{ width: '100%' }} placeholder="Enter text to test this voice after saving..." value={clonePreviewText} onChange={e => setClonePreviewText(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="dash-card" style={{ marginBottom: 2 }}>
                    <p className="dash-card-title">Upload Voice Sample</p>
                    <div className="dash-clone-upload">
                      <input ref={cloneInputRef} type="file" accept="audio/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setCloneFile(f); setCloneFileName(f.name); } }} />
                      {cloneFileName ? <p className="dash-clone-upload-selected">✓ {cloneFileName}</p> : (<><div className="dash-upload-icon">🎤</div><p className="dash-clone-upload-title">Drop file or click to upload</p><p className="dash-clone-upload-sub">MP3, WAV, M4A · up to 20MB</p></>)}
                    </div>
                    <ul className="dash-req-list" style={{ marginTop: 16 }}>
                      <li>Minimum 10 seconds, 30+ recommended</li>
                      <li>Only one speaker in the audio</li>
                      <li>No background music or noise</li>
                      <li>Speak clearly and naturally</li>
                    </ul>
                  </div>
                  <div className="dash-card dash-card-accent">
                    <button className="dash-gen-btn" onClick={handleSaveVoice} disabled={cloneSaving || !cloneFile || !cloneName.trim()}>
                      {cloneSaving ? 'Saving Voice...' : 'Save Voice Clone →'}
                    </button>
                    {cloneError && <p className="dash-error-msg">{cloneError}</p>}
                    {cloneSuccess && <p className="dash-success-msg">✓ Voice saved successfully!</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── VOICES TAB ── */}
          {tab === 'voices' && (
            <>
              <div className="dash-page-header">
                <p className="dash-page-eyebrow">Studio</p>
                <h1 className="dash-page-title">My Voices</h1>
              </div>
              <div className="dash-voices-grid">
                {voices.length === 0 ? (
                  <div className="dash-empty-voices">
                    <p className="dash-empty-voices-title">No voices saved yet</p>
                    <p className="dash-empty-voices-sub">Clone your first voice to see it here</p>
                  </div>
                ) : voices.map(v => (
                  <div key={v.id} className="dash-voice-card">
                    <p className="dash-voice-card-name">{v.name}</p>
                    <div className="dash-voice-card-tags">
                      <span className="dash-voice-tag">{v.language}</span>
                      <span className="dash-voice-tag">{v.gender}</span>
                    </div>
                    {v.description && <p className="dash-voice-card-desc">{v.description}</p>}
                    <div className="dash-voice-card-actions">
                      <button className="dash-btn-use" onClick={() => { setSelectedVoice(v); setTab('generate'); }}>Use Voice</button>
                      <button className="dash-btn-delete" onClick={() => handleDeleteVoice(v.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── API TAB ── */}
          {tab === 'api' && (
            <>
              <div className="dash-page-header">
                <p className="dash-page-eyebrow">Developer</p>
                <h1 className="dash-page-title">API Access</h1>
              </div>

              {!isApiPlan ? (
                <div className="dash-locked">
                  <p className="dash-locked-title">Creator Plan Required</p>
                  <p className="dash-locked-sub">API access is available on Creator, Pro, and Studio plans.</p>
                  <a href="/pricing" className="dash-upgrade-link">Upgrade from ₹349 →</a>
                </div>
              ) : (
                <>
                  <div className="dash-card dash-card-accent" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">Generate API Key</p>
                    <div className="dash-key-gen-row">
                      <input
                        className="dash-field-input"
                        style={{ flex: 1 }}
                        placeholder="Key name (e.g. Production, Testing)"
                        value={apiKeyName}
                        onChange={e => setApiKeyName(e.target.value)}
                      />
                      <button
                        className="dash-gen-btn"
                        style={{ width: 'auto', padding: '13px 24px' }}
                        onClick={handleGenerateKey}
                        disabled={apiLoading}
                      >
                        {apiLoading ? 'Generating...' : 'Generate Key →'}
                      </button>
                    </div>
                    {apiError && <p className="dash-error-msg">{apiError}</p>}
                  </div>

                  {apiKeys.filter(k => k.is_active).length > 0 && (
                    <div className="dash-card" style={{ marginBottom: 16 }}>
                      <p className="dash-card-title">Your API Keys</p>
                      {apiKeys.filter(k => k.is_active).map(k => (
                        <div key={k.id} className="dash-api-key-row">
                          <div style={{ minWidth: 0 }}>
                            <p className="dash-api-key-name">{k.name}</p>
                            <p className="dash-api-key-value">{k.key}</p>
                            <p className="dash-api-key-meta">
                              Created {new Date(k.created_at).toLocaleDateString()}
                              {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="dash-api-key-actions">
                            <button className="dash-btn-copy" onClick={() => copyToClipboard(k.key)}>
                              {copiedKey === k.key ? '✓ Copied' : 'Copy'}
                            </button>
                            <button className="dash-btn-revoke" onClick={() => handleRevokeKey(k.id)}>Revoke</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="dash-card" style={{ marginBottom: 16 }}>
                    <p className="dash-card-title">Usage Example</p>
                    <div className="dash-code-block">{`curl -X POST https://soviron.vercel.app/api/tts \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello from Soviron API", "speed": 1.0, "pitch": 0}' \\
  --output speech.wav`}</div>
                  </div>

                  <div className="dash-card">
                    <p className="dash-card-title">Parameters</p>
                    <div className="dash-code-block">{`text        string   required   Text to convert (max 50,000 chars)
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

      <VoiceLibrary
        isOpen={showVoiceLibrary}
        onClose={() => setShowVoiceLibrary(false)}
        onSelect={(voice, type) => {
          if (type === 'default') {
            setSelectedDefaultVoice(voice as DefaultVoice);
            setSelectedVoice(null);
          } else {
            setSelectedVoice(voice as Voice);
            setSelectedDefaultVoice(null);
          }
          setSessionVoiceFile(null);
          setSessionVoiceFileName('');
          setShowVoiceLibrary(false);
        }}
        selectedVoiceId={selectedDefaultVoice?.id ?? selectedVoice?.id ?? null}
        userId={user?.id || ''}
      />
    </>
  );
}
