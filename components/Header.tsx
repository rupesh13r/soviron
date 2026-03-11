"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<string>('free');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
        if (data) setPlan(data.plan || 'free');
      }
    };

    fetchUserAndPlan();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
        if (data) setPlan(data.plan || 'free');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
            {user ? (
              <div className="flex items-center gap-3">
                <a href="/dashboard" className="px-4 py-2 bg-black text-white text-sm rounded-xl font-medium hover:scale-105 transition-transform">
                  Dashboard
                </a>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden border border-black/10 hover:border-black/30 transition-colors bg-gray-100 flex items-center justify-center text-black font-semibold"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 min-w-[220px] bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden flex flex-col pt-3"
                      >
                        {/* User info block */}
                        <div className="px-4 pb-3 mb-2 border-b border-black/5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-black border border-black/5">
                            {user.user_metadata?.avatar_url ? (
                              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-black truncate">
                              {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-col px-2 pb-2">
                          <a href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2" onClick={() => setIsDropdownOpen(false)}>
                            Dashboard
                          </a>
                          <a href="/pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between" onClick={() => setIsDropdownOpen(false)}>
                            Plan
                            <span className="text-[10px] font-bold tracking-wider text-black bg-gray-100 px-2 py-0.5 rounded-md uppercase">
                              {plan}
                            </span>
                          </a>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">User ID</span>
                            <span className="text-[11px] font-mono text-gray-500">{user.id.substring(0, 8)}</span>
                          </div>
                          <div className="h-px bg-black/5 my-1 mx-1" />
                          <button 
                            onClick={handleSignOut}
                            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <a href="/login" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Sign in
                </a>
                <a href="/signup" className="px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg shadow-black/10">
                  Get started
                </a>
              </>
            )}
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
