import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Plus,
  X,
} from 'lucide-react';
import { SUGGESTED_SKILLS } from '../../../interfaces/project.interface.js';

export default function SkillTagsSelector({
  skills,
  onToggleSkill,
  onAddCustomSkill,
  onRemoveSkill,
  isSkillsValid,
  showSkillsError,
  skillsError,
}) {
  const [customSkill, setCustomSkill] = useState('');

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    const clean = customSkill.trim();
    if (!clean) return;
    onAddCustomSkill(clean);
    setCustomSkill('');
  };

  return (
    <div
      data-testid="skills-section"
      className={`relative z-10 p-5 rounded-2xl border transition-all ${
        showSkillsError
          ? 'border-[#8C2C45] bg-[#fff5f5]/50 ring-2 ring-[#8C2C45]/15'
          : isSkillsValid
          ? 'border-emerald-500/60 bg-emerald-50/20'
          : 'border-[#C9B8A6] bg-[#F3EFE6]/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <label
            htmlFor="custom-skill-input"
            className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4 text-[#8C2C45]" />
            <span>Tags de Habilidades Requeridas</span>
            <span className="text-[#8C2C45]">*</span>
          </label>
          <p className="text-[11px] text-[#5A0F24]/75 mt-0.5">
            Selecciona o agrega al menos 3 tecnologías clave (ej. React, Node, PostgreSQL).
          </p>
        </div>

        {/* Contador de tags en tiempo real */}
        <div
          data-testid="skills-counter"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 border ${
            isSkillsValid
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-[#F3EFE6] text-[#8C2C45] border-[#C68A8F]'
          }`}
        >
          {isSkillsValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-[#8C2C45]" />
          )}
          <span>{skills.length} / 3 mín. requeridos</span>
        </div>
      </div>

      {/* Alerta en vivo cuando hay menos de 3 habilidades */}
      {!isSkillsValid && (
        <div
          role="alert"
          data-testid="skills-min-alert"
          className="mb-4 p-3 rounded-xl bg-white/90 border border-[#C68A8F] text-[#5A0F24] text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#8C2C45] shrink-0" />
            <span>
              Selecciona mínimo <strong>3 tags de habilidades</strong> para habilitar el envío.
            </span>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-[#8C2C45]/10 text-[#8C2C45] shrink-0">
            Faltan {3 - skills.length}
          </span>
        </div>
      )}

      {/* Input para agregar tags personalizados */}
      <div className="flex gap-2 mb-4">
        <input
          id="custom-skill-input"
          type="text"
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Escribe una habilidad (ej. React, Node, PostgreSQL, GraphQL) y presiona Enter..."
          data-testid="input-custom-skill"
          className="flex-1 px-3.5 py-2.5 bg-white border border-[#C9B8A6] focus:ring-2 focus:ring-[#8C2C45]/20 focus:border-[#8C2C45] rounded-xl text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          data-testid="btn-add-skill"
          className="px-4 py-2.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-[#F3EFE6] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Tag</span>
        </button>
      </div>

      {/* Tags seleccionados actualmente */}
      <div className="mb-4">
        <span className="block text-[11px] font-bold text-[#5A0F24] uppercase tracking-wider mb-2">
          Tags seleccionados ({skills.length}):
        </span>
        {skills.length === 0 ? (
          <div className="p-3 rounded-xl border border-dashed border-[#C9B8A6] bg-white/60 text-center text-xs text-[#5A0F24]/60">
            Aún no has seleccionado tags. Haz clic en las sugerencias de abajo o escribe uno nuevo.
          </div>
        ) : (
          <div
            data-testid="selected-skills-chips"
            className="flex flex-wrap gap-2"
          >
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A0F24] text-[#F3EFE6] text-xs font-bold shadow-2xs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  aria-label={`Eliminar ${skill}`}
                  className="text-[#C68A8F] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selector interactivo de tags sugeridos */}
      <div>
        <span className="block text-[11px] font-semibold text-[#5A0F24]/80 mb-2">
          Tags sugeridos (clic para activar o quitar):
        </span>
        <div
          data-testid="suggested-skills-chips"
          className="flex flex-wrap gap-1.5"
        >
          {SUGGESTED_SKILLS.map((skill) => {
            const isSelected = skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => onToggleSkill(skill)}
                data-testid={`skill-chip-${skill}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#8C2C45] text-white shadow-xs ring-2 ring-[#C68A8F]/50'
                    : 'bg-white text-[#5A0F24] border border-[#C9B8A6] hover:bg-[#F3EFE6] hover:border-[#8C2C45]'
                }`}
              >
                <span>{isSelected ? '✓' : '+'}</span>
                <span>{skill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showSkillsError && (
        <p
          role="alert"
          data-testid="error-skills"
          className="mt-2.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{skillsError}</span>
        </p>
      )}
    </div>
  );
}
