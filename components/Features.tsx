"use client";
import { motion } from "framer-motion";
import { Zap, Shield, Globe, Cpu, Music, Sparkles } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="relative py-32 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black tracking-tight">
            Built for perfection
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Industry-leading voice AI that sets the standard for quality.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-4 grid-rows-3 gap-4 h-auto">

          {/* 1 — Large: Lightning fast (col 1-2, row 1-2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 row-span-2 relative rounded-3xl bg-black overflow-hidden p-10 flex flex-col justify-between"
            style={{ minHeight: "320px" }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Lightning fast</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                Clone any voice in seconds. Paste your script, get broadcast-ready audio instantly.
              </p>
            </div>
            <div className="relative z-10 flex gap-2 mt-6">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full bg-white/30"
                  animate={{ height: [`${20 + Math.sin(i) * 15}px`, `${40 + Math.sin(i) * 20}px`, `${20 + Math.sin(i) * 15}px`] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                  style={{ minHeight: "8px" }}
                />
              ))}
            </div>
          </motion.div>

          {/* 2 — Medium: Privacy first (col 3, row 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 row-span-1 relative rounded-3xl bg-white border border-black/8 p-8 flex flex-col justify-between overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-1">Privacy first</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Your voice data is never stored or shared.</p>
            </div>
          </motion.div>

          {/* 3 — Medium: Multi-language (col 4, row 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="col-span-1 row-span-1 relative rounded-3xl bg-white border border-black/8 p-8 flex flex-col justify-between overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-1">Multi-language</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Clone voices across languages and accents.</p>
            </div>
          </motion.div>

          {/* 4 — Medium: Emotional range (col 3, row 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 row-span-1 relative rounded-3xl bg-white border border-black/8 p-8 flex flex-col justify-between overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-1">Emotional range</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Capture tone, pacing, and emotion — not just words.</p>
            </div>
          </motion.div>

          {/* 5 — Medium: Advanced AI (col 4, row 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="col-span-1 row-span-1 relative rounded-3xl bg-white border border-black/8 p-8 flex flex-col justify-between overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-1">Advanced AI</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Neural networks for lifelike voice output.</p>
            </div>
          </motion.div>

          {/* 6 — Wide: API access (col 1-4, row 3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-4 row-span-1 relative rounded-3xl bg-white border border-black/8 p-10 flex items-center justify-between overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)", minHeight: "140px" }}
          >
            <div className="flex items-center gap-8">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">API access</h3>
                <p className="text-gray-500 leading-relaxed">Integrate Soviron directly into your workflow with our simple REST API. Available on Creator, Pro, and Studio plans.</p>
              </div>
            </div>
            <a href="/signup" className="flex-shrink-0 px-6 py-3 bg-black text-white rounded-xl font-medium hover:scale-105 transition-transform text-sm ml-8">
              View docs →
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
