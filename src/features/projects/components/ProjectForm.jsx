import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import Toast from '../../ui/Toast.jsx';
import SkillTagsSelector from './SkillTagsSelector.jsx';
import { apiClient } from '../../../api/client.js';
import { useProjectStore } from '../../../stores/project.store.js';
import { useAuthStore } from '../../../stores/auth.store.js';
import { PROJECT_CATEGORIES } from '../../../interfaces/project.interface.js';

/**
 * Obtiene la fecha local en formato YYYY-MM-DD
 */
function getLocalDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProjectForm({ onValidationChange }) {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const { user, accessToken } = useAuthStore();

  // Estado de los campos del formulario (HU-01 / FREEL-37)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState('Desarrollo Web');

  // Control de campos tocados para mostrar feedback en vivo
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    budget: false,
    estimatedDate: false,
    skills: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const todayStr = useMemo(() => getLocalDateString(0), []);
  const tomorrowStr = useMemo(() => getLocalDateString(1), []);

  const markTouched = (field) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  // Validaciones en vivo (FREEL-37)
  const validation = useMemo(() => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const numericBudget = budget === '' ? NaN : Number(budget);

    // 1. Título (mínimo 10 caracteres)
    let titleError = null;
    if (!trimmedTitle) {
      titleError =
        'El título de la convocatoria es obligatorio (mínimo 10 caracteres).';
    } else if (trimmedTitle.length < 10) {
      titleError = `El título debe tener al menos 10 caracteres (actual: ${trimmedTitle.length}/10).`;
    }

    // 2. Descripción detallada (mínimo 30 caracteres)
    let descriptionError = null;
    if (!trimmedDesc) {
      descriptionError =
        'La descripción detallada es obligatoria (mínimo 30 caracteres).';
    } else if (trimmedDesc.length < 30) {
      descriptionError = `La descripción detallada debe tener al menos 30 caracteres (actual: ${trimmedDesc.length}/30).`;
    }

    // 3. Presupuesto estimado en MXN (> 0)
    let budgetError = null;
    if (budget === '' || budget === null) {
      budgetError = 'El presupuesto estimado en MXN es obligatorio.';
    } else if (Number.isNaN(numericBudget) || numericBudget <= 0) {
      budgetError = 'El presupuesto estimado debe ser mayor a $0 MXN.';
    }

    // 4. Fecha estimada de entrega (posterior a hoy)
    let estimatedDateError = null;
    if (!estimatedDate) {
      estimatedDateError = 'Selecciona una fecha estimada de entrega.';
    } else if (estimatedDate <= todayStr) {
      estimatedDateError =
        'La fecha estimada de entrega debe ser posterior a hoy.';
    }

    // 5. Selector interactivo de tags de habilidades (mínimo 3 requeridos)
    let skillsError = null;
    if (skills.length < 3) {
      const remaining = 3 - skills.length;
      skillsError = `Selecciona al menos 3 habilidades requeridas (seleccionadas: ${skills.length}/3, ${
        remaining === 1 ? 'falta 1' : `faltan ${remaining}`
      }).`;
    }

    const hasErrors = Boolean(
      titleError ||
        descriptionError ||
        budgetError ||
        estimatedDateError ||
        skillsError
    );

    return {
      titleError,
      descriptionError,
      budgetError,
      estimatedDateError,
      skillsError,
      isTitleValid: !titleError,
      isDescriptionValid: !descriptionError,
      isBudgetValid: !budgetError,
      isDateValid: !estimatedDateError,
      isSkillsValid: !skillsError,
      isValid: !hasErrors,
    };
  }, [title, description, budget, estimatedDate, skills, todayStr]);

  const formattedPreviewBudget =
    budget && !Number.isNaN(Number(budget)) && Number(budget) > 0
      ? new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 2,
        }).format(Number(budget))
      : null;

  // Notificar al componente padre los estados de validación para el checklist lateral
  useEffect(() => {
    if (!onValidationChange) return;
    onValidationChange([
      {
        id: 'req-title',
        label: 'Título del proyecto (mín. 10 caracteres)',
        met: validation.isTitleValid,
        detail: `${title.trim().length}/10 caracteres`,
      },
      {
        id: 'req-description',
        label: 'Descripción detallada (mín. 30 caracteres)',
        met: validation.isDescriptionValid,
        detail: `${description.trim().length}/30 caracteres`,
      },
      {
        id: 'req-budget',
        label: 'Presupuesto estimado en MXN (> $0)',
        met: validation.isBudgetValid,
        detail: formattedPreviewBudget
          ? `${formattedPreviewBudget} MXN`
          : 'Pendiente',
      },
      {
        id: 'req-date',
        label: 'Fecha estimada de entrega (posterior a hoy)',
        met: validation.isDateValid,
        detail: estimatedDate || 'Sin seleccionar',
      },
      {
        id: 'req-skills',
        label: 'Tags de habilidades (mín. 3 requeridos)',
        met: validation.isSkillsValid,
        detail: `${skills.length}/3 seleccionados`,
      },
    ]);
  }, [
    onValidationChange,
    validation,
    title,
    description,
    formattedPreviewBudget,
    estimatedDate,
    skills,
  ]);

  const showTitleError =
    (touched.title || title.length > 0) && validation.titleError;
  const showDescriptionError =
    (touched.description || description.length > 0) &&
    validation.descriptionError;
  const showBudgetError =
    (touched.budget || budget !== '') && validation.budgetError;
  const showDateError =
    (touched.estimatedDate || estimatedDate !== '') &&
    validation.estimatedDateError;
  const showSkillsError =
    (touched.skills || skills.length > 0) && validation.skillsError;

  const handleToggleSkill = (skillName) => {
    markTouched('skills');
    setSkills((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter((item) => item !== skillName);
      }
      if (prev.length >= 15) return prev;
      return [...prev, skillName];
    });
  };

  const handleAddCustomSkill = (cleanSkill) => {
    markTouched('skills');
    if (!skills.some((s) => s.toLowerCase() === cleanSkill.toLowerCase())) {
      setSkills((prev) => [...prev, cleanSkill]);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    markTouched('skills');
    setSkills((prev) => prev.filter((item) => item !== skillToRemove));
  };

  const applyDateOffsetDays = (days) => {
    const targetDate = getLocalDateString(days);
    setEstimatedDate(targetDate);
    markTouched('estimatedDate');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      title: true,
      description: true,
      budget: true,
      estimatedDate: true,
      skills: true,
    });

    if (!validation.isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
      currency: 'MXN',
      estimatedDate,
      skills,
      category: category || 'Desarrollo Web',
    };

    const jwtToken =
      accessToken ||
      localStorage.getItem('fh_access_token') ||
      localStorage.getItem('token') ||
      '';

    const clientDisplayName = user?.fullName
      ? `${user.fullName} • Cliente Verificado`
      : 'Sofía Ramírez • Estudio Nexus';

    try {
      const response = await apiClient.post('/v1/projects', payload, {
        headers: jwtToken
          ? { Authorization: `Bearer ${jwtToken}` }
          : undefined,
      });

      const createdFromApi = response?.data?.data || response?.data;

      await createProject(payload, clientDisplayName);

      setToast({
        type: 'success',
        title: '¡Convocatoria publicada exitosamente!',
        message: 'Redirigiendo al feed de convocatorias...',
      });

      setTimeout(() => {
        navigate('/projects', {
          state: {
            justCreated: true,
            newProjectId: createdFromApi?.id,
          },
        });
      }, 500);
    } catch {
      const result = await createProject(payload, clientDisplayName);

      if (result.success && result.project) {
        setToast({
          type: 'success',
          title: '¡Convocatoria publicada con estado ABIERTO!',
          message: 'Redirigiendo al feed de proyectos...',
        });

        setTimeout(() => {
          navigate('/projects', {
            state: {
              justCreated: true,
              newProjectId: result.project.id,
            },
          });
        }, 500);
      } else {
        setToast({
          type: 'error',
          title: 'Error al publicar la convocatoria',
          message:
            result.error ||
            'No fue posible registrar el proyecto. Verifica tu conexión e inténtalo de nuevo.',
        });
        setIsSubmitting(false);
      }
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
        data-testid="create-project-form"
        className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] border border-[#C9B8A6]/60 relative overflow-hidden space-y-6"
      >
        {/* Decoración con paleta Rosa Polvo y Arena */}
        <div className="absolute -top-14 -right-14 w-60 h-60 bg-[#C68A8F]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-[#C9B8A6]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado del Formulario */}
        <div className="relative z-10 border-b border-[#C9B8A6]/50 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/50 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span className="text-[11px] font-bold text-[#5A0F24] uppercase tracking-wider">
                Nueva Convocatoria de Proyecto
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#5A0F24] tracking-tight">
              Publicar Requerimientos del Proyecto
            </h1>
            <p className="text-xs sm:text-sm text-[#5A0F24]/75 mt-1">
              Define el alcance, presupuesto en MXN y habilidades clave para conectar con freelancers verificados.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 shrink-0 self-start sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/70 block">
              Moneda Oficial
            </span>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#5A0F24] text-[#F3EFE6]">
              MXN • Peso Mexicano
            </span>
          </div>
        </div>

        {/* 1. TÍTULO DE LA CONVOCATORIA (mínimo 10 caracteres) */}
        <div className="relative z-10">
          <div className="flex flex-wrap justify-between items-center gap-1 mb-1.5 px-1">
            <label
              htmlFor="project-title"
              className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Título de la Convocatoria</span>
              <span className="text-[#8C2C45]">*</span>
            </label>
            <span
              data-testid="title-counter"
              className={`text-[11px] font-bold ${
                validation.isTitleValid ? 'text-emerald-700' : 'text-[#8C2C45]'
              }`}
            >
              {title.trim().length} / mín. 10 caracteres
            </span>
          </div>

          <input
            id="project-title"
            name="title"
            type="text"
            maxLength={120}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markTouched('title');
            }}
            onBlur={() => markTouched('title')}
            placeholder="Ej. Desarrollo de Plataforma Web E-Commerce con Pasarela Escrow"
            aria-invalid={showTitleError ? 'true' : 'false'}
            data-testid="input-title"
            className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border ${
              showTitleError
                ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                : validation.isTitleValid
                ? 'border-emerald-500/70 bg-white focus:ring-2 focus:ring-emerald-500/20'
                : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:ring-2 focus:ring-[#8C2C45]/20 focus:border-[#8C2C45]'
            }`}
          />

          {showTitleError ? (
            <p
              role="alert"
              data-testid="error-title"
              className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.titleError}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-[#5A0F24]/65">
              Escribe un título claro y descriptivo de al menos 10 caracteres.
            </p>
          )}
        </div>

        {/* 2. DESCRIPCIÓN DETALLADA (mínimo 30 caracteres) */}
        <div className="relative z-10">
          <div className="flex flex-wrap justify-between items-center gap-1 mb-1.5 px-1">
            <label
              htmlFor="project-description"
              className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Descripción Detallada del Proyecto</span>
              <span className="text-[#8C2C45]">*</span>
            </label>
            <span
              data-testid="description-counter"
              className={`text-[11px] font-bold ${
                validation.isDescriptionValid
                  ? 'text-emerald-700'
                  : 'text-[#8C2C45]'
              }`}
            >
              {description.trim().length} / mín. 30 caracteres
            </span>
          </div>

          <textarea
            id="project-description"
            name="description"
            rows={4}
            maxLength={1500}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              markTouched('description');
            }}
            onBlur={() => markTouched('description')}
            placeholder="Describe detalladamente los requerimientos técnicos, entregables esperados, arquitectura y criterios de aceptación (mínimo 30 caracteres)..."
            aria-invalid={showDescriptionError ? 'true' : 'false'}
            data-testid="input-description"
            className={`w-full p-4 rounded-xl text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border resize-y ${
              showDescriptionError
                ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                : validation.isDescriptionValid
                ? 'border-emerald-500/70 bg-white focus:ring-2 focus:ring-emerald-500/20'
                : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:ring-2 focus:ring-[#8C2C45]/20 focus:border-[#8C2C45]'
            }`}
          />

          {showDescriptionError ? (
            <p
              role="alert"
              data-testid="error-description"
              className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.descriptionError}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-[#5A0F24]/65">
              Incluye el contexto del proyecto, módulos principales y entregables (mínimo 30 caracteres).
            </p>
          )}
        </div>

        {/* 3. GRID: PRESUPUESTO ESTIMADO EN MXN (> 0) + FECHA ESTIMADA DE ENTREGA (posterior a hoy) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Presupuesto Estimado en MXN */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label
                htmlFor="project-budget"
                className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Presupuesto Estimado (MXN)</span>
                <span className="text-[#8C2C45]">*</span>
              </label>
              <span className="text-[11px] font-extrabold text-[#5A0F24] bg-[#F3EFE6] px-2 py-0.5 rounded-md border border-[#C9B8A6]/60">
                MXN
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C2C45] font-bold text-sm">
                $
              </div>
              <input
                id="project-budget"
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
                placeholder="Ej. 25000"
                aria-invalid={showBudgetError ? 'true' : 'false'}
                data-testid="input-budget"
                className={`w-full pl-8 pr-16 py-3 rounded-xl text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border ${
                  showBudgetError
                    ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                    : validation.isBudgetValid
                    ? 'border-emerald-500/70 bg-white focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:ring-2 focus:ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs font-extrabold text-[#5A0F24]">
                  MXN
                </span>
              </div>
            </div>

            {showBudgetError ? (
              <p
                role="alert"
                data-testid="error-budget"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.budgetError}</span>
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#5A0F24]/65">
                {formattedPreviewBudget
                  ? `Monto configurado: ${formattedPreviewBudget} MXN`
                  : 'Ingresa un monto mayor a $0 MXN.'}
              </p>
            )}
          </div>

          {/* Selector de Fecha Estimada de Entrega (posterior a hoy) */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label
                htmlFor="project-date"
                className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Fecha Estimada de Entrega</span>
                <span className="text-[#8C2C45]">*</span>
              </label>
              <span className="text-[11px] font-medium text-[#8C2C45]">
                Posterior a hoy
              </span>
            </div>

            <input
              id="project-date"
              name="estimatedDate"
              type="date"
              min={tomorrowStr}
              value={estimatedDate}
              onChange={(e) => {
                setEstimatedDate(e.target.value);
                markTouched('estimatedDate');
              }}
              onBlur={() => markTouched('estimatedDate')}
              aria-invalid={showDateError ? 'true' : 'false'}
              data-testid="input-estimated-date"
              className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm text-[#2b1b1e] focus:outline-none transition-all border cursor-pointer ${
                showDateError
                  ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20 focus:border-[#8C2C45]'
                  : validation.isDateValid
                  ? 'border-emerald-500/70 bg-white focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:ring-2 focus:ring-[#8C2C45]/20 focus:border-[#8C2C45]'
              }`}
            />

            {/* Botones rápidos de plazo */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-[#5A0F24]/70">
                Plazos rápidos:
              </span>
              {[
                { label: '+7 días', days: 7 },
                { label: '+15 días', days: 15 },
                { label: '+1 mes', days: 30 },
                { label: '+2 meses', days: 60 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyDateOffsetDays(preset.days)}
                  className="px-2 py-0.5 rounded-lg bg-[#F3EFE6] hover:bg-[#C68A8F]/30 text-[#5A0F24] text-[10px] font-bold border border-[#C9B8A6]/60 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {showDateError && (
              <p
                role="alert"
                data-testid="error-estimated-date"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.estimatedDateError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Categoría del Proyecto */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <label
              htmlFor="project-category"
              className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Categoría de la Convocatoria</span>
            </label>
            <span className="text-[11px] font-medium text-[#5A0F24]/60">
              Clasificación en el feed
            </span>
          </div>
          <select
            id="project-category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            data-testid="select-category"
            className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm text-[#2b1b1e] bg-[#F3EFE6]/40 border border-[#C9B8A6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C2C45]/20 focus:border-[#8C2C45] transition-all cursor-pointer"
          >
            {PROJECT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 5. COMPONENTE SEPARADO: SELECTOR INTERACTIVO DE TAGS DE HABILIDADES */}
        <SkillTagsSelector
          skills={skills}
          onToggleSkill={handleToggleSkill}
          onAddCustomSkill={handleAddCustomSkill}
          onRemoveSkill={handleRemoveSkill}
          isSkillsValid={validation.isSkillsValid}
          showSkillsError={showSkillsError}
          skillsError={validation.skillsError}
        />

        {/* Footer con Botón de Envío Deshabilitado mientras existan errores */}
        <div className="relative z-10 pt-5 border-t border-[#C9B8A6]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#5A0F24]/80 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8C2C45] shrink-0" />
            <span>
              {validation.isValid
                ? 'Todos los campos son válidos. Listo para publicar en el feed.'
                : 'Completa todos los campos requeridos sin errores para habilitar el envío.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#F3EFE6] hover:bg-[#C9B8A6]/40 text-[#5A0F24] border border-[#C9B8A6] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!validation.isValid || isSubmitting}
              data-testid="btn-submit-convocatoria"
              className={`flex-1 sm:flex-initial px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                !validation.isValid || isSubmitting
                  ? 'bg-[#C9B8A6]/60 text-[#5A0F24]/50 border border-[#C9B8A6] cursor-not-allowed opacity-70'
                  : 'bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-[0_8px_22px_-4px_rgba(90,15,36,0.4)] cursor-pointer'
              }`}
            >
              <span>
                {isSubmitting
                  ? 'Publicando Convocatoria...'
                  : 'Publicar Convocatoria'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
