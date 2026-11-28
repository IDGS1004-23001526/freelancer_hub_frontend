import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  UserCheck,
  Briefcase,
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Button from '../features/ui/Button.jsx';
import { useAuthStore } from '../stores/auth.store.js';
import { profileApi } from '../api/profile.api.js';
import ProfileCompletionModal from '../features/profile/components/ProfileCompletionModal.jsx';
import ClientOnboardingModal from '../features/profile/components/ClientOnboardingModal.jsx';

/**
 * Pasos de onboarding por rol. El flujo es único: el backend indica qué pasos
 * están completos y cada paso define su acción (abrir el modal de perfil o ir a una página).
 */
const STEP_CONFIG = {
  // Freelancer
  professional_info: {
    title: 'Completa tu información profesional',
    desc: 'Añade tu título profesional, biografía y tarifa por hora.',
    action: { type: 'modal', step: 1 },
  },
  portfolio: {
    title: 'Sube muestras de tu portafolio',
    desc: 'Demuestra tu experiencia con proyectos y enlaces relevantes.',
    action: { type: 'modal', step: 2 },
  },
  skills: {
    title: 'Agrega tus habilidades técnicas',
    desc: 'Elige tus tags principales para aparecer en las búsquedas de clientes.',
    action: { type: 'modal', step: 3 },
  },
  // Cliente
  company_profile: {
    title: 'Configura el perfil de tu empresa',
    desc: 'Agrega el nombre y una descripción de tu negocio.',
    action: { type: 'modal', step: 1 },
  },
  payment_method: {
    title: 'Registra un método de pago',
    desc: 'Lo usarás para fondear la custodia Escrow de tus contratos.',
    action: { type: 'modal', step: 2 },
  },
  first_project: {
    title: 'Publica tu primera convocatoria',
    desc: 'Describe los requerimientos y recibe propuestas de freelancers.',
    action: { type: 'modal', step: 3 },
  },
};

const DEFAULT_STEP_IDS = {
  CLIENT: ['company_profile', 'payment_method', 'first_project'],
  FREELANCER: ['professional_info', 'portfolio', 'skills'],
};

export default function OnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const currentUser = location.state?.newUser || user || { fullName: '', role: 'FREELANCER', email: '' };
  const isClient = currentUser.role === 'CLIENT';
  const roleKey = isClient ? 'CLIENT' : 'FREELANCER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState(1);
  const [loadError, setLoadError] = useState('');
  const [progressData, setProgressData] = useState(() => ({
    percentage: 0,
    completedSteps: 0,
    totalSteps: 3,
    steps: DEFAULT_STEP_IDS[roleKey].map((id) => ({ id, isCompleted: false })),
  }));

  const fetchProgress = async () => {
    try {
      const res = await profileApi.getOnboardingStatus();
      if (res?.data) {
        setProgressData(res.data);
        setLoadError('');
      }
    } catch {
      setLoadError('No pudimos consultar tu progreso. Puedes continuar y volver a revisarlo más tarde.');
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [roleKey]);

  const steps = (progressData.steps || [])
    .filter((s) => STEP_CONFIG[s.id])
    .map((s) => ({ ...STEP_CONFIG[s.id], id: s.id, completed: Boolean(s.isCompleted) }));

  const runStep = (step) => {
    if (step.action.type === 'modal') {
      setModalInitialStep(step.action.step);
      setIsModalOpen(true);
    } else {
      navigate(step.action.to, { state: { from: '/onboarding' } });
    }
  };

  const nextPending = steps.find((s) => !s.completed);
  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length || 3;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);
  const allCompleted = completedCount === totalSteps;

  const handlePrimaryAction = () => {
    if (nextPending) {
      runStep(nextPending);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto py-4">
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.1)] border border-[#C9B8A6]/50 relative overflow-hidden">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight mb-2">
            {currentUser.fullName ? `¡Hola, ${currentUser.fullName}!` : '¡Bienvenido!'}
          </h1>
          <p className="text-xs md:text-sm text-[#5A0F24]/75 mb-6 leading-relaxed">
            Tu cuenta está lista. Completa estos {totalSteps} pasos para empezar a {isClient ? 'contratar' : 'recibir proyectos'}.
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
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Barra de Progreso del Perfil */}
          <div className="mb-6 p-4 rounded-2xl bg-[#F3EFE6]/50 border border-[#C9B8A6]/40">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#5A0F24]">
                Progreso de tu Perfil
              </span>
              <span className="font-extrabold text-[#8C2C45]">
                {progressPercentage}% ({completedCount}/{totalSteps} completados)
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8DEDA] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8C2C45] to-[#5A0F24] transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {loadError && (
            <p role="status" className="mb-4 text-xs text-[#8C2C45] bg-[#F3EFE6] border border-[#C68A8F]/40 rounded-xl p-3">
              {loadError}
            </p>
          )}

          {/* Step list */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-bold text-[#5A0F24] uppercase tracking-wider mb-2">
              Próximos pasos sugeridos
            </h3>

            {steps.map((step, idx) => {
              const isCompleted = step.completed;
              return (
                <button
                  type="button"
                  key={step.id}
                  onClick={() => runStep(step)}
                  className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#8C2C45] ${
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
                          Completado
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
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 pt-2">
            <Button
              className="w-full sm:w-auto px-6 py-3 bg-[#8C2C45] hover:bg-[#5A0F24] text-white cursor-pointer"
              onClick={handlePrimaryAction}
            >
              <span>{allCompleted ? 'Ir a mi dashboard' : `Continuar: ${nextPending?.title ?? ''}`}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Link
              to={allCompleted ? '/profile' : '/dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-[#5A0F24] bg-[#F3EFE6] hover:bg-[#e8dfd1] border border-[#C9B8A6]/60 py-3 px-5 rounded-xl transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#8C2C45]" />
              <span>{allCompleted ? 'Ver mi perfil' : 'Omitir por ahora'}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-xs font-semibold text-[#8C2C45] hover:text-[#5A0F24] py-2 px-3 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Modal interactivo de completitud de perfil (mismo flujo para ambos roles) */}
      {isClient ? (
        <ClientOnboardingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchProgress();
          }}
          initialStep={modalInitialStep}
          progress={progressData}
          onProgressUpdated={setProgressData}
        />
      ) : (
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
      )}
    </AuthLayout>
  );
}
