import React from 'react';
import {
  Star,
  Clock,
  CheckCircle2,
  Award,
  ArrowRight,
  XCircle,
} from 'lucide-react';

export default function CandidateCard({
  candidate,
  rank,
  isSelected = false,
  onSelect,
  formatMoney,
}) {
  const score = candidate.mcda?.totalScore ?? 85;
  const isAccepted = candidate.status === 'ACCEPTED';
  const isRejected = candidate.status === 'REJECTED';
  const isTopMatch = rank === 1 && !isRejected;

  return (
    <article
      onClick={onSelect}
      data-testid={`candidate-card-${candidate.id}`}
      className={`rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer group ${
        isAccepted
          ? 'bg-gradient-to-b from-emerald-50/90 via-white to-emerald-50/40 border-emerald-500 ring-4 ring-emerald-400/30 shadow-[0_18px_45px_-12px_rgba(16,185,129,0.32)] -translate-y-1'
          : isRejected
            ? 'bg-white/75 border-[#C9B8A6]/50 opacity-75 hover:opacity-100'
            : isSelected
              ? 'bg-gradient-to-b from-[#fff5f6] via-white to-[#F3EFE6]/70 border-[#8C2C45] ring-4 ring-[#8C2C45]/30 shadow-[0_22px_55px_-12px_rgba(140,44,69,0.38)] -translate-y-1.5'
              : 'bg-white border-[#C9B8A6]/60 hover:border-[#8C2C45] hover:ring-4 hover:ring-[#8C2C45]/15 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] hover:shadow-[0_18px_40px_-12px_rgba(90,15,36,0.18)] hover:-translate-y-1'
      }`}
    >
      <div className="relative z-10 space-y-4">
        {/* Fila superior: Estado básico y calificación */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isAccepted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aceptada</span>
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-[11px] font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Descartada</span>
              </span>
            ) : isTopMatch ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5A0F24] text-[#F3EFE6] text-[11px] font-bold">
                <Award className="w-3.5 h-3.5 text-[#C68A8F]" />
                <span>Mayor afinidad</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C9B8A6]/50 text-[#5A0F24]/80 text-[11px] font-bold">
                <span>Postulación #{rank}</span>
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5A0F24] bg-[#F3EFE6] px-2.5 py-1 rounded-xl border border-[#C9B8A6]/50">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{candidate.reputation.toFixed(1)}</span>
          </span>
        </div>

        {/* Datos básicos del postulante */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5A0F24] to-[#8C2C45] text-[#F3EFE6] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {candidate.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-[#5A0F24] group-hover:text-[#8C2C45] transition-colors leading-snug truncate">
              {candidate.freelancerName}
            </h3>
            <p className="text-xs font-semibold text-[#8C2C45] truncate">
              {candidate.freelancerRole}
            </p>
          </div>
        </div>

        {/* Resumen básico: Compatibilidad, Precio y Plazo */}
        <div className="p-3.5 rounded-2xl bg-[#F3EFE6]/75 border border-[#C9B8A6]/50 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5A0F24]/80">
                Compatibilidad
              </span>
              <span
                data-testid={`candidate-score-${candidate.id}`}
                className="text-xs font-extrabold text-[#8C2C45]"
              >
                {score}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-1.5 rounded-full bg-[#C9B8A6]/40 overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score >= 90
                    ? 'bg-emerald-600'
                    : score >= 80
                      ? 'bg-[#8C2C45]'
                      : 'bg-[#C68A8F]'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#C9B8A6]/40 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/60 block">
                Oferta económica
              </span>
              <span className="text-sm font-extrabold text-[#5A0F24] block mt-0.5">
                {formatMoney(candidate.totalPrice, candidate.currency)}
              </span>
            </div>

            <div className="pl-2.5 border-l border-[#C9B8A6]/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/60 block">
                Tiempo estimado
              </span>
              <span className="text-sm font-extrabold text-[#5A0F24] flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>{candidate.estimatedDays} días</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para entrar a todos los detalles de la postulación */}
      <div className="relative z-10 pt-4 mt-4 border-t border-[#C9B8A6]/40">
        <div className="w-full py-2.5 px-3.5 rounded-xl bg-[#F3EFE6] group-hover:bg-[#5A0F24] text-[#5A0F24] group-hover:text-[#F3EFE6] text-xs font-extrabold transition-colors flex items-center justify-between">
          <span>Ver todos los detalles de la postulación</span>
          <ArrowRight className="w-4 h-4 text-[#8C2C45] group-hover:text-[#C68A8F] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </article>
  );
}
