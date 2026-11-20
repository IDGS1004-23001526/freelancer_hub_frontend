/**
- ChatAccessDenied – the 403 screen shown when the user tries to open a chat
- they are not authorized to access.
 *
- Matches the Figma mockup "HU-11 / 403".
 */
import React from 'react';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function ChatAccessDenied({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* 403 card */}
      <div className="w-full max-w-xs bg-white rounded-3xl border border-[#C9B8A6]/50 p-8 shadow-sm">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 mb-5 text-[10px] font-bold text-[#5A0F24] uppercase tracking-wider">
          <ShieldOff className="w-3 h-3 text-[#8C2C45]" />
          Sin permiso
        </div>

        {/* Error code */}
        <p className="text-5xl font-black text-[#8C2C45] mb-2 tracking-tight">403</p>

        <h2 className="text-base font-extrabold text-[#5A0F24] mb-2">
          No tienes acceso a este chat
        </h2>
        <p className="text-xs text-[#5A0F24]/75 leading-relaxed mb-6">
          Solo pueden escribir quienes tienen un contrato o propuesta formal en el proyecto.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 px-4 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a mensajes
        </button>
      </div>
    </div>
  );
}