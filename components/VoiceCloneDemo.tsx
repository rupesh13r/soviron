"use client";
import { motion } from "framer-motion";
import { Play, Pause, Mic } from "lucide-react";
import { useState } from "react";

const voices = [
  { id: 1, name: "Sarah", accent: "American" },
  { id: 2, name: "James", accent: "British" },
  { id: 3, name: "Maria", accent: "Spanish" },
  { id: 4, name: "Yuki", accent: "Japanese" },
  { id: 5, name: "Hans", accent: "German" },
  { id: 6, name: "Sophie", accent: "French" },
];

export function VoiceCloneDemo() {
  const [selectedVoice, setSelectedVoice] = useState(1);
  const [playingOriginal, setPlayingOriginal] = useState(false);
  const [playingClone, setPlayingClone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClonePlay = () => {
    if (!playingClone) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setPlayingClone(true);
        setTimeout(() => setPlayingClone(false), 3000);
      }, 1500);
    } else {
      setPlayingClone(false);
    }
  };

  return (
    <section id="demo" className="relative py-32 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black tracking-tight mb-4">
            Hear the difference
          </h2>
          <p className="text-xl text-gray-500">
            Upload a voice. Clone it. Compare side by side.
          p>
        </motion.div>

        {/* Voice pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {voices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedVoice === voice.id
                  ? "bg-black text-white shadow-lg"
                  : "bg-white border border-black/10 text-gray-600 hover:border-black/30"
              }`}
            >
              <Mic className="w-3 h-3" />
              {voice.name}
              <span className={`text-xs ${selectedVoice === voice.id ? "text-gray-400" : "text-gray-400"}`}>
                {voice.accent}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Two panels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Original */}
          <div
            className="relative rounded-2xl bg-gray-100 border border-black/5 overflow-hidden"
            style={{ minHeight: "280px" }}
          >
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">Original</div>
              
              {/* Waveform */}
              <div className="flex gap-0.5 h-20 items-end justify-center">
                {[...Array(40)].map((_, i) => {
                  const h = Math.sin(i * 0.3) * 30 + 40;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gray-300 max-w-[4px]"
                      animate={playingOriginal ? { height: [`${h}%`, `${h + 25}%`, `${h}%`] } : { height: `${h}%` }}
                      transition={{ duration: 0.8, repeat: playingOriginal ? Infinity : 0, delay: i * 0.02 }}
                    />
                  );
                })}
              </div>

              <button
                onClick={() => { setPlayingOriginal(!playingOriginal); }}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-sm">
                  {playingOriginal ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                </div>
                Preview Original
              </button>
            </div>
          </div>

          {/* Clone */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ minHeight: "280px" }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500" />
            <div className="absolute inset-0 backdrop-blur-sm bg-black/10" />

            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="text-xs text-white/70 font-medium uppercase tracking-widest">Clone</div>

              {/* Waveform */}
              <div className="flex gap-0.5 h-20 items-end justify-center">
                {[...Array(40)].map((_, i) => {
                  const h = Math.sin(i * 0.3 + 1) * 30 + 40;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm bg-white/40 max-w-[4px]"
                      animate={playingClone ? { height: [`${h}%`, `${h + 25}%`, `${h}%`] } : { height: `${h}%` }}
                      transition={{ duration: 0.8, repeat: playingClone ? Infinity : 0, delay: i * 0.02 }}
                    />
                  );
                })}
              </div>

              <button
                onClick={handleClonePlay}
                className="flex items-center gap-2 text-sm font-medium text-white"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full"
                    />
                  ) : playingClone ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3 ml-0.5" />
                  )}
                </div>
                {isProcessing ? "Cloning..." : "Preview Clone"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Label */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Voice Cloning — Create a replica that sounds just like you
        </div>
      </div>
    </section>
  );
}
