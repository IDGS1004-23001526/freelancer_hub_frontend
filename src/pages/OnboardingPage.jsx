import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  UserCheck,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Award,
} from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Button from '../features/ui/Button.jsx';
import { useAuthStore } from '../stores/auth.store.js';
import { profileApi } from '../api/profile.api.js';
import ProfileCompletionModal from '../features/profile/components/ProfileCompletionModal.jsx';


export default function OnboardingPage() {
  const location = useLocation();
  const { user } = useAuthStore();

  const currentUser = location.state?.newUser || user || {
    fullName: 'Nuevo Usuario',
    role: 'FREELANCER',
    email: '',
  };

  const isClient = currentUser.role === 'CLIENT';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState(1);
  const [progressData, setProgressData] = useState({
    percentage: 0,
    completedSteps: 0,
    totalSteps: 3,
    steps: [
      { id: 'professional_info', isCompleted: false },
      { id: 'portfolio', isCompleted: false },
      { id: 'skills', isCompleted: false },
    ],
  });

  // Cargar estado de onboarding si es freelancer
  useEffect(() => {
    if (!isClient) {
      fetchProgress();
    }
  }, [isClient]);

  const fetchProgress = async () => {
    try {
      const res = await profileApi.getOnboardingStatus().catch(() => null);
      if (res?.data) {
        setProgressData(res.data);
      } else {
        // Fallback local storage
        const saved = localStorage.getItem('fh_local_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          const s1 = Boolean(parsed.professionalTitle && parsed.bio && parsed.hourlyRate);
          const s2 = Boolean(parsed.portfolioItems && parsed.portfolioItems.length > 0);
          const s3 = Boolean(parsed.skills && parsed.skills.length > 0);
          const count = [s1, s2, s3].filter(Boolean).length;
          setProgressData({
            percentage: Math.round((count / 3) * 100),
            completedSteps: count,
            totalSteps: 3,
            steps: [
              { id: 'professional_info', isCompleted: s1 },
              { id: 'portfolio', isCompleted: s2 },
              { id: 'skills', isCompleted: s3 },
            ],
          });
        }
      }
    } catch {
      // Manejo silencioso
    }
  };

  const isStepCompleted = (stepIndex) => {
    if (isClient) return false;
    return Boolean(progressData.steps?.[stepIndex]?.isCompleted);
  };

  const handleOpenStep = (stepNumber) => {
    if (isClient) {
      alert('El asistente de configuración para clientes estará disponible en el próximo release.');
      return;
    }
    setModalInitialStep(stepNumber);
    setIsModalOpen(true);
  };

  const handleOpenFirstPending = () => {
    if (isClient) {
      alert('El asistente de configuración para clientes estará disponible en el próximo release.');
      return;
    }

    const firstIncompleteIndex = progressData.steps?.findIndex((s) => !s.isCompleted);
    const targetStep = firstIncompleteIndex !== -1 && firstIncompleteIndex !== undefined
      ? firstIncompleteIndex + 1
      : 1;

    setModalInitialStep(targetStep);
    setIsModalOpen(true);
  };

  const steps = isClient
    ? [
        {
          title: 'Configura el perfil de tu empresa o estudio',
          desc: 'Agrega logotipo, descripción de tu negocio y sitio web.',
          completed: false,
        },
        {
          title: 'Define tus métodos de pago para Escrow',
          desc: 'Garantiza fondos protegidos para tus futuras contrataciones.',
          completed: false,
        },
        {
          title: 'Publica tu primera oferta de proyecto',
          desc: 'Describe los requerimientos y recibe propuestas de expertos.',
          completed: false,
        },
      ]
    : [
        {
          title: 'Completa tu información profesional',
          desc: 'Añade tu título profesional, biografía y tarifa por hora.',
          completed: isStepCompleted(0),
        },
        {
          title: 'Sube muestras de tu portafolio',
          desc: 'Demuestra tu experiencia con proyectos y enlaces relevantes.',
          completed: isStepCompleted(1),
        },
        {
          title: 'Valida tus habilidades técnicas',
          desc: 'Agrega tus tags principales y destaca en las búsquedas de clientes.',
          completed: isStepCompleted(2),
        },
      ];

  const allCompleted = !isClient && progressData.percentage === 100;

  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto py-4">
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.1)] border border-[#C9B8A6]/50 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#C68A8F]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
            <span className="text-[11px] font-bold text-[#5A0F24] uppercase tracking-wider">
              {isClient ? 'Onboarding para Clientes' : 'Onboarding para Freelancers'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight mb-2">
            ¡Hola, {currentUser.fullName}!
          </h1>
          <p className="text-xs md:text-sm text-[#5A0F24]/75 mb-6 leading-relaxed">
            Tu cuenta ha sido creada exitosamente. Para que disfrutes de todas las ventajas y seguridad de la plataforma, completemos los siguientes pasos de tu perfil.
          </p>

          {/* Role pill preview */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F3EFE6]/80 border border-[#C9B8A6]/50 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#8C2C45] text-[#F3EFE6] flex items-center justify-center shrink-0">
              {isClient ? <Briefcase className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-[#5A0F24]">
                Registrado como {isClient ? 'Cliente / Contratante' : 'Freelancer / Profesional Independiente'}
              </p>
              <p className="text-[11px] text-[#5A0F24]/70">
                {currentUser.email || 'Correo verificado'}
              </p>
            </div>
          </div>

          {/* Barra de Progreso del Perfil (Freelancer) */}
          {!isClient && (
            <div className="mb-6 p-4 rounded-2xl bg-[#F3EFE6]/50 border border-[#C9B8A6]/40">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#5A0F24]">
                  Progreso de tu Perfil
                </span>
                <span className="font-extrabold text-[#8C2C45]">
                  {progressData.percentage}% ({progressData.completedSteps || 0}/3 completados)
                </span>
              </div>
              <div className="w-full h-2 bg-[#E8DEDA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8C2C45] to-[#5A0F24] transition-all duration-500 ease-out"
                  style={{ width: `${progressData.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Step list */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-bold text-[#5A0F24] uppercase tracking-wider mb-2">
              Próximos pasos sugeridos
            </h3>

            {steps.map((step, idx) => {
              const isCompleted = step.completed;
              return (
                <div
                  key={idx}
                  onClick={() => handleOpenStep(idx + 1)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
                      : 'border-[#C9B8A6]/40 bg-[#F3EFE6]/30 hover:bg-[#F3EFE6]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#8C2C45]/15 text-[#8C2C45] group-hover:bg-[#8C2C45] group-hover:text-white'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold ${
                          isCompleted ? 'text-emerald-900' : 'text-[#5A0F24]'
                        }`}
                      >
                        {step.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          Completado ✓
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isCompleted ? 'text-emerald-800/75' : 'text-[#5A0F24]/70'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C9B8A6] group-hover:text-[#8C2C45] transition-colors shrink-0 mt-1" />
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              className="w-full sm:w-auto px-6 py-3 bg-[#8C2C45] hover:bg-[#5A0F24] text-white cursor-pointer"
              onClick={handleOpenFirstPending}
            >
              <span>{allCompleted ? 'Editar Mi Perfil' : 'Completar Perfil Ahora'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Link
              to="/login"
              className="text-xs font-semibold text-[#8C2C45] hover:text-[#5A0F24] py-2 px-3 transition-colors"
            >
              Volver al Login
            </Link>
          </div>
        </div>
      </div>

      {/* Modal interactivo de completitud de perfil */}
      <ProfileCompletionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchProgress();
        }}
        initialStep={modalInitialStep}
        onProgressUpdated={(newProgress) => {
          setProgressData(newProgress);
        }}
      />
    </AuthLayout>
  );
}

