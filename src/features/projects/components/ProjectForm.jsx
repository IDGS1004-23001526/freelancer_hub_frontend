import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Tag,
  DollarSign,
  Calendar,
  Code2,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import Button from '../../ui/Button.jsx';
import Toast from '../../ui/Toast.jsx';
import { useProjectStore } from '../../../stores/project.store.js';
import { useAuthStore } from '../../../stores/auth.store.js';
import {
  PROJECT_CATEGORIES,
  SUGGESTED_SKILLS,
} from '../../../interfaces/project.interface.js';

export default function ProjectForm({ onSuccess }) {
  const navigate = useNavigate();
  const { createProject, loading } = useProjectStore();
  const { user } = useAuthStore();

  // Estados reactivos del formulario
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [description, setDescription] = useState('');

  // Control de interacción para feedback visual de errores (Escenario 2 de la HU)
  const [touched, setTouched] = useState({
    title: false,
    category: false,
    budget: false,
    skills: false,
    estimatedDate: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState(null);

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Fecha mínima sugerida (hoy)
  const todayStr = new Date().toISOString().split('T')[0];

  // Validaciones reactivas en tiempo real
  const validateTitle = () => {
    if (!title.trim()) return 'El título de la convocatoria es obligatorio.';
    if (title.trim().length < 5)
      return 'El título debe contener al menos 5 caracteres descriptivos.';
    return null;
  };

  const validateCategory = () => {
    if (!category.trim()) return 'Debes seleccionar una categoría para el proyecto.';
    return null;
  };

  const validateBudget = () => {
    if (budget === '' || budget === null)
      return 'El presupuesto estimado es obligatorio.';
    const num = Number(budget);
    if (isNaN(num) || num <= 0)
      return 'Ingresa un presupuesto válido mayor a $0.';
    return null;
  };

  const validateSkills = () => {
    if (skills.length < 3) {
      const remaining = 3 - skills.length;
      return `Se requieren mínimo 3 habilidades técnicas (seleccionadas: ${skills.length}/3, faltan ${remaining}).`;
    }
    return null;
  };

  const validateEstimatedDate = () => {
    if (!estimatedDate) return 'La fecha estimada de entrega es obligatoria.';
    return null;
  };

  const titleError =
    touched.title || submitAttempted ? validateTitle() : null;
  const categoryError =
    touched.category || submitAttempted ? validateCategory() : null;
  const budgetError =
    touched.budget || submitAttempted ? validateBudget() : null;
  const skillsError =
    touched.skills || submitAttempted ? validateSkills() : null;
  const estimatedDateError =
    touched.estimatedDate || submitAttempted ? validateEstimatedDate() : null;

  const hasLessThan3Skills = skills.length < 3;
  const invalidFieldsCount = [
    titleError,
    categoryError,
    budgetError,
    skillsError,
    estimatedDateError,
  ].filter(Boolean).length;

  // Toggle chip de habilidad sugerida
  const handleToggleSkill = (skillName) => {
    markTouched('skills');
    if (skills.includes(skillName)) {
      setSkills((prev) => prev.filter((s) => s !== skillName));
    } else {
      if (skills.length >= 15) return;
      setSkills((prev) => [...prev, skillName]);
    }
  };

  // Agregar chip personalizado
  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    markTouched('skills');
    const clean = customSkill.trim();
    if (!clean) return;
    if (!skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkills((prev) => [...prev, clean]);
    }
    setCustomSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    markTouched('skills');
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Atajos de fecha estimada
  const applyDateOffsetDays = (days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const formatted = target.toISOString().split('T')[0];
    setEstimatedDate(formatted);
    markTouched('estimatedDate');
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      title: true,
      category: true,
      budget: true,
      skills: true,
      estimatedDate: true,
    });

    const tErr = validateTitle();
    const cErr = validateCategory();
    const bErr = validateBudget();
    const sErr = validateSkills();
    const dErr = validateEstimatedDate();

    if (tErr || cErr || bErr || sErr || dErr) {
      setToast({
        type: 'error',
        title: 'Campos inválidos detectados',
        message:
          'Por favor revisa los campos resaltados en rojo y asegúrate de elegir al menos 3 habilidades.',
      });
      return;
    }

    const clientDisplayName = user?.fullName
      ? `${user.fullName} • Cliente Verificado`
      : 'Sofía Ramírez • Estudio Nexus';

    const result = await createProject(
      {
        title: title.trim(),
        category,
        budget: Number(budget),
        currency,
        skills,
        estimatedDate,
        description: description.trim(),
      },
      clientDisplayName
    );

    if (result.success && result.project) {
      setToast({
        type: 'success',
        title: '¡Convocatoria publicada con estado ABIERTO!',
        message: `El proyecto "${result.project.title}" ha sido registrado exitosamente. Redirigiendo...`,
      });

      if (onSuccess) {
        onSuccess(result.project);
      }

      setTimeout(() => {
        navigate(`/projects/${result.project.id}`, {
          state: {
            justCreated: true,
            project: result.project,
          },
        });
      }, 900);
    } else {
      setToast({
        type: 'error',
        title: 'Error al publicar',
        message:
          result.error || 'No se pudo registrar la convocatoria. Inténtalo de nuevo.',
      });
    }
  };

  return (
    <div className="w-full">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        data-testid="convocatoria-form"
        className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.1)] border border-[#C9B8A6]/50 relative overflow-hidden space-y-6"
      >
        {/* Glow decorativo superior */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#C68A8F]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera del Formulario */}
        <div className="relative z-10 border-b border-[#C9B8A6]/40 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span className="text-[11px] font-bold text-[#5A0F24] uppercase tracking-wider">
                Publicación Reactiva
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#5A0F24] tracking-tight">
              Publicar Nueva Convocatoria
            </h2>
            <p className="text-xs md:text-sm text-[#5A0F24]/75 mt-1">
              Completa los requerimientos técnicos para recibir propuestas de talento verificado. Al publicarse se activará con el badge{' '}
              <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                ABIERTO
              </span>
              .
            </p>
          </div>

          {/* Resumen de estado en tiempo real */}
          <div className="px-4 py-3 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 shrink-0 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/60 block">
              Estado inicial
            </span>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              ABIERTO
            </span>
          </div>
        </div>

        {/* Banner de Alerta Global ante Errores (Escenario 2 de la HU) */}
        {submitAttempted && invalidFieldsCount > 0 && (
          <div
            role="alert"
            data-testid="form-error-banner"
            className="p-4 rounded-2xl bg-[#fff5f5] border-2 border-[#8C2C45] text-[#5A0F24] flex items-start gap-3 animate-fade-in"
          >
            <AlertCircle className="w-5 h-5 text-[#8C2C45] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-[#8C2C45]">
                No se pudo publicar la convocatoria ({invalidFieldsCount}{' '}
                {invalidFieldsCount === 1 ? 'campo inválido' : 'campos inválidos'})
              </p>
              <p className="text-[#5A0F24]/85">
                Revisa los campos resaltados en rojo para continuar con el registro.
              </p>
            </div>
          </div>
        )}

        {/* 1. Título de la Convocatoria */}
        <div>
          <div className="flex justify-between items-center mb-1.5 px-1">
            <label
              htmlFor="title"
              className="text-xs font-bold text-[#5A0F24] flex items-center gap-1"
            >
              <span>Título de la Convocatoria</span>
              <span className="text-[#8C2C45]">*</span>
            </label>
            <span className="text-[11px] font-medium text-[#9a868a]">
              {title.length}/120 caracteres
            </span>
          </div>
          <div className="relative">
            <div
              className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                titleError ? 'text-[#8C2C45]' : 'text-[#9a868a]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markTouched('title');
              }}
              onBlur={() => markTouched('title')}
              placeholder="ej. Desarrollo de Plataforma Fintech con Custodia Escrow"
              aria-invalid={titleError ? 'true' : 'false'}
              data-testid="input-title"
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs md:text-sm text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all shadow-xs border ${
                titleError
                  ? 'border-[#8C2C45] bg-[#fff5f5]/60 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                  : 'border-[#e8deda] bg-white focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e]'
              }`}
            />
          </div>
          {titleError ? (
            <p
              data-testid="error-title"
              className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1"
            >
              <span>•</span> {titleError}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-[#7d686d]">
              Usa un título claro y específico (mínimo 5 caracteres).
            </p>
          )}
        </div>

        {/* 2. Grid: Categoría y Presupuesto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Categoría */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label
                htmlFor="category"
                className="text-xs font-bold text-[#5A0F24] flex items-center gap-1"
              >
                <span>Categoría del Proyecto</span>
                <span className="text-[#8C2C45]">*</span>
              </label>
              <span className="text-[11px] font-medium text-[#9a868a]">Requerido</span>
            </div>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  categoryError ? 'text-[#8C2C45]' : 'text-[#9a868a]'
                }`}
              >
                <Tag className="w-4 h-4" />
              </div>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  markTouched('category');
                }}
                onBlur={() => markTouched('category')}
                aria-invalid={categoryError ? 'true' : 'false'}
                data-testid="select-category"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs md:text-sm text-[#2b1b1e] focus:outline-none transition-all shadow-xs border cursor-pointer ${
                  categoryError
                    ? 'border-[#8C2C45] bg-[#fff5f5]/60 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                    : 'border-[#e8deda] bg-white focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e]'
                }`}
              >
                <option value="">Selecciona una categoría...</option>
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {categoryError ? (
              <p
                data-testid="error-category"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1"
              >
                <span>•</span> {categoryError}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#7d686d]">
                Clasifica tu proyecto para conectarlo con especialistas del área.
              </p>
            )}
          </div>

          {/* Presupuesto */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label
                htmlFor="budget"
                className="text-xs font-bold text-[#5A0F24] flex items-center gap-1"
              >
                <span>Presupuesto Estimado</span>
                <span className="text-[#8C2C45]">*</span>
              </label>
              <div className="flex items-center gap-1">
                {['USD', 'MXN'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                      currency === curr
                        ? 'bg-[#8C2C45] text-white'
                        : 'bg-[#F3EFE6] text-[#5A0F24]/70 hover:text-[#5A0F24]'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  budgetError ? 'text-[#8C2C45]' : 'text-[#9a868a]'
                }`}
              >
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                id="budget"
                name="budget"
                type="number"
                min="1"
                step="any"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  markTouched('budget');
                }}
                onBlur={() => markTouched('budget')}
                placeholder="ej. 2500"
                aria-invalid={budgetError ? 'true' : 'false'}
                data-testid="input-budget"
                className={`w-full pl-10 pr-16 py-3 rounded-xl text-xs md:text-sm text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all shadow-xs border ${
                  budgetError
                    ? 'border-[#8C2C45] bg-[#fff5f5]/60 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                    : 'border-[#e8deda] bg-white focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-[11px] font-bold text-[#5A0F24]/60">
                  {currency}
                </span>
              </div>
            </div>
            {budgetError ? (
              <p
                data-testid="error-budget"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1"
              >
                <span>•</span> {budgetError}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#7d686d]">
                Monto protegido bajo custodia Escrow al contratar.
              </p>
            )}
          </div>
        </div>

        {/* 3. Selector de Habilidades con Chips Interactivos y Contador en Tiempo Real */}
        <div
          data-testid="skills-section"
          className={`p-5 rounded-2xl border transition-all ${
            skillsError
              ? 'border-[#8C2C45] bg-[#fff5f5]/50 ring-2 ring-[#8C2C45]/15'
              : hasLessThan3Skills
              ? 'border-amber-300/90 bg-[#F3EFE6]/50'
              : 'border-emerald-300/80 bg-emerald-50/20'
          }`}
        >
          {/* Cabecera del Selector + Contador en Tiempo Real */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <label className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#8C2C45]" />
                <span>Habilidades Técnicas Requeridas</span>
                <span className="text-[#8C2C45]">*</span>
              </label>
              <p className="text-[11px] text-[#5A0F24]/70 mt-0.5">
                Selecciona o escribe las tecnologías clave (mínimo 3 requeridas).
              </p>
            </div>

            {/* Contador en Tiempo Real */}
            <div
              data-testid="skills-counter"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 border ${
                hasLessThan3Skills
                  ? 'bg-amber-100/90 text-[#8C2C45] border-[#8C2C45]/40'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {hasLessThan3Skills ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#8C2C45]" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>
                {skills.length} / 3 mín. seleccionadas
              </span>
            </div>
          </div>

          {/* Alerta visual en tiempo real si hay menos de 3 habilidades */}
          {hasLessThan3Skills && (
            <div
              role="alert"
              data-testid="skills-min-alert"
              className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                skillsError
                  ? 'bg-[#fdeeee] border-[#8C2C45] text-[#5A0F24] font-semibold'
                  : 'bg-amber-50 border-amber-300/90 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#8C2C45] shrink-0" />
                <span>
                  <strong>Alerta de requisito:</strong> Selecciona al menos{' '}
                  <strong>3 habilidades</strong> para publicar la convocatoria (te{' '}
                  {3 - skills.length === 1
                    ? 'falta 1 habilidad'
                    : `faltan ${3 - skills.length} habilidades`}
                  ).
                </span>
              </div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white/80 text-[#8C2C45] shrink-0">
                Faltan {3 - skills.length}
              </span>
            </div>
          )}

          {/* Input para agregar habilidad personalizada */}
          <div className="flex gap-2 mb-4">
            <input
              id="customSkill"
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSkill();
                }
              }}
              placeholder="Añadir otra habilidad (ej. NestJS, Go, Redis) y presiona Enter..."
              data-testid="input-custom-skill"
              className="flex-1 px-3.5 py-2.5 bg-white border border-[#e8deda] focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all shadow-2xs"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCustomSkill}
              data-testid="btn-add-skill"
              className="px-4 py-2.5 text-xs font-bold border-[#C9B8A6]"
            >
              <Plus className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Agregar</span>
            </Button>
          </div>

          {/* Chips de Habilidades Seleccionadas */}
          <div className="mb-4">
            <span className="block text-[11px] font-bold text-[#5A0F24] uppercase tracking-wider mb-2">
              Habilidades activas en tu convocatoria ({skills.length}):
            </span>
            {skills.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-[#C9B8A6] bg-white/60 text-center text-xs text-[#5A0F24]/60">
                Ninguna habilidad seleccionada todavía. Haz clic en los chips de abajo para agregarlas.
              </div>
            ) : (
              <div
                data-testid="selected-skills-chips"
                className="flex flex-wrap gap-2"
              >
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A0F24] text-[#F3EFE6] text-xs font-semibold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Quitar ${skill}`}
                      className="text-[#C68A8F] hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Chips Interactivos de Sugerencias Populares */}
          <div>
            <span className="block text-[11px] font-semibold text-[#5A0F24]/75 mb-2">
              Chips rápidos de habilidades (clic para activar/desactivar):
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
                    onClick={() => handleToggleSkill(skill)}
                    data-testid={`skill-chip-${skill}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#8C2C45] text-white shadow-xs ring-2 ring-[#8C2C45]/25'
                        : 'bg-white text-[#5A0F24] border border-[#C9B8A6]/60 hover:bg-[#F3EFE6] hover:border-[#8C2C45]/50'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {skillsError && (
            <p
              data-testid="error-skills"
              className="mt-2.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1"
            >
              <span>•</span> {skillsError}
            </p>
          )}
        </div>

        {/* 4. Datepicker para Fecha Estimada + Descripción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Datepicker Fecha Estimada */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label
                htmlFor="estimatedDate"
                className="text-xs font-bold text-[#5A0F24] flex items-center gap-1"
              >
                <span>Fecha Estimada de Entrega</span>
                <span className="text-[#8C2C45]">*</span>
              </label>
              <span className="text-[11px] font-medium text-[#9a868a]">Datepicker</span>
            </div>

            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  estimatedDateError ? 'text-[#8C2C45]' : 'text-[#9a868a]'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="estimatedDate"
                name="estimatedDate"
                type="date"
                min={todayStr}
                value={estimatedDate}
                onChange={(e) => {
                  setEstimatedDate(e.target.value);
                  markTouched('estimatedDate');
                }}
                onBlur={() => markTouched('estimatedDate')}
                aria-invalid={estimatedDateError ? 'true' : 'false'}
                data-testid="input-estimated-date"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs md:text-sm text-[#2b1b1e] focus:outline-none transition-all shadow-xs border cursor-pointer ${
                  estimatedDateError
                    ? 'border-[#8C2C45] bg-[#fff5f5]/60 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                    : 'border-[#e8deda] bg-white focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e]'
                }`}
              />
            </div>

            {/* Botones rápidos de fecha estimada */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-[#5A0F24]/65">
                Plazos sugeridos:
              </span>
              {[
                { label: '+15 días', days: 15 },
                { label: '+1 mes', days: 30 },
                { label: '+2 meses', days: 60 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyDateOffsetDays(preset.days)}
                  className="px-2 py-0.5 rounded-lg bg-[#F3EFE6] hover:bg-[#C68A8F]/25 text-[#5A0F24] text-[10px] font-bold border border-[#C9B8A6]/50 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {estimatedDateError ? (
              <p
                data-testid="error-estimated-date"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1"
              >
                <span>•</span> {estimatedDateError}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#7d686d]">
                Fecha objetivo para concluir todos los entregables.
              </p>
            )}
          </div>

          {/* Descripción / Alcance Adicional */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label
                htmlFor="description"
                className="text-xs font-bold text-[#5A0F24] flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Alcance y Entregables (Opcional)</span>
              </label>
              <span className="text-[11px] font-medium text-[#9a868a]">
                {description.length}/1000
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla los objetivos, hitos de entrega y criterios de aceptación para los candidatos..."
              data-testid="input-description"
              className="w-full p-3 bg-white border border-[#e8deda] focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs md:text-sm text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all shadow-xs resize-y"
            />
          </div>
        </div>

        {/* Footer de Envío */}
        <div className="pt-4 border-t border-[#C9B8A6]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5A0F24]/75">
            <ShieldCheck className="w-4 h-4 text-[#8C2C45] shrink-0" />
            <span>
              Al registrar, tu convocatoria será visible inmediatamente con el badge{' '}
              <strong className="text-emerald-800">ABIERTO</strong>.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-initial px-5 py-3"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              data-testid="btn-submit-convocatoria"
              className="flex-1 sm:flex-initial px-7 py-3 bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-[0_8px_20px_-4px_rgba(140,44,69,0.4)]"
            >
              <span>
                {loading ? 'Publicando Convocatoria...' : 'Publicar Convocatoria'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
