import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f2ee] text-[#2b1b1e] flex flex-col justify-between p-6 md:p-10 selection:bg-[#6c2c3e]/20 selection:text-[#6c2c3e]">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-extrabold tracking-tight text-[#4a1c29]">
            Freelance
          </span>
        </div>
        <a
          href="#ayuda"
          className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#7a6468] hover:text-[#4a1c29] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#8a7277]" />
          <span>¿Necesitas ayuda?</span>
        </a>
      </header>

      {/* Dynamic Content */}
      <main className="w-full max-w-6xl mx-auto my-auto py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9a868a] pt-4 border-t border-[#ece3de]/60">
        <p>© 2026 Freelance</p>
        <p>Talento independiente. Grandes posibilidades.</p>
      </footer>
    </div>
  );
}
