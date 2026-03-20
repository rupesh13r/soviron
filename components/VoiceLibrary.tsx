'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──
export type DefaultVoice = {
  id: number;
  speaker_id: string;
  dataset: string;
  name: string;
  description: string;
  gender: string;
  age: string;
  age_group: string;
  accent: string;
  region: string;
  tone: string;
  audio_ref_url: string;
  is_active: boolean;
  created_at: string;
};

type ClonedVoice = {
  id: string;
  name: string;
  language: string;
  gender: string;
  description: string;
  file_path: string;
  created_at: string;
};

type VoiceLibraryProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (voice: DefaultVoice | ClonedVoice, type: 'default' | 'cloned') => void;
  selectedVoiceId: string | number | null;
  userId: string;
};

// ── Filter Config ──
type FilterChip = { label: string; value: string; match: (v: DefaultVoice) => boolean };
const FILTER_CHIPS: FilterChip[] = [
  { label: 'Female', value: 'female', match: v => v.gender?.toLowerCase() === 'female' },
  { label: 'Male', value: 'male', match: v => v.gender?.toLowerCase() === 'male' },
  { label: 'Hindi', value: 'hindi', match: v => v.description?.toLowerCase().includes('hindi') || v.name?.toLowerCase().includes('hindi') },
  { label: 'Arabic', value: 'arabic', match: v => v.description?.toLowerCase().includes('arabic') || v.name?.toLowerCase().includes('arabic') },
  { label: 'French', value: 'french', match: v => v.description?.toLowerCase().includes('french') || v.name?.toLowerCase().includes('french') },
  { label: 'Spanish', value: 'spanish', match: v => v.description?.toLowerCase().includes('spanish') || v.name?.toLowerCase().includes('spanish') },
  { label: 'German', value: 'german', match: v => v.description?.toLowerCase().includes('german') || v.name?.toLowerCase().includes('german') },
  { label: 'Chinese', value: 'chinese', match: v => v.description?.toLowerCase().includes('chinese') || v.name?.toLowerCase().includes('chinese') },
  { label: 'Japanese', value: 'japanese', match: v => v.description?.toLowerCase().includes('japanese') || v.name?.toLowerCase().includes('japanese') },
  { label: 'English', value: 'english', match: v => v.description?.toLowerCase().includes('english') || v.name?.toLowerCase().includes('english') },
  { label: 'Young Adult', value: 'young-adult', match: v => v.age_group?.toLowerCase() === 'young-adult' },
  { label: 'Middle Aged', value: 'middle-aged', match: v => v.age_group?.toLowerCase() === 'middle-aged' },
];

const PAGE_SIZE = 20;

// ── Deterministic 3D gradient helper ──
function voiceHues(id: number | string): [number, number, number] {
  const n = typeof id === 'number' ? id : id.charCodeAt(0) * 137 + id.charCodeAt(id.length - 1) * 59;
  const h1 = (n * 37) % 360;
  const h2 = (h1 + 40 + (n % 60)) % 360;
  const h3 = (h1 + 80 + (n % 40)) % 360;
  return [h1, h2, h3];
}

function voiceAvatarStyle(id: number | string): React.CSSProperties {
  const [h1, h2, h3] = voiceHues(id);
  return {
    background: `linear-gradient(135deg, hsl(${h1}, 70%, 45%), hsl(${h2}, 80%, 35%), hsl(${h3}, 60%, 40%))`,
    backgroundSize: '200% 200%',
    animation: 'vl-gradientShift 3s ease infinite',
    boxShadow: `0 4px 15px hsla(${h1}, 70%, 45%, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
  };
}

function voiceInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Component ──
export default function VoiceLibrary({ isOpen, onClose, onSelect, selectedVoiceId, userId }: VoiceLibraryProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'my_voices'>('library');
  const [defaultVoices, setDefaultVoices] = useState<DefaultVoice[]>([]);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [bookmarks, setBookmarks] = useState<(number | string)[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('soviron_voice_bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {}
  }, []);

  const saveBookmarks = (next: (number | string)[]) => {
    setBookmarks(next);
    try { localStorage.setItem('soviron_voice_bookmarks', JSON.stringify(next)); } catch {}
  };

  const toggleBookmark = (id: number | string) => {
    const exists = bookmarks.includes(id);
    saveBookmarks(exists ? bookmarks.filter(b => b !== id) : [...bookmarks, id]);
  };

  // Fetch voices from Supabase
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      supabase.from('default_voices').select('*').eq('is_active', true).order('id'),
      supabase.from('default_voices_2').select('*').eq('is_active', true).order('id'),
      userId ? supabase.from('voices').select('*').eq('user_id', userId).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    ]).then(([defRes, def2Res, cloneRes]) => {
      if (defRes.data || def2Res.data) {
        const combined = [...(defRes.data || []), ...(def2Res.data || [])];
        setDefaultVoices(combined);
        // Verification: check for duplicates and total count
        const ids = combined.map((v: DefaultVoice) => v.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) console.warn('[VoiceLibrary] Duplicate voice IDs detected in data!');
        if (ids.length !== 100) console.warn(`[VoiceLibrary] Expected 100 voices, got ${ids.length}`);
        console.log(`[VoiceLibrary] Loaded ${ids.length} default voices, ${uniqueIds.size} unique`);
      }
      if (cloneRes.data) setClonedVoices(cloneRes.data as ClonedVoice[]);
      setLoading(false);
    });
  }, [isOpen, userId]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) { setSearch(''); setActiveFilters([]); setPage(1); }
  }, [isOpen]);

  // ── Multi-Filter + Search Logic ──
  const applyFilters = (list: DefaultVoice[]) => {
    let result = list;
    if (activeFilters.length > 0) {
      result = result.filter(v => activeFilters.every(fv => {
        const chip = FILTER_CHIPS.find(c => c.value === fv);
        return chip ? chip.match(v) : true;
      }));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.accent.toLowerCase().includes(q) ||
        v.region.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const filteredDefault = useMemo(() => applyFilters(defaultVoices), [defaultVoices, activeFilters, search]);

  const filteredCloned = useMemo(() => {
    if (!search.trim()) return clonedVoices;
    const q = search.toLowerCase();
    return clonedVoices.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.language?.toLowerCase().includes(q)
    );
  }, [clonedVoices, search]);

  // Recommended = bookmarked (filtered) or first 6 (filtered), only when no search/filter active
  const hasActiveFiltersOrSearch = activeFilters.length > 0 || search.trim().length > 0;

  const recommendedVoices = useMemo(() => {
    if (hasActiveFiltersOrSearch) return [];
    const bookmarkedFiltered = defaultVoices.filter(v => bookmarks.includes(v.id));
    if (bookmarkedFiltered.length > 0) return bookmarkedFiltered.slice(0, 6);
    return defaultVoices.slice(0, 6);
  }, [defaultVoices, bookmarks, hasActiveFiltersOrSearch]);

  const recommendedIds = useMemo(() => new Set(recommendedVoices.map(v => v.id)), [recommendedVoices]);

  // All Voices = filteredDefault MINUS recommended (to avoid duplicates)
  const allVoicesExclRecommended = useMemo(() => {
    if (hasActiveFiltersOrSearch) return filteredDefault;
    return filteredDefault.filter(v => !recommendedIds.has(v.id));
  }, [filteredDefault, recommendedIds, hasActiveFiltersOrSearch]);

  const totalPages = Math.ceil(allVoicesExclRecommended.length / PAGE_SIZE);
  const pagedVoices = allVoicesExclRecommended.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Verification log
  useMemo(() => {
    if (defaultVoices.length === 0) return;
    const recCount = recommendedVoices.length;
    const allCount = allVoicesExclRecommended.length;
    console.log(`Recommended: ${recCount}, All Voices: ${allCount}, Total: ${recCount + allCount}`);
    // Check for duplicates
    const allIds = [...recommendedVoices.map(v => v.id), ...allVoicesExclRecommended.map(v => v.id)];
    const seen = new Set<number>();
    for (const id of allIds) {
      if (seen.has(id)) console.warn(`[VoiceLibrary] Duplicate voice id on screen: ${id}`);
      seen.add(id);
    }
    if (!hasActiveFiltersOrSearch && seen.size !== defaultVoices.length) {
      console.warn(`[VoiceLibrary] Total on screen (${seen.size}) !== total voices (${defaultVoices.length})`);
    }
  }, [recommendedVoices, allVoicesExclRecommended, defaultVoices, hasActiveFiltersOrSearch]);

  // ── Audio Preview ──
  const handlePlay = (id: number | string, url: string) => {
    if (playingId === id) {
      audioElRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    const audio = new Audio(url);
    audioElRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
    setPlayingId(id);
  };

  // Cleanup audio on close
  useEffect(() => {
    if (!isOpen && audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
      setPlayingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Card Renderer ──
  const renderDefaultCard = (v: DefaultVoice) => {
    const isSelected = selectedVoiceId === v.id;
    const isPlaying = playingId === v.id;
    const isBookmarked = bookmarks.includes(v.id);
    return (
      <motion.div
        key={v.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`vl-card ${isSelected ? 'vl-card-selected' : ''}`}
      >
        <div className="vl-card-top">
          <div className="vl-avatar" style={voiceAvatarStyle(v.id)}>
            {isPlaying ? (
              <div className="vl-waveform">
                <span /><span /><span /><span />
              </div>
            ) : (
              <span className="vl-initials">{voiceInitials(v.name)}</span>
            )}
          </div>
          <div className="vl-card-info">
            <p className="vl-card-name">{v.name}</p>
            <p className="vl-card-desc">{v.description}</p>
          </div>
          <button
            className={`vl-bookmark ${isBookmarked ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleBookmark(v.id); }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>
        <div className="vl-card-tags">
          {v.accent && <span className="vl-tag">{v.accent}</span>}
          {v.gender && <span className="vl-tag">{v.gender}</span>}
          {v.age_group && <span className="vl-tag">{v.age_group}</span>}
        </div>
        <div className="vl-card-actions">
          <button
            className={`vl-btn-play ${isPlaying ? 'playing' : ''}`}
            onClick={() => handlePlay(v.id, v.audio_ref_url)}
          >
            {isPlaying ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Preview</>
            )}
          </button>
          <button
            className={`vl-btn-use ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(v, 'default')}
          >
            {isSelected ? '✓ Selected' : 'Use Voice'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderClonedCard = (v: ClonedVoice) => {
    const isSelected = selectedVoiceId === v.id;
    return (
      <motion.div
        key={v.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`vl-card ${isSelected ? 'vl-card-selected' : ''}`}
      >
        <div className="vl-card-top">
          <div className="vl-avatar" style={voiceAvatarStyle(v.id)}>
            <span className="vl-initials">{voiceInitials(v.name)}</span>
          </div>
          <div className="vl-card-info">
            <p className="vl-card-name">{v.name}</p>
            <p className="vl-card-desc">{v.description || 'Custom cloned voice'}</p>
          </div>
        </div>
        <div className="vl-card-tags">
          {v.language && <span className="vl-tag">{v.language}</span>}
          {v.gender && <span className="vl-tag">{v.gender}</span>}
          <span className="vl-tag vl-tag-clone">Cloned</span>
        </div>
        <div className="vl-card-actions">
          <button
            className={`vl-btn-use ${isSelected ? 'selected' : ''}`}
            style={{ flex: 1 }}
            onClick={() => onSelect(v, 'cloned')}
          >
            {isSelected ? '✓ Selected' : 'Use Voice'}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <style>{`
        /* ── VOICE LIBRARY OVERLAY ── */
        .vl-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; justify-content: flex-end;
        }
        .vl-panel {
          width: 100%; max-width: 820px; height: 100%;
          background: #FFFFFF; display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          overflow: hidden;
        }

        /* HEADER */
        .vl-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 28px 0; flex-shrink: 0;
        }
        .vl-title { font-size: 28px; font-weight: 700; color: #080808; letter-spacing: -0.03em; }
        .vl-close {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08);
          background: transparent; color: #6B7280; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .vl-close:hover { background: rgba(0,0,0,0.04); color: #080808; border-color: rgba(0,0,0,0.15); }

        /* TABS */
        .vl-tabs {
          display: flex; gap: 0; padding: 16px 28px 0; flex-shrink: 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .vl-tab {
          padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
          border: none; background: none; color: #9CA3AF;
          border-bottom: 2px solid transparent; transition: all 0.2s;
          font-family: inherit; letter-spacing: 0.02em;
        }
        .vl-tab:hover { color: #6B7280; }
        .vl-tab.active { color: #080808; border-bottom-color: #080808; }

        /* SEARCH + FILTERS */
        .vl-controls { padding: 16px 28px; flex-shrink: 0; }
        .vl-search {
          width: 100%; padding: 11px 16px 11px 40px; border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px; font-size: 14px; font-family: inherit; color: #080808;
          outline: none; transition: all 0.2s; background: #FFFFFF;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: 14px center;
        }
        .vl-search:focus { border-color: rgba(0,0,0,0.2); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
        .vl-search::placeholder { color: #9CA3AF; }
        .vl-filters {
          display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;
        }
        .vl-chip {
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
          border: 1px solid rgba(0,0,0,0.08); background: transparent; color: #6B7280;
          cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .vl-chip:hover { border-color: rgba(0,0,0,0.2); color: #080808; }
        .vl-chip.active { background: #080808; color: #FFFFFF; border-color: #080808; }

        /* BODY SCROLL */
        .vl-body { flex: 1; overflow-y: auto; padding: 0 28px 28px; }

        /* SECTION LABELS */
        .vl-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9CA3AF; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;
        }
        .vl-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.06); }

        /* GRID */
        .vl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }

        /* CARD */
        .vl-card {
          background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px;
          padding: 18px; transition: all 0.25s; cursor: default;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .vl-card:hover {
          border-color: rgba(0,0,0,0.15); box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .vl-card-selected {
          border-color: #080808 !important; box-shadow: 0 0 0 1px #080808, 0 4px 20px rgba(0,0,0,0.1) !important;
        }

        .vl-card-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .vl-avatar {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: #FFF; font-weight: 700; font-size: 14px; letter-spacing: 0.02em;
          position: relative; overflow: hidden;
        }
        .vl-avatar::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.22) 50%, transparent 55%);
          animation: vl-shine 3s ease-in-out infinite;
        }
        @keyframes vl-gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes vl-shine {
          0%, 100% { transform: translateX(-120%); }
          60%, 80% { transform: translateX(120%); }
        }
        .vl-initials { text-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 1; }
        .vl-card-info { flex: 1; min-width: 0; }
        .vl-card-name { font-size: 14px; font-weight: 600; color: #080808; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vl-card-desc { font-size: 12px; color: #9CA3AF; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .vl-bookmark {
          width: 28px; height: 28px; border-radius: 8px; border: none;
          background: transparent; color: #D1D5DB; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .vl-bookmark:hover { color: #F59E0B; background: rgba(245,158,11,0.06); }
        .vl-bookmark.active { color: #F59E0B; }

        .vl-card-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px; }
        .vl-tag {
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
          color: #6B7280; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06);
          border-radius: 4px; padding: 2px 7px;
        }
        .vl-tag-clone { background: rgba(99,102,241,0.08); color: #6366F1; border-color: rgba(99,102,241,0.15); }

        .vl-card-actions { display: flex; gap: 8px; }
        .vl-btn-play {
          flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: 1px solid rgba(0,0,0,0.08); background: transparent; color: #6B7280;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .vl-btn-play:hover { border-color: rgba(0,0,0,0.2); color: #080808; }
        .vl-btn-play.playing { border-color: #080808; color: #080808; background: rgba(0,0,0,0.03); }

        .vl-btn-use {
          flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: none; background: #080808; color: #FFFFFF;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .vl-btn-use:hover { transform: scale(1.03); box-shadow: 0 2px 12px rgba(0,0,0,0.15); }
        .vl-btn-use.selected { background: #22c55e; }

        /* WAVEFORM ANIMATION */
        .vl-waveform { display: flex; align-items: center; gap: 2px; height: 20px; }
        .vl-waveform span {
          display: block; width: 3px; border-radius: 2px; background: #FFF;
          animation: vl-wave 0.8s ease-in-out infinite;
        }
        .vl-waveform span:nth-child(1) { height: 8px; animation-delay: 0s; }
        .vl-waveform span:nth-child(2) { height: 16px; animation-delay: 0.15s; }
        .vl-waveform span:nth-child(3) { height: 12px; animation-delay: 0.3s; }
        .vl-waveform span:nth-child(4) { height: 6px; animation-delay: 0.45s; }
        @keyframes vl-wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }

        /* PAGINATION */
        .vl-pagination {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 20px 0 4px;
        }
        .vl-page-btn {
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: 1px solid rgba(0,0,0,0.08); background: transparent; color: #6B7280;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .vl-page-btn:hover { border-color: rgba(0,0,0,0.2); color: #080808; }
        .vl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .vl-page-btn.active { background: #080808; color: #FFF; border-color: #080808; }
        .vl-page-info { font-size: 12px; color: #9CA3AF; font-weight: 500; }

        /* EMPTY */
        .vl-empty {
          padding: 60px 20px; text-align: center;
        }
        .vl-empty-title { font-size: 20px; font-weight: 600; color: #6B7280; margin-bottom: 6px; }
        .vl-empty-sub { font-size: 13px; color: #9CA3AF; }

        /* LOADING */
        .vl-loading {
          display: flex; align-items: center; justify-content: center;
          padding: 60px; color: #9CA3AF; font-size: 14px; font-weight: 500;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .vl-panel { max-width: 100%; }
          .vl-grid { grid-template-columns: 1fr; }
          .vl-header, .vl-controls, .vl-body { padding-left: 16px; padding-right: 16px; }
          .vl-tabs { padding-left: 16px; padding-right: 16px; }
          .vl-title { font-size: 22px; }
          .vl-filters { gap: 4px; }
          .vl-chip { padding: 5px 10px; font-size: 11px; }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="vl-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <motion.div
              className="vl-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="vl-header">
                <h2 className="vl-title">Voice Library</h2>
                <button className="vl-close" onClick={onClose}>✕</button>
              </div>

              {/* Tabs */}
              <div className="vl-tabs">
                <button className={`vl-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
                  Library ({defaultVoices.length})
                </button>
                <button className={`vl-tab ${activeTab === 'my_voices' ? 'active' : ''}`} onClick={() => setActiveTab('my_voices')}>
                  My Voices ({clonedVoices.length})
                </button>
              </div>

              {/* Search + Filters */}
              <div className="vl-controls">
                <input
                  className="vl-search"
                  placeholder="Search by name, accent, region..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                {activeTab === 'library' && (
                  <div className="vl-filters">
                    <button
                      className={`vl-chip ${activeFilters.length === 0 ? 'active' : ''}`}
                      onClick={() => { setActiveFilters([]); setPage(1); }}
                    >
                      All
                    </button>
                    {FILTER_CHIPS.map(chip => (
                      <button
                        key={chip.value}
                        className={`vl-chip ${activeFilters.includes(chip.value) ? 'active' : ''}`}
                        onClick={() => {
                          setActiveFilters(prev =>
                            prev.includes(chip.value)
                              ? prev.filter(f => f !== chip.value)
                              : [...prev, chip.value]
                          );
                          setPage(1);
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="vl-body">
                {loading ? (
                  <div className="vl-loading">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      Loading voices...
                    </motion.span>
                  </div>
                ) : activeTab === 'library' ? (
                  <>
                    {/* Recommended / Bookmarked (only when no filters/search) */}
                    {recommendedVoices.length > 0 && (
                      <>
                        <p className="vl-section-label">
                          {bookmarks.some(b => defaultVoices.some(v => v.id === b)) ? '★ Bookmarked' : 'Recommended'}
                        </p>
                        <div className="vl-grid">
                          {recommendedVoices.map(renderDefaultCard)}
                        </div>
                      </>
                    )}

                    {/* All Voices (excluding recommended to avoid duplicates) */}
                    <p className="vl-section-label">
                      {hasActiveFiltersOrSearch ? `Results (${filteredDefault.length})` : `All Voices (${allVoicesExclRecommended.length})`}
                    </p>
                    {pagedVoices.length > 0 ? (
                      <>
                        <div className="vl-grid">
                          <AnimatePresence mode="popLayout">
                            {pagedVoices.map(renderDefaultCard)}
                          </AnimatePresence>
                        </div>
                        {totalPages > 1 && (
                          <div className="vl-pagination">
                            <button className="vl-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                            <span className="vl-page-info">Page {page} of {totalPages}</span>
                            <button className="vl-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="vl-empty">
                        <p className="vl-empty-title">No voices found</p>
                        <p className="vl-empty-sub">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </>
                ) : (
                  /* My Voices Tab */
                  filteredCloned.length > 0 ? (
                    <div className="vl-grid" style={{ marginTop: 16 }}>
                      <AnimatePresence mode="popLayout">
                        {filteredCloned.map(renderClonedCard)}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="vl-empty">
                      <p className="vl-empty-title">No cloned voices yet</p>
                      <p className="vl-empty-sub">Clone a voice from the dashboard to see it here</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
