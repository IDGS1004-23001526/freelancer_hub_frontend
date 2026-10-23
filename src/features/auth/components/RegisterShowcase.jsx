import React from 'react';
import { ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

/**
 * RegisterShowcase visual hero component for the registration view.
 * Styled with the requested color palette:
 * - #5A0F24 (deep burgundy/wine)
 * - #8C2C45 (rich berry/crimson)
 * - #C68A8F (dusty rose/mauve)
 * - #F3EFE6 (soft cream/off-white)
 * - #C9B8A6 (warm beige/sand)
 */
export default function RegisterShowcase() {
  const perks = [
    {
      icon: ShieldCheck,
      title: 'Pagos en custodia (Escrow)',
      desc: 'Fondos 100% protegidos hasta que apruebes cada entrega.',
    },
    {
      icon: Zap,
      title: 'Contrataciones ágiles',
      desc: 'Conecta con perfiles calificados en minutos sin fricción.',
    },
    {
      icon: Globe,
      title: 'Comunidad global',
      desc: 'Oportunidades de alto impacto para clientes y freelancers.',
    },
  ];

  return (
    <div className="w-full max-w-md bg-gradient-to-b from-[#ffffff] via-[#F3EFE6]/70 to-[#F3EFE6] rounded-[2.5rem] p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] border border-[#C9B8A6]/50 flex flex-col justify-between min-h-[520px] md:min-h-[580px] relative overflow-hidden">
      {/* Background ambient glow with brand colors */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C68A8F]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-[#8C2C45]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/50 mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
          <span className="text-[11px] font-bold text-[#5A0F24] tracking-wide uppercase">
            Únete a Freelance Hub
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight leading-tight mb-3">
          Comienza a construir el futuro de tu trabajo
        </h2>
        <p className="text-xs md:text-sm text-[#5A0F24]/80 leading-relaxed">
          Ya sea que busques contratar al mejor talento o monetizar tus habilidades en proyectos retadores, este es tu espacio.
        </p>
      </div>

      {/* Benefits List */}
      <div className="relative z-10 space-y-3.5 my-6">
        {perks.map((perk, index) => {
          const PerkIcon = perk.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#C9B8A6]/40 shadow-xs transition-transform hover:translate-x-1 duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-[#8C2C45]/10 text-[#8C2C45] flex items-center justify-center shrink-0 mt-0.5">
                <PerkIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#5A0F24]">
                  {perk.title}
                </h4>
                <p className="text-[11px] text-[#5A0F24]/70 leading-normal">
                  {perk.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Brand Quote */}
      <div className="relative z-10 pt-4 border-t border-[#C9B8A6]/40 flex items-center justify-between text-[11px] text-[#5A0F24]/70">
        <span className="font-semibold text-[#8C2C45]">Seguridad garantizada</span>
        <span>•</span>
        <span>Sin comisiones ocultas</span>
      </div>
    </div>
  );
}
