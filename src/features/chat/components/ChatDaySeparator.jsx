/**
- ChatDaySeparator – visual day label that separates message groups.
- Example: "Hoy", "Ayer", "jueves, 14 de noviembre de 2026"
 */
import React from 'react';

export default function ChatDaySeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4 select-none">
      <div className="flex-1 h-px bg-[#C9B8A6]/40" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/50 bg-[#F3EFE6] px-3 py-1 rounded-full border border-[#C9B8A6]/40 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#C9B8A6]/40" />
    </div>
  );
}