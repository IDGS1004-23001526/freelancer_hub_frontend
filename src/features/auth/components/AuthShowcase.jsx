import React from 'react';

export default function AuthShowcase() {
  return (
    <div className="w-full max-w-md bg-gradient-to-b from-[#fff7f5] via-[#fffbf9] to-[#ffffff] rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_40px_-15px_rgba(108,44,62,0.06)] border border-[#f3e7e2]/70 flex flex-col items-center justify-center min-h-[460px] md:min-h-[540px] text-center relative overflow-hidden">
      {/* Decoración circular de fondo suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#fdeeee]/50 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Cuadrado F & H Estilizado */}
        <div className="w-24 h-24 md:w-28 md:h-28 bg-[#4d1f2c] rounded-[2rem] flex items-center justify-center shadow-[0_12px_28px_rgba(77,31,44,0.22)] mb-8 transition-transform hover:scale-105 duration-300">
          <div className="flex items-center font-black text-3xl md:text-4xl tracking-tighter select-none">
            <span className="text-[#fdf9f7]">F</span>
            <span className="text-[#d98292]">H</span>
          </div>
        </div>

        {/* Título de Marca */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#4a1c29] tracking-tight mb-3">
          Freelance
        </h2>

        {/* Subtítulo / Descripción */}
        <p className="text-xs md:text-sm text-[#7d686d] max-w-xs font-normal leading-relaxed mb-6">
          Conecta con talento independiente o postula a los mejores proyectos y servicios
        </p>

        {/* Pequeño pill/indicador rosita */}
        <div className="w-7 h-1.5 bg-[#f0c5ce] rounded-full mt-2" />
      </div>
    </div>
  );
}
