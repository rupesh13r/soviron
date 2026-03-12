import { Github, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

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
        <div className="pt-8 border-t border-black/10 flex flex-col items-center gap-6">
          {/* Social Icons Row */}
          <div className="flex items-center justify-center gap-4 text-[#6B7280]">
            <a href="https://www.reddit.com/user/sovironhq/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.43 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.25-1.25-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </a>
            <a href="https://x.com/sovironhq" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/sovironhq/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/company/sovironhq" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 text-sm text-gray-600">
            <div>&copy; 2026 Soviron. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-black transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
