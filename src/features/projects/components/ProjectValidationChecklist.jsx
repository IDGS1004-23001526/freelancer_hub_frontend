import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ProjectValidationChecklist({ items = [] }) {
  return (
    <aside className="lg:col-span-4 space-y-5">
      <div className="bg-gradient-to-b from-white via-[#F3EFE6]/80 to-[#F3EFE6] rounded-3xl p-6 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] border border-[#C9B8A6]/60 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#C68A8F]/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5A0F24] text-[#F3EFE6] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C68A8F]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Validación en Vivo
            </span>
          </div>

          <h2 className="text-lg font-extrabold text-[#5A0F24] tracking-tight mb-1.5">
            Estado de tu Convocatoria
          </h2>
          <p className="text-xs text-[#5A0F24]/75 leading-relaxed mb-5">
            El botón de envío se activará automáticamente cuando los 5 criterios obligatorios estén completos.
          </p>

          <div className="space-y-2.5" data-testid="validation-checklist">
            {items.map((item) => (
              <div
                key={item.id}
                data-testid={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  item.met
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white/90 border-[#C9B8A6]/60 text-[#5A0F24]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                      item.met
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#C68A8F]/30 text-[#5A0F24]'
                    }`}
                  >
                    {item.met ? '✓' : '•'}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-snug">
                      {item.label}
                    </p>
                    <p className="text-[11px] opacity-75 mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
