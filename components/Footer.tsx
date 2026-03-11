import { Github, Twitter, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-black/10 py-12 md:py-16 px-4 sm:px-6 w-full overflow-hidden bg-white/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 md:gap-12 mb-12 text-center md:text-left">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 flex flex-col items-center md:items-start text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="36" height="36">
                  <circle cx="150" cy="150" r="150" fill="#0A0A0A"/>
                  <rect x="80" y="80" width="55" height="55" fill="white" rx="6" transform="rotate(15 107 107)"/>
                  <rect x="165" y="75" width="55" height="55" fill="white" rx="6" transform="rotate(-10 192 102)"/>
                  <rect x="75" y="165" width="55" height="55" fill="white" rx="6" transform="rotate(10 102 192)"/>
                  <rect x="165" y="165" width="55" height="55" fill="white" rx="6" transform="rotate(-15 192 192)"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-black">Soviron</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-sm leading-relaxed text-center md:text-left">
              AI voice cloning for creators, developers, and teams. Clone any voice in seconds.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 border border-black/10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm">
                <Twitter className="w-5 h-5 text-black" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 border border-black/10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm">
                <Github className="w-5 h-5 text-black" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 border border-black/10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm">
                <Linkedin className="w-5 h-5 text-black" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 border border-black/10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm">
                <Youtube className="w-5 h-5 text-black" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-4 text-black">Product</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-black transition-colors">Pricing</a></li>
              <li><a href="#demo" className="hover:text-black transition-colors">Demo</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-4 text-black">Company</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="mailto:hello@soviron.tech" className="hover:text-black transition-colors">Contact</a></li>
              <li><a href="mailto:support@soviron.tech" className="hover:text-black transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-4 text-black">Developers</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/api-docs" className="hover:text-black transition-colors">API Docs</a></li>
              <li><a href="/api-docs#reference" className="hover:text-black transition-colors">API Reference</a></li>
              <li><a href="/api-docs#auth" className="hover:text-black transition-colors">Authentication</a></li>
              <li><a href="/api-docs#limits" className="hover:text-black transition-colors">Rate Limits</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-4 text-black">Legal</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-black transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div>&copy; 2026 Soviron. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-black transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
