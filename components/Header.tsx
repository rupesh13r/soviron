"use client";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 shadow-lg shadow-black/5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="36" height="36">
                <circle cx="150" cy="150" r="150" fill="#0A0A0A"/>
                <rect x="80" y="80" width="55" height="55" fill="white" rx="6" transform="rotate(15 107 107)"/>
                <rect x="165" y="75" width="55" height="55" fill="white" rx="6" transform="rotate(-10 192 102)"/>
                <rect x="75" y="165" width="55" height="55" fill="white" rx="6" transform="rotate(10 102 192)"/>
                <rect x="165" y="165" width="55" height="55" fill="white" rx="6" transform="rotate(-15 192 192)"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-black tracking-tight">
              Soviron
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-black transition-colors font-medium">
              Features
            </a>
            <a href="#demo" className="text-gray-600 hover:text-black transition-colors font-medium">
              Demo
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-black transition-colors font-medium">
              Pricing
            </a>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-gray-600 hover:text-black transition-colors font-medium">
              Sign in
            </a>
            <a href="/signup" className="px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-black/10">
              Get started
            </a>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
