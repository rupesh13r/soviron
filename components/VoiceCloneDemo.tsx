"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const BASE = "https://yhnepjukcumpvgppkwoj.supabase.co/storage/v1/object/public";

const DEMO_VOICES = [
  {
    lang: "Hindi",
    flag: "🇮🇳",
    code: "hi",
    speaker: "Arjun",
    text: "आधुनिक वाक् संश्लेषण प्रणालियों की जटिल संरचना ट्रांसफॉर्मर मॉडल और ध्वनिक विशेषता निष्कर्षण के बीच एक सुंदर परस्पर क्रिया को प्रकट करती है। जो कभी एक अजेय चुनौती मानी जाती थी — मानवीय स्वर के सूक्ष्म बारीकियों को पकड़ना, लय में वे मुश्किल से बोधगम्य परिवर्तन जो भावनाओं को व्यक्त करते हैं — वह अब उल्लेखनीय निष्ठा के साथ प्राप्त करने योग्य हो गया है। आवाज़ संश्लेषण अब विज्ञान कथा तक सीमित एक दूर का सपना नहीं है।",
    original: `${BASE}/default-voices/default_voices/hi/hi_014_male_masculine.wav`,
    clone: `${BASE}/demo-voices/hindi_clone.wav`,
  },
  {
    lang: "English",
    flag: "🇬🇧",
    code: "en",
    speaker: "James",
    text: "The intricate architecture of modern text-to-speech systems reveals an elegant interplay between transformer models and acoustic feature extraction. What was once considered an insurmountable challenge — capturing the subtle nuances of human intonation, the barely perceptible shifts in rhythm that convey emotion — has now become achievable with remarkable fidelity. Voice synthesis is no longer a distant dream confined to science fiction; it is a sophisticated reality that is fundamentally reshaping how we communicate, create, and connect across the boundaries of language and distance.",
    original: `${BASE}/default-voices/default/p254.wav`,
    clone: `${BASE}/demo-voices/english_clone.wav`,
  },
  {
    lang: "Spanish",
    flag: "🇪🇸",
    code: "es",
    speaker: "Carlos",
    text: "La intrincada arquitectura de los modernos sistemas de síntesis de voz revela una elegante interacción entre los modelos de transformadores y la extracción de características acústicas. Lo que alguna vez se consideró un desafío insuperable — capturar los sutiles matices de la entonación humana, los cambios apenas perceptibles en el ritmo que transmiten emociones — ahora es alcanzable con una fidelidad notable. La síntesis de voz ya no es un sueño lejano confinado a la ciencia ficción; es una realidad sofisticada que está remodelando fundamentalmente la forma en que nos comunicamos.",
    original: `${BASE}/default-voices/default_voices/es/es_005_unknown.wav`,
    clone: `${BASE}/demo-voices/spanish_clone.wav`,
  },
  {
    lang: "French",
    flag: "🇫🇷",
    code: "fr",
    speaker: "Claire",
    text: "L'architecture complexe des systèmes modernes de synthèse vocale révèle une interaction élégante entre les modèles de transformateurs et l'extraction de caractéristiques acoustiques. Ce qui était autrefois considéré comme un défi insurmontable — capturer les nuances subtiles de l'intonation humaine, les changements à peine perceptibles dans le rythme qui transmettent les émotions — est désormais réalisable avec une fidélité remarquable. La synthèse vocale n'est plus un rêve lointain confiné à la science-fiction; c'est une réalité sophistiquée qui remodèle fondamentalement notre façon de communiquer.",
    original: `${BASE}/default-voices/default_voices/fr/fr_003_unknown.wav`,
    clone: `${BASE}/demo-voices/french_clone.wav`,
  },
  {
    lang: "German",
    flag: "🇩🇪",
    code: "de",
    speaker: "Hans",
    text: "Die komplizierte Architektur moderner Text-zu-Sprache-Systeme offenbart ein elegantes Zusammenspiel zwischen Transformatormodellen und akustischer Merkmalsextraktion. Was einst als unüberwindliche Herausforderung galt — die subtilen Nuancen menschlicher Intonation einzufangen, die kaum wahrnehmbaren Rhythmusverschiebungen, die Emotionen vermitteln — ist nun mit bemerkenswerter Wiedergabetreue erreichbar. Die Sprachsynthese ist nicht länger ein ferner Traum, der auf Science-Fiction beschränkt ist; sie ist eine hochentwickelte Realität, die grundlegend verändert, wie wir kommunizieren.",
    original: `${BASE}/default-voices/default_voices/de/de_002_male_masculine.wav`,
    clone: `${BASE}/demo-voices/german_clone.wav`,
  },
  {
    lang: "Arabic",
    flag: "🇸🇦",
    code: "ar",
    speaker: "Layla",
    text: "مرحباً، اسمي ليلى. أريد أن أريك مدى روعة عالم الصوت، وكيف يمكن لكل صوت أن يحمل هويته الفريدة الخاصة به.",
    original: `${BASE}/default-voices/default_voices/ar/ar_009_female_feminine.wav`,
    clone: `${BASE}/demo-voices/arabic_clone.wav`,
  },
];

function WaveformBars({ playing, color = "#000", barCount = 60 }: { playing: boolean; color?: string; barCount?: number }) {
  const isDark = color.includes("255");
  return (
    <div className="flex gap-px items-end justify-center overflow-hidden w-full" style={{ height: 48 }}>
      {[...Array(barCount)].map((_, i) => {
        const height = Math.sin(i * 0.314) * 42 + 50;
        return (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              background: isDark
                ? "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.2))"
                : "linear-gradient(to top, rgba(20,30,50,0.85), rgba(20,30,50,0.08))",
              maxWidth: 5,
            }}
            animate={playing
              ? { height: [`${height}%`, `${Math.min(100, height + 18)}%`, `${height}%`] }
              : { height: `${height}%` }}
            transition={{ duration: 2, repeat: playing ? Infinity : 0, delay: i * 0.03, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

function AudioPlayer({ label, sublabel, flag, url, dark = false }: {
  label: string; sublabel: string; flag: string; url: string; dark?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onLoaded = () => setDuration(a.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-3 ${dark ? "bg-black border-black" : "bg-gray-50 border-black/6"}`}>
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{flag}</span>
          <div>
            <p className={`text-xs font-semibold ${dark ? "text-white" : "text-black"}`}>{label}</p>
            <p className={`text-[10px] ${dark ? "text-white/40" : "text-gray-400"}`}>{sublabel}</p>
          </div>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${dark ? "bg-white/10 text-white/60" : "bg-black/6 text-gray-500"}`}>
          {dark ? "Clone" : "Source"}
        </span>
      </div>

      <WaveformBars playing={playing} color={dark ? "rgba(255,255,255,0.5)" : "#000"} barCount={60} />

      <div className="flex items-center gap-3">
        <button onClick={toggle}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${dark ? "bg-white/15 hover:bg-white/25" : "bg-black hover:bg-gray-800"}`}>
          {playing ? (
            <svg viewBox="0 0 12 12" width="10" height="10" fill="white">
              <rect x="2" y="1" width="3" height="10" rx="1" />
              <rect x="7" y="1" width="3" height="10" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" width="10" height="10" fill="white">
              <polygon points="2,1 11,6 2,11" />
            </svg>
          )}
        </button>
        <div className={`flex-1 h-1 rounded-full overflow-hidden cursor-pointer ${dark ? "bg-white/10" : "bg-black/8"}`}
          onClick={e => {
            const a = audioRef.current;
            if (!a || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
          }}>
          <div className={`h-full rounded-full ${dark ? "bg-white/60" : "bg-black"}`} style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }} />
        </div>
        <span className={`text-[10px] font-mono flex-shrink-0 ${dark ? "text-white/40" : "text-gray-400"}`}>
          {duration ? fmt(duration * progress) + " / " + fmt(duration) : "0:00"}
        </span>
      </div>
    </div>
  );
}

export function VoiceCloneDemo() {
  const [selected, setSelected] = useState(0);
  const voice = DEMO_VOICES[selected];

  return (
    <section id="demo" className="relative py-20 md:py-32 px-4 sm:px-6 bg-white w-full overflow-hidden">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Live Demo</p>
          <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tight mb-4">Hear the difference.</h2>
          <p className="text-xl text-gray-500 max-w-xl">Real voices. Real clones. Judge for yourself.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-black/8 overflow-hidden"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}>

          <div className="px-6 py-3.5 border-b border-black/6 flex items-center gap-2 bg-gray-50/80">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
            <p className="text-xs text-gray-400 mx-auto">soviron.tech — voice clone studio</p>
            <div className="w-16" />
          </div>

          <div className="px-6 pt-5 pb-0 border-b border-black/6">
            <div className="flex gap-1 flex-wrap pb-0">
              {DEMO_VOICES.map((v, i) => (
                <button key={v.code} onClick={() => setSelected(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-xl border-t border-x transition-all ${
                    selected === i
                      ? "bg-white border-black/8 text-black -mb-px pb-3"
                      : "bg-transparent border-transparent text-gray-400 hover:text-gray-600"
                  }`}>
                  <span>{v.flag}</span>
                  <span>{v.lang}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.div key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="p-6 md:p-8 flex flex-col gap-4">

            <div className="rounded-2xl bg-gray-50 border border-black/6 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Sample text</p>
              <p className="text-sm text-gray-700 leading-relaxed">{voice.text}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <AudioPlayer
                label={`${voice.speaker} — Original`}
                sublabel={`${voice.lang} · Studio recording`}
                flag={voice.flag}
                url={voice.original}
              />
              <AudioPlayer
                label={`${voice.speaker} — Clone`}
                sublabel={`${voice.lang} · Soviron AI`}
                flag={voice.flag}
                url={voice.clone}
                dark
              />
            </div>
          </motion.div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Source audio from publicly licensed datasets · Clone generated by Soviron
        </p>
      </div>
    </section>
  );
}
