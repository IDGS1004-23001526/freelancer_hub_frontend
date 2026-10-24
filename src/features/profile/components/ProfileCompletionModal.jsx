import React, { useState, useEffect } from 'react';
// Importar iconos de Lucide
import { X, Sparkles, CheckCircle2, Briefcase, FolderGit2, Code2, DollarSign, ExternalLink, Trash2, Plus, Loader2, ArrowRight, ArrowLeft, Award, User } from 'lucide-react';
import { profileApi } from '../../../api/profile.api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';

const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Next.js',
  'Express',
  'Tailwind CSS',
  'PostgreSQL',
  'Python',
  'Docker',
  'AWS',
  'UI/UX Design',
  'Figma',
  'GraphQL',
  'MongoDB',
  'Git',
];

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  initialStep = 1,
  onProgressUpdated,
}) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Paso 1 State: Información Personal y Profesional (Mapeado a BD y Backend)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Paso 2 State: Portafolio
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    projectUrl: '',
    imageUrl: '',
  });

  // Paso 3 State: Habilidades
  const [skills, setSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Status de onboarding general
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(initialStep);
      loadProfileData();
    }
  }, [isOpen, initialStep]);

  const loadProfileData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Obtener estado de onboarding
      const statusRes = await profileApi.getOnboardingStatus().catch(() => null);
      if (statusRes?.data) {
        setOnboardingStatus(statusRes.data);
      }

      // 2. Obtener datos completos del perfil
      const profileRes = await profileApi.getMyProfile().catch(() => null);
      if (profileRes?.data) {
        const p = profileRes.data;
        if (p.first_name) setFirstName(p.first_name);
        if (p.last_name) setLastName(p.last_name);
        if (p.phone) setPhone(p.phone);
        if (p.professionalTitle) setProfessionalTitle(p.professionalTitle);
        if (p.bio) setBio(p.bio);
        if (p.hourlyRate) setHourlyRate(String(p.hourlyRate));
        if (p.portfolioItems) setPortfolioItems(p.portfolioItems);
        if (p.skills) setSkills(p.skills);
      } else {
        // Fallback local storage
        const saved = localStorage.getItem('fh_local_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.first_name) setFirstName(parsed.first_name);
          if (parsed.last_name) setLastName(parsed.last_name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.professionalTitle) setProfessionalTitle(parsed.professionalTitle);
          if (parsed.bio) setBio(parsed.bio);
          if (parsed.hourlyRate) setHourlyRate(String(parsed.hourlyRate));
          if (parsed.portfolioItems) setPortfolioItems(parsed.portfolioItems);
          if (parsed.skills) setSkills(parsed.skills);
        }
      }
    } catch {
      // Silent error fallback
    } finally {
      setLoading(false);
    }
  };

  // Guardar Paso 1: Información Personal y Profesional
  const handleSaveStep1 = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const rateNum = parseFloat(hourlyRate);
    if (!firstName.trim()) {
      setErrorMessage('El nombre es obligatorio.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Los apellidos son obligatorios.');
      return;
    }
    if (!professionalTitle.trim() || professionalTitle.trim().length < 3) {
      setErrorMessage('El título profesional debe tener al menos 3 caracteres.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 10) {
      setErrorMessage('La biografía debe tener al menos 10 caracteres explicativos.');
      return;
    }
    if (isNaN(rateNum) || rateNum <= 0) {
      setErrorMessage('Ingresa una tarifa por hora válida mayor a cero.');
      return;
    }

    setActionLoading(true);
    try {
      // Payload alineado con el backend (first_name, last_name, phone, bio, etc.)
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        professionalTitle: professionalTitle.trim(),
        bio: bio.trim(),
        hourlyRate: rateNum,
      };

      await profileApi.updateProfile(payload).catch((err) => {
        // Guardar localmente si falla conexión
        const existing = JSON.parse(localStorage.getItem('fh_local_profile') || '{}');
        localStorage.setItem(
          'fh_local_profile',
          JSON.stringify({ ...existing, ...payload })
        );
      });

      setSuccessMessage('¡Información guardada correctamente!');
      refreshStatus();
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveStep(2);
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar la información.');
    } finally {
      setActionLoading(false);
    }
  };

  // Guardar Paso 2: Agregar Proyecto al Portafolio
  const handleAddPortfolioItem = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newProject.title.trim() || newProject.title.trim().length < 3) {
      setErrorMessage('El título del proyecto debe tener al menos 3 caracteres.');
      return;
    }
    if (!newProject.description.trim() || newProject.description.trim().length < 10) {
      setErrorMessage('La descripción del proyecto debe tener al menos 10 caracteres.');
      return;
    }
    if (!newProject.projectUrl.trim()) {
      setErrorMessage('El enlace o URL del proyecto es obligatorio.');
      return;
    }

    let formattedUrl = newProject.projectUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        projectUrl: formattedUrl,
        imageUrl: newProject.imageUrl.trim() || null,
      };

      const res = await profileApi.addPortfolioItem(payload).catch(() => {
        const simulated = {
          id: `item_${Date.now()}`,
          profileId: 'local',
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('fh_local_profile') || '{}');
        const list = existing.portfolioItems || [];
        list.unshift(simulated);
        localStorage.setItem(
          'fh_local_profile',
          JSON.stringify({ ...existing, portfolioItems: list })
        );
        return { data: simulated };
      });

      if (res?.data) {
        setPortfolioItems((prev) => [res.data, ...prev]);
        setNewProject({ title: '', description: '', projectUrl: '', imageUrl: '' });
        setSuccessMessage('¡Proyecto añadido a tu portafolio con éxito!');
        refreshStatus();
        setTimeout(() => setSuccessMessage(null), 2500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error al agregar proyecto al portafolio.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePortfolioItem = async (itemId) => {
    setActionLoading(true);
    try {
      await profileApi.deletePortfolioItem(itemId).catch(() => {
        const existing = JSON.parse(localStorage.getItem('fh_local_profile') || '{}');
        const list = (existing.portfolioItems || []).filter((it) => it.id !== itemId);
        localStorage.setItem(
          'fh_local_profile',
          JSON.stringify({ ...existing, portfolioItems: list })
        );
      });

      setPortfolioItems((prev) => prev.filter((item) => item.id !== itemId));
      refreshStatus();
    } catch (err) {
      setErrorMessage(err.message || 'Error al eliminar el proyecto.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSkill = (skillName) => {
    if (skills.includes(skillName)) {
      setSkills((prev) => prev.filter((s) => s !== skillName));
    } else {
      if (skills.length >= 30) {
        setErrorMessage('Has alcanzado el límite máximo de 30 habilidades.');
        return;
      }
      setSkills((prev) => [...prev, skillName]);
    }
  };

  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setCustomSkillInput('');
      return;
    }
    if (skills.length >= 30) {
      setErrorMessage('Has alcanzado el límite máximo de 30 habilidades.');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSaveStep3 = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (skills.length === 0) {
      setErrorMessage('Debes agregar al menos una habilidad técnica.');
      return;
    }

    setActionLoading(true);
    try {
      await profileApi.updateSkills({ skills }).catch(() => {
        const existing = JSON.parse(localStorage.getItem('fh_local_profile') || '{}');
        localStorage.setItem(
          'fh_local_profile',
          JSON.stringify({ ...existing, skills })
        );
      });

      setSuccessMessage('¡Habilidades técnicas actualizadas con éxito!');
      refreshStatus();
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar habilidades técnicas.');
    } finally {
      setActionLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      const statusRes = await profileApi.getOnboardingStatus().catch(() => null);
      if (statusRes?.data) {
        setOnboardingStatus(statusRes.data);
        if (onProgressUpdated) onProgressUpdated(statusRes.data);
      } else {
        const step1Done = Boolean(firstName && lastName && professionalTitle && bio && hourlyRate);
        const step2Done = portfolioItems.length > 0;
        const step3Done = skills.length > 0;
        const completedCount = [step1Done, step2Done, step3Done].filter(Boolean).length;
        const pct = Math.round((completedCount / 3) * 100);
        const simulatedStatus = {
          totalSteps: 3,
          completedSteps: completedCount,
          percentage: pct,
          isFullyCompleted: completedCount === 3,
        };
        setOnboardingStatus(simulatedStatus);
        if (onProgressUpdated) onProgressUpdated(simulatedStatus);
      }
    } catch {
      // Ignorar
    }
  };

  if (!isOpen) return null;

  const step1Complete = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    professionalTitle.trim().length >= 3 &&
    bio.trim().length >= 10 &&
    Number(hourlyRate) > 0
  );
  const step2Complete = portfolioItems.length > 0;
  const step3Complete = skills.length > 0;
  const completedCount = [step1Complete, step2Complete, step3Complete].filter(Boolean).length;
  const calculatedPercentage = Math.round((completedCount / 3) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(90,15,36,0.25)] border border-[#C9B8A6]/60 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C68A8F]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#C9B8A6]/40 bg-[#F3EFE6]/60 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-2 text-xs font-semibold text-[#5A0F24]/70">
                {completedCount} de 3 pasos completados ({calculatedPercentage}%)
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#5A0F24]">
              Completar Perfil Profesional
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5A0F24]/60 hover:text-[#5A0F24] hover:bg-[#C9B8A6]/30 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E8DEDA] h-1.5 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#8C2C45] to-[#5A0F24] transition-all duration-500 ease-out"
            style={{ width: `${calculatedPercentage}%` }}
          />
        </div>

        {/* Step Tabs Navigation */}
        <div className="grid grid-cols-3 border-b border-[#C9B8A6]/30 bg-white shrink-0 text-center text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeStep === 1
                ? 'border-[#8C2C45] text-[#8C2C45] bg-[#F3EFE6]/40'
                : 'border-transparent text-[#5A0F24]/60 hover:text-[#5A0F24]'
            }`}
          >
            {step1Complete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-[#8C2C45]/15 text-[#8C2C45] text-[10px] flex items-center justify-center font-bold shrink-0">
                1
              </span>
            )}
            <span className="truncate">Información</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeStep === 2
                ? 'border-[#8C2C45] text-[#8C2C45] bg-[#F3EFE6]/40'
                : 'border-transparent text-[#5A0F24]/60 hover:text-[#5A0F24]'
            }`}
          >
            {step2Complete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-[#8C2C45]/15 text-[#8C2C45] text-[10px] flex items-center justify-center font-bold shrink-0">
                2
              </span>
            )}
            <span className="truncate">Portafolio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeStep === 3
                ? 'border-[#8C2C45] text-[#8C2C45] bg-[#F3EFE6]/40'
                : 'border-transparent text-[#5A0F24]/60 hover:text-[#5A0F24]'
            }`}
          >
            {step3Complete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-[#8C2C45]/15 text-[#8C2C45] text-[10px] flex items-center justify-center font-bold shrink-0">
                3
              </span>
            )}
            <span className="truncate">Habilidades</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between animate-fade-in">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-600 hover:text-red-900 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {successMessage}
              </span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-600 hover:text-emerald-900 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ===================== PASO 1 ===================== */}
          {activeStep === 1 && (
            <form onSubmit={handleSaveStep1} className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/40">
                <div className="w-9 h-9 rounded-xl bg-[#8C2C45] text-white flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#5A0F24]">
                    Paso 1: Información Personal y Profesional
                  </h3>
                  <p className="text-[11px] text-[#5A0F24]/75">
                    Proporciona tus datos de identidad, especialidad y tarifa.
                  </p>
                </div>
              </div>

              {/* Nombre y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  id="firstName"
                  label="Nombre"
                  placeholder="ej. Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  id="lastName"
                  label="Apellidos"
                  placeholder="ej. Pérez Gómez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              {/* Teléfono */}
              <Input
                id="phone"
                label="Teléfono de Contacto"
                placeholder="ej. +524771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {/* Título Profesional */}
              <Input
                id="professionalTitle"
                label="Título Profesional"
                placeholder="ej. Senior Fullstack Developer & Cloud Architect"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                required
                helperText={`${professionalTitle.length}/120 caracteres (mínimo 3)`}
              />

              {/* Biografía */}
              <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label htmlFor="bio" className="text-xs font-semibold text-[#48202b]">
                    Biografía Profesional
                  </label>
                  <span className="text-[11px] font-medium text-[#9a868a]">
                    {bio.length}/2000 caracteres
                  </span>
                </div>
                <textarea
                  id="bio"
                  rows={4}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe detalladamente tu experiencia, proyectos y soluciones..."
                  className="w-full p-3.5 bg-white border border-[#e8deda] focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs md:text-sm text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all resize-y shadow-xs"
                />
              </div>

              {/* Tarifa por hora */}
              <Input
                id="hourlyRate"
                label="Tarifa por Hora (USD)"
                type="number"
                min="1"
                max="10000"
                step="0.5"
                icon={DollarSign}
                placeholder="ej. 45"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                helperText="Monto en dólares estadounidenses que cobras por hora."
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-[#8C2C45] hover:bg-[#5A0F24] text-white"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>Guardar y Continuar al Portafolio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ===================== PASO 2 ===================== */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/40">
                <div className="w-9 h-9 rounded-xl bg-[#8C2C45] text-white flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#5A0F24]">
                    Paso 2: Muestras de tu Portafolio
                  </h3>
                  <p className="text-[11px] text-[#5A0F24]/75">
                    Demuestra tu experiencia con proyectos concluidos.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddPortfolioItem}
                className="p-4 rounded-2xl bg-[#F3EFE6]/40 border border-[#C9B8A6]/40 space-y-3"
              >
                <h4 className="text-xs font-bold text-[#5A0F24] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#8C2C45]" />
                  Añadir Nueva Muestra o Proyecto
                </h4>

                <Input
                  id="projectTitle"
                  label="Título del Proyecto"
                  placeholder="ej. E-Commerce Platform"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />

                <div>
                  <label
                    htmlFor="projectDesc"
                    className="block text-xs font-semibold text-[#48202b] mb-1 px-1"
                  >
                    Descripción del Proyecto
                  </label>
                  <textarea
                    id="projectDesc"
                    rows={2}
                    required
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    placeholder="Explica qué problema resolvió y tecnologías utilizadas..."
                    className="w-full p-3 bg-white border border-[#e8deda] focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    id="projectUrl"
                    label="Enlace del Proyecto"
                    placeholder="https://github.com/..."
                    value={newProject.projectUrl}
                    onChange={(e) =>
                      setNewProject({ ...newProject, projectUrl: e.target.value })
                    }
                    required
                    icon={ExternalLink}
                  />

                  <Input
                    id="imageUrl"
                    label="URL de Imagen (Opcional)"
                    placeholder="https://..."
                    value={newProject.imageUrl}
                    onChange={(e) =>
                      setNewProject({ ...newProject, imageUrl: e.target.value })
                    }
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <Button
                    type="submit"
                    disabled={actionLoading}
                    variant="primary"
                    className="py-2 px-4 bg-[#8C2C45] hover:bg-[#5A0F24] text-white"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Añadir Proyecto</span>
                  </Button>
                </div>
              </form>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#5A0F24] uppercase tracking-wider">
                    Proyectos en tu Portafolio ({portfolioItems.length})
                  </h4>
                  {portfolioItems.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Requisito cumplido
                    </span>
                  )}
                </div>

                {portfolioItems.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-[#C9B8A6] bg-[#F3EFE6]/20">
                    <FolderGit2 className="w-8 h-8 text-[#8C2C45]/40 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#5A0F24]">
                      Aún no has agregado proyectos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[#C9B8A6]/40 bg-white hover:bg-[#F3EFE6]/30 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-[#5A0F24] truncate">
                            {item.title}
                          </h5>
                          <p className="text-[11px] text-[#5A0F24]/75 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C2C45] hover:underline mt-1"
                          >
                            <span>Visitar enlace</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar proyecto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Paso 1</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] text-white"
                >
                  <span>Continuar a Habilidades</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ===================== PASO 3 ===================== */}
          {activeStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/40">
                <div className="w-9 h-9 rounded-xl bg-[#8C2C45] text-white flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#5A0F24]">
                    Paso 3: Valida tus Habilidades Técnicas
                  </h3>
                  <p className="text-[11px] text-[#5A0F24]/75">
                    Selecciona tus tags principales para posicionarte en búsquedas.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Escribe otra habilidad (ej. Docker, NestJS)..."
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#e8deda] focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all shadow-xs"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </Button>
              </form>

              <div>
                <p className="text-[11px] font-semibold text-[#5A0F24]/70 mb-2">
                  Sugerencias Populares:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((item) => {
                    const isSelected = skills.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleSkill(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#8C2C45] text-white shadow-xs border border-[#8C2C45]'
                            : 'bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#C9B8A6]/40 border border-[#C9B8A6]/50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3EFE6]/40 border border-[#C9B8A6]/40">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[#5A0F24]">
                    Tus Habilidades Seleccionadas ({skills.length}/30)
                  </span>
                  {skills.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Al menos una registrada
                    </span>
                  )}
                </div>

                {skills.length === 0 ? (
                  <p className="text-xs text-[#5A0F24]/60 italic py-2">
                    Aún no has seleccionado habilidades.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C2C45] text-white text-xs font-semibold shadow-xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-[#F3EFE6]/80 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Portafolio</span>
                </Button>

                <Button
                  type="button"
                  disabled={actionLoading || skills.length === 0}
                  onClick={handleSaveStep3}
                  className="px-6 py-2.5 bg-[#8C2C45] hover:bg-[#5A0F24] text-white"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Habilidades...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Habilidades</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {calculatedPercentage === 100 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center gap-3.5 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-emerald-900">
                  ¡Perfil 100% Completado!
                </h4>
                <p className="text-[11px] text-emerald-800/80 leading-snug">
                  Has completado todos los pasos sugeridos de tu perfil.
                </p>
              </div>
              <Button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs shrink-0"
              >
                Finalizar
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#C9B8A6]/40 bg-[#F3EFE6]/40 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#5A0F24]/70">
            {calculatedPercentage === 100
              ? '✓ Todos los pasos completados'
              : 'Puedes completar los pasos en cualquier momento.'}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="py-1.5 px-4 text-xs font-semibold"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}