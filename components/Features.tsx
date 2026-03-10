"use client";
import { motion } from "framer-motion";
import { Zap, Shield, Globe, Cpu, Music, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Clone any voice in seconds. Paste your script, get broadcast-ready audio instantly.",
  },
  {
    icon: Shield,
    title: "Privacy first",
    description: "Your voice data is never stored or shared. Complete control over your clones.",
  },
  {
    icon: Globe,
    title: "Multi-language",
    description: "Clone voices across languages and accents with natural fluency.",
  },
  {
    icon: Cpu,
    title: "Advanced AI",
    description: "State-of-the-art neural networks deliver lifelike, natural-sounding voice output.",
  },
  {
    icon: Music,
    title: "Emotional range",
    description: "Capture tone, pacing, and emotion — not just words.",
  },
  {
    icon: Sparkles,
    title: "API access",
    description: "Integrate Soviron directly into your workflow with our simple REST API.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 px-6 bg-[#080808]">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-white tracking-tight">
            Built for perfection
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Industry-leading voice AI that sets the standard for quality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-[#080808] p-10 hover:bg-white/[0.03] transition-colors duration-300"
            >
              {/* Hover border glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
              />

              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors duration-300">
                <feature.icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
