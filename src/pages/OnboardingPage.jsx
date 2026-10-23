import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, UserCheck, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Button from '../features/ui/Button.jsx';
import { useAuthStore } from '../stores/auth.store.js';

/**
 * OnboardingPage welcoming newly registered users to complete their profile.
 * Displays tailored next steps based on whether the user registered as CLIENT or FREELANCER.
 * Uses the designated palette:
 * - #5A0F24 (deep burgundy/wine)
 * - #8C2C45 (rich berry/crimson)
 * - #C68A8F (dusty rose/mauve)
 * - #F3EFE6 (soft cream/off-white)
 * - #C9B8A6 (warm beige/sand)
 */
export default function OnboardingPage() {
  const location = useLocation();
  const { user } = useAuthStore();

  const currentUser = location.state?.newUser || user || {
    fullName: 'Nuevo Usuario',
    role: 'FREELANCER',
    email: '',
  };

  const isClient = currentUser.role === 'CLIENT';

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
          completed: false,
        },
        {
          title: 'Sube muestras de tu portafolio',
          desc: 'Demuestra tu experiencia con proyectos y enlaces relevantes.',
          completed: false,
        },
        {
          title: 'Valida tus habilidades técnicas',
          desc: 'Agrega tus tags principales y destaca en las búsquedas de clientes.',
          completed: false,
        },
      ];

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
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F3EFE6]/80 border border-[#C9B8A6]/50 mb-8">
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

          {/* Step list */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-bold text-[#5A0F24] uppercase tracking-wider mb-2">
              Próximos pasos sugeridos
            </h3>

            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-[#C9B8A6]/40 bg-[#F3EFE6]/30 hover:bg-[#F3EFE6] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#8C2C45]/15 text-[#8C2C45] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#5A0F24]">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#5A0F24]/70">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              className="w-full sm:w-auto px-6 py-3 bg-[#8C2C45] hover:bg-[#5A0F24] text-white"
              onClick={() => alert('¡Próximamente disponible el editor detallado de perfil!')}
            >
              <span>Completar Perfil Ahora</span>
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
    </AuthLayout>
  );
}
