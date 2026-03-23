"use client";
import { motion, useAnimationFrame } from "framer-motion";
import { Shield, Cpu, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useTyping(texts: string[], speed = 55) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [textIdx, setTextIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const text = texts[textIdx];
  useEffect(() => {
    const delay = deleting ? 22 : idx === text.length ? 1600 : speed;
    const t = setTimeout(() => {
      if (deleting) {
        setDisplayed(text.slice(0, idx - 1));
        setIdx(i => i - 1);
        if (idx <= 1) { setDeleting(false); setTextIdx(i => (i + 1) % texts.length); }
      } else {
        setDisplayed(text.slice(0, idx + 1));
        setIdx(i => i + 1);
        if (idx === text.length - 1) setTimeout(() => setDeleting(true), 3000);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [idx, deleting, text, speed, texts]);
  return { displayed, textIdx };
}

function WaveBar({ i, playing, color = "bg-black", total = 32 }: { i: number; playing: boolean; color?: string; total?: number }) {
  const isDark = color.includes("white");
  const height = Math.sin(i * 0.314) * 42 + 50;
  return (
    <motion.div
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
}

// All 23 languages with proper native text
const TTS_TEXTS = [
  { text: "नमस्कार, आज हम एक नई दुनिया की बात करेंगे। यह दुनिया विज्ञान और तकनीक से भरपूर है, जहाँ हर दिन कुछ नया होता है और हम सब मिलकर इसे बेहतर बना सकते हैं।", lang: "Hindi", flag: "🇮🇳" },
  { text: "مرحباً، اليوم سنستكشف شيئاً جديداً ورائعاً معاً في هذا العالم المثير. إن التكنولوجيا الحديثة تفتح لنا أبواباً لم نكن نتخيلها من قبل، وهذا هو المستقبل الذي ننتظره.", lang: "Arabic", flag: "🇸🇦" },
  { text: "God morgen, i dag vil vi opdage noget nyt og spændende sammen. Teknologien åbner nye døre for os hver dag, og vi er her for at udforske dem sammen med dig på denne fantastiske rejse.", lang: "Danish", flag: "🇩🇰" },
  { text: "Καλημέρα, σήμερα θα ανακαλύψουμε κάτι νέο και υπέροχο μαζί. Η τεχνολογία ανοίγει νέες πόρτες για εμάς κάθε μέρα και είμαστε εδώ για να τις εξερευνήσουμε μαζί.", lang: "Greek", flag: "🇬🇷" },
  { text: "Hyvää huomenta, tänään löydämme jotain uutta ja hienoa yhdessä. Teknologia avaa meille uusia ovia joka päivä, ja olemme täällä tutkimassa niitä kanssasi tällä hienolla matkalla.", lang: "Finnish", flag: "🇫🇮" },
  { text: "שלום, היום נגלה משהו חדש ומרתק יחד בעולם המדהים הזה. הטכנולוגיה פותחת בפנינו דלתות חדשות בכל יום, ואנחנו כאן כדי לחקור אותן יחד איתך במסע המיוחד הזה.", lang: "Hebrew", flag: "🇮🇱" },
  { text: "Selamat pagi, hari ini kita akan menjelajahi sesuatu yang baru dan menakjubkan bersama-sama. Teknologi membuka pintu-pintu baru bagi kita setiap hari dan kita berada di sini untuk menjelajahinya.", lang: "Malay", flag: "🇲🇾" },
  { text: "Goedemorgen, vandaag gaan we samen iets nieuws en bijzonders ontdekken. Technologie opent elke dag nieuwe deuren voor ons en we zijn hier om ze samen met jou te verkennen op deze reis.", lang: "Dutch", flag: "🇳🇱" },
  { text: "God morgen, i dag skal vi oppdage noe nytt og spennende sammen. Teknologien åpner nye dører for oss hver dag, og vi er her for å utforske dem sammen med deg på denne fantastiske reisen.", lang: "Norwegian", flag: "🇳🇴" },
  { text: "Dzień dobry, dziś odkryjemy razem coś nowego i fascynującego w tym niesamowitym świecie. Technologia otwiera przed nami nowe drzwi każdego dnia i jesteśmy tutaj, aby je razem eksplorować.", lang: "Polish", flag: "🇵🇱" },
  { text: "God morgon, idag ska vi tillsammans utforska något nytt och spännande. Teknologin öppnar nya dörrar för oss varje dag och vi är här för att utforska dem tillsammans med dig på denna resa.", lang: "Swedish", flag: "🇸🇪" },
  { text: "Habari za asubuhi, leo tutachunguza kitu kipya na cha kuvutia pamoja katika ulimwengu huu wa ajabu. Teknolojia inafungua milango mipya kwetu kila siku na tuko hapa kuchunguza pamoja nawe.", lang: "Swahili", flag: "🇹🇿" },
  { text: "Günaydın, bugün birlikte yeni ve heyecan verici bir şey keşfedeceğiz. Teknoloji her gün bize yeni kapılar açıyor ve bu harika yolculukta bunları seninle birlikte keşfetmek için buradayız.", lang: "Turkish", flag: "🇹🇷" },
  { text: "Good morning, today we will discover something new and amazing together in this incredible world. Technology opens new doors for us every single day and we are here to explore them with you on this journey.", lang: "English", flag: "🇬🇧" },
  { text: "早上好，今天我们将一起探索一个全新的美好世界，充满无限可能。技术每天都在为我们打开新的大门，我们在这里与您一起踏上这段精彩的探索之旅。", lang: "Chinese", flag: "🇨🇳" },
  { text: "おはようございます、今日は新しいことを一緒に発見しましょう。テクノロジーは毎日私たちに新しい扉を開いてくれます。この素晴らしい旅であなたと一緒に探索するためにここにいます。", lang: "Japanese", flag: "🇯🇵" },
  { text: "안녕하세요, 오늘은 새롭고 놀라운 것을 함께 발견해 봅시다. 기술은 매일 우리에게 새로운 문을 열어주고 있으며, 우리는 이 멋진 여정에서 당신과 함께 탐험하기 위해 여기에 있습니다.", lang: "Korean", flag: "🇰🇷" },
  { text: "Guten Morgen, heute werden wir gemeinsam etwas Neues und Faszinierendes entdecken. Die Technologie öffnet uns jeden Tag neue Türen und wir sind hier, um sie gemeinsam mit Ihnen auf dieser Reise zu erkunden.", lang: "German", flag: "🇩🇪" },
  { text: "Bonjour, aujourd'hui nous allons découvrir ensemble quelque chose de nouveau et d'étonnant. La technologie nous ouvre chaque jour de nouvelles portes et nous sommes là pour les explorer avec vous dans ce voyage.", lang: "French", flag: "🇫🇷" },
  { text: "Доброе утро, сегодня мы вместе откроем что-то новое и удивительное в этом невероятном мире. Технологии каждый день открывают перед нами новые двери и мы здесь, чтобы исследовать их вместе с вами.", lang: "Russian", flag: "🇷🇺" },
  { text: "Bom dia, hoje vamos descobrir juntos algo novo e incrível neste mundo maravilhoso. A tecnologia nos abre novas portas todos os dias e estamos aqui para explorá-las com você nesta jornada fantástica.", lang: "Portuguese", flag: "🇧🇷" },
  { text: "Buenos días, hoy vamos a explorar juntos algo nuevo y maravilloso en este increíble mundo. La tecnología nos abre nuevas puertas cada día y estamos aquí para explorarlas contigo en este viaje.", lang: "Spanish", flag: "🇪🇸" },
  { text: "Buongiorno, oggi scopriremo insieme qualcosa di nuovo e meraviglioso in questo mondo incredibile. La tecnologia ci apre nuove porte ogni giorno e siamo qui per esplorarle con te in questo viaggio.", lang: "Italian", flag: "🇮🇹" },
];

function TTSCard() {
  const { displayed, textIdx } = useTyping(TTS_TEXTS.map(t => t.text), 36);
  const current = TTS_TEXTS[textIdx];
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const prevIdx = useRef(textIdx);

  useEffect(() => {
    if (displayed.length === current.text.length) {
      const t1 = setTimeout(() => setGenerating(true), 300);
      const t2 = setTimeout(() => {
        setGenerating(false);
        setDone(true);
        setCountdown(10);
      }, 1800);
      const t3 = setTimeout(() => setDone(false), 11800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [displayed, current.text.length]);

  useEffect(() => {
    if (!done) return;
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    if (prevIdx.current !== textIdx) { setDone(false); setGenerating(false); setCountdown(10); prevIdx.current = textIdx; }
  }, [textIdx]);

  return (
    <div className="flex flex-col gap-3 flex-1">
      {/* Text box grows to fill all space */}
      <div className="rounded-2xl bg-gray-50 border border-black/6 p-4 flex flex-col gap-4 flex-1">
        <p className="text-sm text-gray-700 leading-relaxed font-mono break-words flex-1">
          {displayed}<span className="inline-block w-0.5 h-4 bg-black ml-0.5 align-middle animate-pulse" />
        </p>
        <div className="flex items-center gap-2">
          <motion.div key={textIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/10 text-xs font-medium text-gray-700 flex-shrink-0">
            <span className="text-base leading-none">{current.flag}</span><span>{current.lang}</span>
          </motion.div>
          <motion.div
            className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${done ? "bg-black text-white" : generating ? "bg-gray-200 text-gray-500" : "bg-black text-white"}`}
            animate={generating ? { opacity: [1, 0.5, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }}>
            {done ? "▶ Play" : generating ? "Generating..." : "Generate →"}
          </motion.div>
        </div>
      </div>
      {/* Waveform always visible */}
      <div className="flex items-center gap-2 bg-black rounded-2xl p-3">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 12 12" width="10" height="10" fill="white"><polygon points="3,1 11,6 3,11" /></svg>
        </div>
        <div className="flex gap-0.5 items-end flex-1 overflow-hidden" style={{ height: 48 }}>
          {[...Array(60)].map((_, i) => <WaveBar key={i} i={i} playing={done} color="bg-white/60" total={60} />)}
        </div>
        <motion.span
          key={countdown}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/50 text-[10px] font-mono flex-shrink-0">
          {done ? `0:${String(countdown).padStart(2, "0")}` : "0:10"}
        </motion.span>
      </div>
    </div>
  );
}

// All 23 languages history with scroll simulation
const ALL_HISTORY = [
  { name: "Priya", lang: "hi", flag: "🇮🇳", text: "नमस्कार, मुझे आज एक खास बात बतानी है...", time: "just now", dur: "0:04" },
  { name: "Omar", lang: "ar", flag: "🇸🇦", text: "مرحباً، اليوم سنتحدث عن شيء مهم...", time: "1 min ago", dur: "0:06" },
  { name: "Lars", lang: "da", flag: "🇩🇰", text: "God morgen, i dag vil vi opdage noget nyt...", time: "3 min ago", dur: "0:05" },
  { name: "Sofia", lang: "el", flag: "🇬🇷", text: "Καλημέρα, σήμερα θα μάθουμε κάτι νέο...", time: "5 min ago", dur: "0:07" },
  { name: "Aino", lang: "fi", flag: "🇫🇮", text: "Hyvää huomenta, tänään opimme jotain uutta...", time: "8 min ago", dur: "0:05" },
  { name: "Miriam", lang: "he", flag: "🇮🇱", text: "שלום, היום נדבר על משהו מרתק ומעניין...", time: "12 min ago", dur: "0:06" },
  { name: "Amir", lang: "ms", flag: "🇲🇾", text: "Selamat pagi, hari ini kita akan belajar...", time: "15 min ago", dur: "0:05" },
  { name: "Emma", lang: "nl", flag: "🇳🇱", text: "Goedemorgen, vandaag leren we iets nieuws...", time: "20 min ago", dur: "0:07" },
  { name: "Erik", lang: "no", flag: "🇳🇴", text: "God morgen, i dag skal vi lære noe nytt...", time: "25 min ago", dur: "0:06" },
  { name: "Anna", lang: "pl", flag: "🇵🇱", text: "Dzień dobry, dziś będziemy się uczyć czegoś...", time: "30 min ago", dur: "0:08" },
  { name: "Maja", lang: "sv", flag: "🇸🇪", text: "God morgon, idag ska vi lära oss något nytt...", time: "35 min ago", dur: "0:06" },
  { name: "Amara", lang: "sw", flag: "🇹🇿", text: "Habari za asubuhi, leo tutajifunza kitu kipya...", time: "40 min ago", dur: "0:05" },
  { name: "Zeynep", lang: "tr", flag: "🇹🇷", text: "Günaydın, bugün birlikte yeni bir şey öğreneceğiz...", time: "45 min ago", dur: "0:07" },
  { name: "James", lang: "en", flag: "🇬🇧", text: "Good morning, today we will learn something new...", time: "50 min ago", dur: "0:09" },
  { name: "Wei", lang: "zh", flag: "🇨🇳", text: "早上好，今天我们将一起学习新的知识...", time: "55 min ago", dur: "0:05" },
  { name: "Yuki", lang: "ja", flag: "🇯🇵", text: "おはようございます、今日は新しいことを学びましょう...", time: "1 hr ago", dur: "0:06" },
  { name: "Jisoo", lang: "ko", flag: "🇰🇷", text: "안녕하세요, 오늘은 새로운 것을 함께 배워봅시다...", time: "1 hr ago", dur: "0:05" },
  { name: "Hans", lang: "de", flag: "🇩🇪", text: "Guten Morgen, heute werden wir etwas Neues lernen...", time: "2 hr ago", dur: "0:07" },
  { name: "Claire", lang: "fr", flag: "🇫🇷", text: "Bonjour, aujourd'hui nous allons apprendre quelque chose...", time: "2 hr ago", dur: "0:08" },
  { name: "Ivan", lang: "ru", flag: "🇷🇺", text: "Доброе утро, сегодня мы узнаем что-то новое...", time: "3 hr ago", dur: "0:06" },
  { name: "Lucas", lang: "pt", flag: "🇧🇷", text: "Bom dia, hoje vamos aprender algo novo e interessante...", time: "3 hr ago", dur: "0:07" },
  { name: "Carlos", lang: "es", flag: "🇪🇸", text: "Buenos días, hoy vamos a aprender algo nuevo juntos...", time: "4 hr ago", dur: "0:06" },
  { name: "Giulia", lang: "it", flag: "🇮🇹", text: "Buongiorno, oggi impareremo qualcosa di nuovo insieme...", time: "5 hr ago", dur: "0:07" },
];

function HistoryCard() {
  const ITEM_H = 60;
  const VISIBLE = 5;
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setOffset(o => (o + 1) % ALL_HISTORY.length), 2200);
    return () => clearInterval(t);
  }, []);
  const visibleItems = [...Array(VISIBLE + 1)].map((_, i) => ALL_HISTORY[(offset + i) % ALL_HISTORY.length]);
  return (
    <div className="relative overflow-hidden flex-1" style={{ height: ITEM_H * VISIBLE }}>
      <motion.div animate={{ y: -ITEM_H }} transition={{ duration: 0.5, ease: "easeInOut" }} key={offset} className="flex flex-col gap-1">
        {visibleItems.map((item, i) => (
          <div key={`${item.lang}-${i}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-black/5 flex-shrink-0"
            style={{ height: ITEM_H - 4 }}>
            <div className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{item.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-black">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/6 text-gray-500 font-medium">{item.flag} {item.lang}</span>
                <span className="text-[10px] text-gray-400 ml-auto">{item.time}</span>
              </div>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">{item.text}</p>
            </div>
            <div className="flex gap-0.5 items-end flex-shrink-0" style={{ height: 48 }}>
              {[...Array(6)].map((_, j) => <WaveBar key={j} i={j} playing={i === 0} total={6} />)}
            </div>
          </div>
        ))}
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}

// All 23 languages in a premium grid
const ALL_LANGS = [
  { text: "हिन्दी", sub: "Hindi", flag: "🇮🇳" },
  { text: "العربية", sub: "Arabic", flag: "🇸🇦" },
  { text: "Dansk", sub: "Danish", flag: "🇩🇰" },
  { text: "Ελληνικά", sub: "Greek", flag: "🇬🇷" },
  { text: "Suomi", sub: "Finnish", flag: "🇫🇮" },
  { text: "עברית", sub: "Hebrew", flag: "🇮🇱" },
  { text: "Melayu", sub: "Malay", flag: "🇲🇾" },
  { text: "Nederlands", sub: "Dutch", flag: "🇳🇱" },
  { text: "Norsk", sub: "Norwegian", flag: "🇳🇴" },
  { text: "Polski", sub: "Polish", flag: "🇵🇱" },
  { text: "Svenska", sub: "Swedish", flag: "🇸🇪" },
  { text: "Kiswahili", sub: "Swahili", flag: "🇹🇿" },
  { text: "Türkçe", sub: "Turkish", flag: "🇹🇷" },
  { text: "English", sub: "English", flag: "🇬🇧" },
  { text: "中文", sub: "Chinese", flag: "🇨🇳" },
  { text: "日本語", sub: "Japanese", flag: "🇯🇵" },
  { text: "한국어", sub: "Korean", flag: "🇰🇷" },
  { text: "Deutsch", sub: "German", flag: "🇩🇪" },
  { text: "Français", sub: "French", flag: "🇫🇷" },
  { text: "Русский", sub: "Russian", flag: "🇷🇺" },
  { text: "Português", sub: "Portuguese", flag: "🇧🇷" },
  { text: "Español", sub: "Spanish", flag: "🇪🇸" },
  { text: "Italiano", sub: "Italian", flag: "🇮🇹" },
];

function LanguagesCard() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % ALL_LANGS.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="grid grid-cols-5 gap-1.5">
        {ALL_LANGS.map((lang, i) => (
          <motion.div key={lang.sub}
            animate={i === active ? { scale: 1.06, backgroundColor: "rgba(255,255,255,0.15)" } : { scale: 1, backgroundColor: "rgba(255,255,255,0.05)" }}
            className="rounded-xl p-1.5 text-center border border-white/10 cursor-default"
            transition={{ duration: 0.3 }}>
            <div className="text-sm">{lang.flag}</div>
            <div className="text-[9px] text-white/60 mt-0.5 leading-tight">{lang.sub}</div>
          </motion.div>
        ))}
      </div>
      <motion.div key={active} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-1">
        <span className="text-lg font-bold text-white">{ALL_LANGS[active].text}</span>
        <span className="text-white/40 text-xs ml-2">{ALL_LANGS[active].sub}</span>
      </motion.div>
    </div>
  );
}

function EmotionCard() {
  const [vals, setVals] = useState({ speed: 1.0, pitch: 0, volume: 1.0, emotion: 0.5 });
  useAnimationFrame((t) => {
    setVals({
      speed: 0.5 + 1.5 * ((Math.sin(t / 2000) + 1) / 2),
      pitch: Math.round(Math.sin(t / 2400) * 10),
      volume: 0.5 + 1.5 * ((Math.sin(t / 1700) + 1) / 2),
      emotion: (Math.sin(t / 1500) + 1) / 2,
    });
  });
  const sliders = [
    { label: "Speed", value: (vals.speed - 0.5) / 1.5, fmt: `${vals.speed.toFixed(1)}x`, range: "0.5x — 2.0x" },
    { label: "Pitch", value: (vals.pitch + 10) / 20, fmt: `${vals.pitch > 0 ? "+" : ""}${vals.pitch}`, range: "-10 — +10" },
    { label: "Volume", value: (vals.volume - 0.5) / 1.5, fmt: `${vals.volume.toFixed(1)}x`, range: "0.5x — 2.0x" },
    { label: "Emotion", value: vals.emotion, fmt: vals.emotion.toFixed(2), range: "0.00 — 1.00" },
  ];
  return (
    <div className="flex flex-col gap-3 flex-1 justify-center">
      {sliders.map(({ label, value, fmt, range }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="font-mono text-black font-bold">{fmt}</span>
          </div>
          <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div className="absolute left-0 top-0 h-full rounded-full bg-black"
              animate={{ width: `${Math.max(2, value * 100)}%` }} transition={{ duration: 0.15 }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400 font-mono">{range.split(" — ")[0]}</span>
            <span className="text-[9px] text-gray-400 font-mono">{range.split(" — ")[1]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function APICard() {
  const lines = [
    { c: "gray", s: 'const res = await fetch(' },
    { c: "blue", s: '  "https://soviron.tech/api/tts",' },
    { c: "gray", s: '  { method: "POST",' },
    { c: "gray", s: '    body: JSON.stringify({' },
    { c: "purple", s: '      text: "Hello, world!",' },
    { c: "purple", s: '      voice_id: "hindi-001",' },
    { c: "purple", s: '      format: "mp3"' },
    { c: "gray", s: '    })' },
    { c: "gray", s: '  }' },
    { c: "gray", s: ');' },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown < lines.length) {
      const t = setTimeout(() => setShown(s => s + 1), 280);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShown(0), 2500);
      return () => clearTimeout(t);
    }
  }, [shown]);
  const colorMap: Record<string, string> = { gray: "text-gray-400", blue: "text-blue-400", purple: "text-purple-400" };
  return (
    <div className="bg-gray-950 rounded-2xl flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="text-[10px] text-white/20 ml-2 font-mono">api.ts</span>
      </div>
      <div className="p-4 font-mono text-[11px] leading-5 flex-1 flex flex-col justify-center">
      {lines.slice(0, shown).map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={colorMap[l.c]}>{l.s}</motion.div>
      ))}
      {shown < lines.length && <span className="inline-block w-1.5 h-3.5 bg-white/60 animate-pulse rounded-sm" />}
      </div>
    </div>
  );
}

const PRIVACY_STEPS = [
  { label: "Voice sample uploaded", path: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8" },
  { label: "AES-256 encryption", path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { label: "Processed in memory", path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  { label: "Never written to disk", path: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" },
  { label: "Deleted after response", path: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" },
  { label: "Zero data retention", path: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" },
];

function PrivacyCard() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % (PRIVACY_STEPS.length + 2)), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col gap-1.5 mt-3 flex-1">
      {PRIVACY_STEPS.map((s, i) => {
        const isDone = i < step;
        const isActive = i === step;
        return (
          <motion.div key={i}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${isDone ? "bg-gray-50 border border-black/5" : isActive ? "bg-black text-white shadow-lg" : "opacity-20"}`}
            animate={isActive ? { scale: [1, 1.01, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={isActive ? "white" : isDone ? "#000" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d={s.path} />
            </svg>
            <span className={`font-medium ${isActive ? "text-white" : "text-gray-700"}`}>{s.label}</span>
            {isDone && (
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" className="ml-auto flex-shrink-0 opacity-30">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {isActive && <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-white ml-auto flex-shrink-0" />}
          </motion.div>
        );
      })}
    </div>
  );
}

const AI_METRICS = [
  { label: "Voice similarity", value: 0.94, peak: 0.97 },
  { label: "Naturalness score", value: 0.91, peak: 0.95 },
  { label: "Prosody accuracy", value: 0.88, peak: 0.93 },
  { label: "Emotion capture", value: 0.86, peak: 0.91 },
];

function AICard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col gap-3 mt-3 flex-1">
      {AI_METRICS.map(({ label, value, peak }, idx) => {
        const animated = value + Math.sin(tick * 0.6 + idx) * 0.035;
        return (
          <div key={label}>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-white/50">{label}</span>
              <span className="text-white font-mono font-bold">{(animated * 100).toFixed(1)}%</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-white/10">
              <motion.div className="absolute left-0 top-0 h-full rounded-full bg-white"
                animate={{ width: `${animated * 100}%` }} transition={{ duration: 0.9, ease: "easeInOut" }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-white/25" style={{ left: `${peak * 100}%` }} />
            </div>
          </div>
        );
      })}
      <div className="flex gap-1.5 flex-wrap mt-2">
        {["Neural TTS", "Zero-shot cloning", "23 languages", "Sub-second"].map(tag => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/8 text-white/50 font-medium border border-white/10">{tag}</span>
        ))}
      </div>
    </div>
  );
}

const FORMATS = [
  { name: "MP3", quality: "128 kbps", desc: "Best for sharing & streaming", size: "~480 KB/min" },
  { name: "WAV", quality: "Lossless", desc: "Studio quality, uncompressed", size: "~5 MB/min" },
  { name: "OGG", quality: "Compressed", desc: "Open source, excellent quality", size: "~360 KB/min" },
  { name: "FLAC", quality: "Lossless", desc: "Perfect archival quality", size: "~2 MB/min" },
  { name: "AAC", quality: "256 kbps", desc: "Apple ecosystem optimized", size: "~960 KB/min" },
  { name: "M4A", quality: "AAC-LC", desc: "Ideal for mobile devices", size: "~720 KB/min" },
];

function FormatsCard() {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSelected(s => (s + 1) % FORMATS.length), 1800);
    return () => clearInterval(t);
  }, []);
  const fmt = FORMATS[selected];
  return (
    <div className="flex flex-col gap-3 mt-3 flex-1">
      <div className="flex flex-wrap gap-1.5">
        {FORMATS.map((f, i) => (
          <motion.div key={f.name} animate={i === selected ? { scale: 1.08 } : { scale: 1 }}
            className={`text-[11px] px-3 py-1.5 rounded-full font-semibold transition-colors cursor-default ${i === selected ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
            {f.name}
          </motion.div>
        ))}
      </div>
      <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="flex-1 rounded-2xl bg-gray-50 border border-black/6 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl font-black text-black">{fmt.name}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-black text-white font-medium">{fmt.quality}</span>
          </div>
          <p className="text-sm text-gray-600">{fmt.desc}</p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/6">
          <span className="text-xs text-gray-400">Avg file size</span>
          <span className="text-xs font-mono font-semibold text-black">{fmt.size}</span>
        </div>
      </motion.div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-20 md:py-32 px-4 sm:px-6 bg-gray-50 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-7xl font-bold mb-6 text-black tracking-tight">Built for perfection</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Industry-leading voice AI that sets the standard for quality.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Lightning fast */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="md:col-span-5 rounded-3xl bg-white border border-black/8 p-6 md:p-8 flex flex-col"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)", minHeight: 280 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <svg viewBox="0 0 48 24" width="28" height="14" fill="none"><path d="M0 12 Q6 2 12 12 Q18 22 24 12 Q30 2 36 12 Q42 22 48 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" /></svg>
              </div>
              <div><h3 className="text-base font-bold text-black">Lightning fast</h3><p className="text-xs text-gray-500">Broadcast-ready in seconds, 23 languages</p></div>
            </div>
            <TTSCard />
          </motion.div>

          {/* Generation history */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7 rounded-3xl bg-white border border-black/8 p-6 md:p-8 flex flex-col"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)", minHeight: 280 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="white"><path d="M3 4h14v2H3zM3 9h14v2H3zM3 14h8v2H3z" /></svg>
              </div>
              <div><h3 className="text-base font-bold text-black">Generation history</h3><p className="text-xs text-gray-500">Every generation saved across all languages</p></div>
            </div>
            <HistoryCard />
          </motion.div>

          {/* 23 Languages */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
            className="md:col-span-4 rounded-3xl bg-black p-6 md:p-8 flex flex-col" style={{ minHeight: 280 }}>
            <div className="mb-4"><h3 className="text-base font-bold text-white">23 Languages</h3><p className="text-xs text-white/40 mt-0.5">Global voice coverage</p></div>
            <LanguagesCard />
          </motion.div>

          {/* Emotional range */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-4 rounded-3xl bg-white border border-black/8 p-6 md:p-8 flex flex-col"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)", minHeight: 280 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="white"><circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" fill="none" /><path d="M7 11s1 2 3 2 3-2 3-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" /><circle cx="7.5" cy="8.5" r="1" fill="white" /><circle cx="12.5" cy="8.5" r="1" fill="white" /></svg>
              </div>
              <div><h3 className="text-base font-bold text-black">Emotional range</h3><p className="text-xs text-gray-500">Fine-tune every aspect of the voice</p></div>
            </div>
            <EmotionCard />
          </motion.div>

          {/* REST API */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
            className="md:col-span-4 rounded-3xl bg-white border border-black/8 p-6 md:p-8 flex flex-col"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)", minHeight: 280 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center"><Cpu className="w-4 h-4 text-white" /></div>
                <div><h3 className="text-base font-bold text-black">REST API</h3><p className="text-xs text-gray-500">Integrate in minutes</p></div>
              </div>
              <a href="/signup" className="text-xs px-3 py-1.5 bg-black text-white rounded-lg font-medium hover:opacity-80 transition-opacity flex-shrink-0">Docs →</a>
            </div>
            <APICard />
          </motion.div>

          {/* Privacy first */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-4 rounded-3xl bg-white border border-black/8 p-6 md:p-8 flex flex-col"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)", minHeight: 280 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
              <div><h3 className="text-base font-bold text-black">Privacy first</h3><p className="text-xs text-gray-500">Your data is never stored</p></div>
            </div>
            <PrivacyCard />
          </motion.div>

          {/* Advanced AI */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 }}
            className="md:col-span-4 rounded-3xl bg-black p-6 md:p-8 flex flex-col" style={{ minHeight: 280 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"><Cpu className="w-4 h-4 text-white" /></div>
              <div><h3 className="text-base font-bold text-white">Advanced AI</h3><p className="text-xs text-white/40">Neural voice synthesis</p></div>
            </div>
            <AICard />
          </motion.div>

          {/* 6 formats */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-4 rounded-3xl bg-white border border-black/8 p-6 md:p-8 flex flex-col"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07)", minHeight: 280 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="white"><path d="M10 2L3 7v6l7 5 7-5V7L10 2z" /></svg>
              </div>
              <div><h3 className="text-base font-bold text-black">6 formats</h3><p className="text-xs text-gray-500">Export in any format you need</p></div>
            </div>
            <FormatsCard />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
