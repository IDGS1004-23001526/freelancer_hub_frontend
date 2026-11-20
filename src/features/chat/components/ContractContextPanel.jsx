/**
- ContractContextPanel – the right-side context panel shown inside the drawer.
- Displays contract state, current milestone, validity and a "Ver contrato" button
- that opens the ContractModal.
 *
- Also shows "Reglas del chat" as per the Figma mockup.
 */
import React, { useState } from 'react';
import { ShieldCheck, Calendar, Hash, DollarSign, X } from 'lucide-react';

/** Inline modal for "Ver contrato" – matches Figma "HU-11 / Modal contrato" */
function ContractModal({ ctx, onClose }) {
  const currency = ctx.currency ?? 'USD';
  const total = ctx.totalAmount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(ctx.totalAmount)
    : '—';

  // For the mockup we show 1st milestone as funded (H1) with the total / 2 amount
  const milestoneAmount = ctx.totalAmount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
        ctx.totalAmount / (ctx.totalAmount > 5000 ? 3 : 2)
      )
    : '—';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Detalles del contrato"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2b1b1e]/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(90,15,36,0.3)] border border-[#C9B8A6]/50 p-6">
        <h3 className="text-base font-extrabold text-[#5A0F24] mb-4">
          Contrato {ctx.id.startsWith('CT-') ? ctx.id : `CT-${ctx.id.slice(0, 8).toUpperCase()}`}
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-[#5A0F24]/65">Total</span>
            <span className="font-bold text-[#2b1b1e]">{total}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#5A0F24]/65">
              {ctx.currentMilestone ?? 'Hito 1'}
            </span>
            <span className="font-bold text-emerald-700">{milestoneAmount} · Fondeado</span>
          </div>
          {ctx.validUntil && (
            <div className="flex justify-between text-xs">
              <span className="text-[#5A0F24]/65">Revisión</span>
              <span className="font-bold text-[#2b1b1e]">
                {new Date(ctx.validUntil).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-sm font-bold transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function ContractContextPanel({ contractContext }) {
  const [showModal, setShowModal] = useState(false);

  const statusLabel = {
    ACTIVE: 'ACTIVO',
    FUNDED: 'FONDEADO',
    COMPLETED: 'COMPLETADO',
    PENDING: 'PENDIENTE',
    CANCELLED: 'CANCELADO',
  };

  const statusColor = {
    ACTIVE: 'text-emerald-700',
    FUNDED: 'text-emerald-700',
    COMPLETED: 'text-[#8C2C45]',
    PENDING: 'text-amber-700',
    CANCELLED: 'text-red-700',
  };

  return (
    <>
      {showModal && contractContext && (
        <ContractModal ctx={contractContext} onClose={() => setShowModal(false)} />
      )}

      <div className="flex flex-col gap-4 p-4">
        {/* Contract context card */}
        {contractContext ? (
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 p-4 shadow-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5A0F24]/60 mb-3">
              Contexto
            </h3>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5A0F24]/65 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#C68A8F]" />
                  Estado
                </span>
                <span
                  className={`font-bold ${
                    statusColor[contractContext.status] ?? 'text-[#2b1b1e]'
                  }`}
                >
                  {statusLabel[contractContext.status] ?? contractContext.status}
                </span>
              </div>

              {contractContext.currentMilestone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5A0F24]/65 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-[#C68A8F]" />
                    Hito actual
                  </span>
                  <span className="font-bold text-[#2b1b1e] text-right max-w-[55%] truncate">
                    {contractContext.currentMilestone}
                  </span>
                </div>
              )}

              {contractContext.totalAmount != null && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5A0F24]/65 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-[#C68A8F]" />
                    Total
                  </span>
                  <span className="font-bold text-[#2b1b1e]">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: contractContext.currency ?? 'USD',
                    }).format(contractContext.totalAmount)}
                  </span>
                </div>
              )}

              {contractContext.validUntil && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5A0F24]/65 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#C68A8F]" />
                    Vigencia
                  </span>
                  <span className="font-bold text-[#2b1b1e]">
                    {new Date(contractContext.validUntil).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full py-2 rounded-xl border border-[#8C2C45] text-[#8C2C45] hover:bg-[#8C2C45] hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Ver contrato
            </button>
          </div>
        ) : (
          <div className="bg-[#F3EFE6] rounded-2xl border border-[#C9B8A6]/40 p-4 text-xs text-[#5A0F24]/65 italic">
            Sin contexto de contrato vinculado.
          </div>
        )}

        {/* Chat rules card */}
        <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 p-4 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5A0F24]/60 mb-3">
            Reglas del chat
          </h3>
          <ol className="space-y-2 text-[11px] text-[#5A0F24]/75 list-decimal list-inside">
            <li>Solo participan las partes del contrato o propuesta.</li>
            <li>Notificación push si estás en segundo plano.</li>
            <li>Sin contrato ni propuesta no hay acceso.</li>
          </ol>
        </div>
      </div>
    </>
  );
}