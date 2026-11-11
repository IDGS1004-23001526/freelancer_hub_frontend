import React from 'react';
import {
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  XCircle,
} from 'lucide-react';

export default function CandidateComparisonTable({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  formatMoney,
}) {
  return (
    <div
      data-testid="candidate-comparison-table"
      className="bg-white rounded-3xl border border-[#C9B8A6]/60 shadow-[0_12px_35px_-15px_rgba(90,15,36,0.1)] overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3EFE6]/90 border-b border-[#C9B8A6]/50 text-[11px] font-extrabold uppercase tracking-wider text-[#5A0F24]">
              <th className="p-4">Postulante</th>
              <th className="p-4">Calificación</th>
              <th className="p-4">Compatibilidad</th>
              <th className="p-4">Oferta económica</th>
              <th className="p-4">Plazo estimado</th>
              <th className="p-4 text-right">Postulación</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#C9B8A6]/35 text-xs">
            {candidates.map((candidate) => {
              const score = candidate.mcda?.totalScore ?? 85;
              const isAccepted = candidate.status === 'ACCEPTED';
              const isRejected = candidate.status === 'REJECTED';
              const isSelected = selectedCandidateId === candidate.id;

              return (
                <tr
                  key={candidate.id}
                  onClick={() =>
                    onSelectCandidate && onSelectCandidate(candidate)
                  }
                  data-testid={`table-row-${candidate.id}`}
                  className={`transition-all cursor-pointer group ${
                    isAccepted
                      ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600'
                      : isRejected
                        ? 'bg-stone-50/70 opacity-75 hover:opacity-100'
                        : isSelected
                          ? 'bg-gradient-to-r from-[#fff2f4] via-[#F3EFE6]/80 to-white border-l-4 border-l-[#8C2C45]'
                          : 'hover:bg-[#F3EFE6]/50'
                  }`}
                >
                  {/* Postulante */}
                  <td className="p-4 align-middle min-w-[210px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5A0F24] text-[#F3EFE6] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {candidate.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-[#5A0F24] group-hover:text-[#8C2C45] transition-colors text-sm">
                            {candidate.freelancerName}
                          </p>
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Aceptada</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                              <XCircle className="w-2.5 h-2.5" />
                              <span>Descartada</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8C2C45] font-semibold">
                          {candidate.freelancerRole}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Calificación */}
                  <td className="p-4 align-middle whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 font-extrabold text-[#5A0F24]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{candidate.reputation.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Compatibilidad */}
                  <td className="p-4 align-middle min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-[#5A0F24]/75">
                        Afinidad
                      </span>
                      <span className="font-extrabold text-[#8C2C45]">
                        {score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#C9B8A6]/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 90
                            ? 'bg-emerald-600'
                            : score >= 80
                              ? 'bg-[#8C2C45]'
                              : 'bg-[#C68A8F]'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </td>

                  {/* Oferta económica */}
                  <td className="p-4 align-middle whitespace-nowrap">
                    <span className="text-sm font-extrabold text-[#5A0F24]">
                      {formatMoney(candidate.totalPrice, candidate.currency)}
                    </span>
                  </td>

                  {/* Plazo */}
                  <td className="p-4 align-middle whitespace-nowrap">
                    <span className="font-bold text-[#5A0F24] inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8C2C45]" />
                      {candidate.estimatedDays} días
                    </span>
                  </td>

                  {/* Acción para entrar al detalle */}
                  <td className="p-4 align-middle text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F3EFE6] group-hover:bg-[#5A0F24] text-[#5A0F24] group-hover:text-[#F3EFE6] text-[11px] font-extrabold transition-colors">
                      <span>Entrar al detalle</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8C2C45] group-hover:text-[#C68A8F]" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
