import React from 'react';
import { Briefcase, Laptop, Check } from 'lucide-react';

/**
 * RoleSelector component allows users to visually select their account role:
 * CLIENT or FREELANCER.
 * Uses the designated palette:
 * - #5A0F24 (deep wine)
 * - #8C2C45 (crimson/primary)
 * - #C68A8F (dusty rose)
 * - #F3EFE6 (cream)
 * - #C9B8A6 (warm sand)
 */
export default function RoleSelector({ selectedRole, onChange, error }) {
  const roles = [
    {
      id: 'CLIENT',
      title: 'Soy Cliente',
      subtitle: 'Busco contratar expertos',
      description: 'Publica ofertas, revisa propuestas y gestiona pagos protegidos.',
      icon: Briefcase,
      badge: 'Contratante',
    },
    {
      id: 'FREELANCER',
      title: 'Soy Freelancer',
      subtitle: 'Quiero ofrecer mis servicios',
      description: 'Crea tu portafolio, postula a proyectos y cobra de forma segura.',
      icon: Laptop,
      badge: 'Talento',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 px-1">
        <label className="text-xs font-semibold text-[#5A0F24]">
          ¿Cuál es tu objetivo principal? <span className="text-[#8C2C45]">*</span>
        </label>
        <span className="text-[11px] font-medium text-[#C68A8F]">
          Selecciona tu rol
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const RoleIcon = role.icon;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#F3EFE6] border-[#8C2C45] shadow-[0_4px_16px_-2px_rgba(140,44,69,0.2)] ring-2 ring-[#8C2C45]/20'
                  : 'bg-white border-[#C9B8A6]/60 hover:border-[#C68A8F] hover:bg-[#F3EFE6]/40 shadow-xs'
              }`}
            >
              {/* Selected check badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#8C2C45] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#8C2C45] text-[#F3EFE6]'
                        : 'bg-[#F3EFE6] text-[#8C2C45]'
                    }`}
                  >
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#8C2C45]/15 text-[#5A0F24]'
                        : 'bg-[#C9B8A6]/20 text-[#5A0F24]/70'
                    }`}
                  >
                    {role.badge}
                  </span>
                </div>

                <h3
                  className={`text-sm font-bold tracking-tight mb-1 ${
                    isSelected ? 'text-[#5A0F24]' : 'text-[#5A0F24]/90'
                  }`}
                >
                  {role.title}
                </h3>
                <p className="text-[11px] font-medium text-[#8C2C45] mb-1">
                  {role.subtitle}
                </p>
                <p className="text-[11px] text-[#5A0F24]/75 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-[#8C2C45] px-1">
          • {error}
        </p>
      )}
    </div>
  );
}
