"use client";
import { motion } from "framer-motion";
import { Play, Pause, Mic, Wand2 } from "lucide-react";
import { useState } from "react";

const voiceSamples = [
  { id: 1, name: "Sarah", accent: "American", color: "from-blue-50 to-blue-100" },
  { id: 2, name: "James", accent: "British", color: "from-emerald-50 to-emerald-100" },
  { id: 3, name: "Maria", accent: "Spanish", color: "from-amber-50 to-amber-100" },
  { id: 4, name: "Yuki", accent: "Japanese", color: "from-rose-50 to-rose-100" },
  { id: 5, name: "Hans", accent: "German", color: "from-purple-50 to-purple-100" },
  { id: 6, name: "Sophie", accent: "French", color: "from-pink-50 to-pink-100" },
];

export function VoiceCloneDemo() {
  const [selectedVoice, setSelectedVoice] = useState(1);
  const [inputText, setInputText] = useState("Hello, I'm an AI-generated voice clone created by Soviron.");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
    }, 2000);
  };

  return (
    <section id="demo" className="relative py-32 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black tracking-tight">
            Try it yourself
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a voice, type your text, and hear it come to life instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div
            className="rounded-3xl bg-white border border-black/10 p-10 shadow-2xl"
            style={{ boxShadow: "0 50px 120px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.8)" }}
          >
            {/* Voice samples grid */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-black mb-4">Select a voice</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {voiceSamples.map((voice) => (
                  <motion.button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      selectedVoice === voice.id
                        ? "border-black bg-gradient-to-br from-gray-50 to-white"
                        : "border-black/10 bg-white hover:border-black/30"
                    }`}
                    style={{
                      boxShadow: selectedVoice === voice.id
                        ? "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)"
                        : "0 10px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${voice.color} flex items-center justify-center shadow-lg`}>
                      <Mic className="w-7 h-7 text-gray-700" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-black">{voice.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{voice.accent}</div>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="flex gap-0.5 justify-center mt-3 h-6 items-end">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-black rounded-full"
                            animate={{ height: ["30%", "100%", "30%"] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-black mb-4">Enter your text</h3>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-black/10 focus:border-black/30 focus:outline-none resize-none text-black placeholder:text-gray-400 shadow-inner"
                  placeholder="Type or paste any text here..."
                  style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.04)" }}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                  {inputText.length} characters
                </div>
              </div>
            </div>

            {/* Generate button */}
            <div className="flex justify-center mb-8">
              <motion.button
                onClick={handleGenerate}
                disabled={isProcessing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 bg-black text-white rounded-2xl font-semibold text-lg flex items-center gap-3 shadow-2xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
                {isProcessing ? "Generating..." : "Generate Voice"}
              </motion.button>
            </div>

            {/* Output visualization */}
            <div
              className="rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-black/10 p-8"
              style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.8)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Generated output</h3>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!isPlaying && !isProcessing}
                  className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
              </div>

              <div className="h-32 flex gap-1 items-end justify-center bg-white rounded-xl p-6 border border-black/5">
                {isProcessing ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full"
                    />
                    <span className="font-medium">Processing audio...</span>
                  </div>
                ) : (
                  [...Array(80)].map((_, i) => {
                    const baseHeight = Math.sin(i * 0.15) * 30 + 40;
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-black via-gray-600 to-gray-400 max-w-[4px]"
                        initial={{ height: "5%" }}
                        animate={isPlaying ? { height: [`${baseHeight}%`, `${baseHeight + 30}%`, `${baseHeight}%`] } : { height: `${baseHeight}%` }}
                        transition={{ duration: 0.8, repeat: isPlaying ? Infinity : 0, delay: i * 0.01, ease: "easeInOut" }}
                        style={{ boxShadow: "0 -2px 6px rgba(0,0,0,0.1)" }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
