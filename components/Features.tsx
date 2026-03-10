"use client";
import { motion } from "framer-motion";
import { Zap, Shield, Globe, Cpu, Music, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Clone any voice in seconds. Paste your script, get broadcast-ready audio instantly.",
    color: "from-amber-50 to-amber-100",
    iconColor: "text-amber-700",
  },
  {
    icon: Shield,
    title: "Privacy first",
    description: "Your voice data is never stored or shared. Complete control over your clones.",
    color: "from-emerald-50 to-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    icon: Globe,
    title: "Multi-language",
    description: "Clone voices across languages and accents with natural fluency.",
    color: "from-blue-50 to-blue-100",
    iconColor: "text-blue-700",
  },
  {
    icon: Cpu,
    title: "Advanced AI",
    description: "State-of-the-art neural networks deliver lifelike, natural-sounding voice output.",
    color: "from-purple-50 to-purple-100",
    iconColor: "text-purple-700",
  },
  {
    icon: Music,
    title: "Emotional range",
    description: "Capture tone, pacing, and emotion — not just words.",
    color: "from-rose-50 to-rose-100",
    iconColor: "text-rose-700",
  },
  {
    icon: Sparkles,
    title: "API access",
    description: "Integrate Soviron directly into your workflow with our simple REST API.",
    color: "from-indigo-50 to-indigo-100",
    iconColor: "text-indigo-700",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black tracking-tight">
            Built for perfection
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Industry-leading voice AI that sets the standard for quality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div
                className="relative h-full p-8 rounded-3xl bg-white border border-black/10 transition-all duration-300"
                style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.5)" }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotateY: 15, rotateX: 10 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformStyle: "preserve-3d", boxShadow: "8px 8px 20px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.8)" }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-black">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
