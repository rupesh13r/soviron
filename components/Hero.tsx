"use client";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function Hero() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 md:px-6 pt-28 md:pt-32 bg-gradient-to-b from-gray-50 to-white max-w-full">
      {/* 3D Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transform: "perspective(1000px) rotateX(60deg)",
            transformOrigin: "center top",
          }}
        />
      </div>

      {/* Floating 3D Elements */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl"
        animate={{ y: [0, -30, 0], rotateZ: [0, 5, 0], rotateY: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "20px 20px 60px rgba(0,0,0,0.1), -20px -20px 60px rgba(255,255,255,0.8)" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl"
        animate={{ y: [0, 40, 0], rotateZ: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "15px 15px 40px rgba(0,0,0,0.08), -15px -15px 40px rgba(255,255,255,0.9)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Main headline wrapper */}
        <div className="w-full px-4 text-center overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[2.5rem] md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight mx-auto break-words"
          >
            <span className="text-black block">Clone any voice</span>
            <span className="text-gray-400 block">in seconds.</span>
          </motion.h1>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-600 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed text-center px-4"
        >
          Upload a voice sample. Type your script. Get broadcast-ready audio in seconds.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 md:mb-20 w-full"
        >
          {user ? (
            <a href="/dashboard" className="inline-flex max-w-fit mx-auto px-6 py-4 sm:px-10 sm:py-5 bg-black text-white rounded-xl overflow-hidden transition-all hover:scale-105 shadow-2xl shadow-black/20 text-center items-center justify-center">
              <span className="relative z-10 flex items-center gap-2 font-semibold text-base sm:text-lg">
                Go to Dashboard
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  →
                </motion.span>
              </span>
            </a>
          ) : (
            <a href="/signup" className="inline-flex max-w-fit mx-auto px-6 py-4 sm:px-10 sm:py-5 bg-black text-white rounded-xl overflow-hidden transition-all hover:scale-105 shadow-2xl shadow-black/20 text-center items-center justify-center">
              <span className="relative z-10 flex items-center gap-2 font-semibold text-base sm:text-lg">
                Start cloning for free
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  →
                </motion.span>
              </span>
            </a>
          )}

          <a href="#demo" className="inline-flex max-w-fit mx-auto px-6 py-4 sm:px-10 sm:py-5 bg-white border border-black/10 rounded-xl hover:bg-gray-50 transition-all items-center justify-center gap-2 shadow-lg shadow-black/5">
            <Play className="w-5 h-5 text-black" />
            <span className="font-semibold text-base sm:text-lg text-black">Watch demo</span>
          </a>
        </motion.div>

        {/* 3D Voice Wave Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full max-w-xs md:max-w-4xl mx-auto mt-8 md:mt-0"
        >
          <div
            className="relative rounded-3xl overflow-hidden border border-black/10 bg-white p-6 md:p-12 shadow-2xl"
            style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.5)" }}
          >
            {/* 3D Waveform */}
            <div className="flex gap-0.5 md:gap-2 h-20 md:h-48 items-end justify-center overflow-hidden">
              {[...Array(60)].map((_, i) => {
                const height = Math.sin(i * 0.2) * 40 + 50;
                return (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-black via-gray-700 to-gray-400"
                    animate={{ height: [`${height}%`, `${height + 20}%`, `${height}%`] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.03, ease: "easeInOut" }}
                    style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.15)", maxWidth: "8px" }}
                  />
                );
              })}
            </div>

            {/* Processing indicator */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-6 md:mt-8 px-6 py-3 md:px-8 md:py-4 bg-gray-50 rounded-2xl border border-black/5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-black rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-black">Processing audio...</span>
            </motion.div>
          </div>

          {/* 3D shadow effect */}
          <div
            className="absolute inset-0 -z-10 translate-y-8 blur-3xl opacity-30"
            style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
