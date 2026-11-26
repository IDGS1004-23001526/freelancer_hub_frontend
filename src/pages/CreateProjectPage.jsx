import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProjectForm from '../features/projects/components/ProjectForm.jsx';
import ProjectValidationChecklist from '../features/projects/components/ProjectValidationChecklist.jsx';
import { useAuthStore } from '../stores/auth.store.js';

export default function CreateProjectPage() {
  const { user } = useAuthStore();
  const isFreelancer = user?.role === 'FREELANCER';

  const [checklistItems, setChecklistItems] = useState([
    {
      id: 'req-title',
      label: 'Título del proyecto (mín. 10 caracteres)',
      met: false,
      detail: '0/10 caracteres',
    },
    {
      id: 'req-description',
      label: 'Descripción detallada (mín. 30 caracteres)',
      met: false,
      detail: '0/30 caracteres',
    },
    {
      id: 'req-budget',
      label: 'Presupuesto estimado en MXN (> $0)',
      met: false,
      detail: 'Pendiente',
    },
    {
      id: 'req-date',
      label: 'Fecha estimada de entrega (posterior a hoy)',
      met: false,
      detail: 'Sin seleccionar',
    },
    {
      id: 'req-skills',
      label: 'Tags de habilidades (mín. 3 requeridos)',
      met: false,
      detail: '0/3 seleccionados',
    },
  ]);

  if (isFreelancer) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4 bg-white rounded-3xl border border-[#C9B8A6]/50 shadow-sm p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#5A0F24]">
            Función exclusiva para cuentas de Cliente
          </h2>
          <p className="text-xs md:text-sm text-[#5A0F24]/75 max-w-md mx-auto leading-relaxed">
            Tu cuenta actual tiene rol de <strong>Freelancer</strong>. La publicación de convocatorias está reservada exclusivamente para clientes contratantes. Como especialista, puedes explorar proyectos y postularte con cotizaciones por hitos.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/projects"
              className="px-5 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition shadow-xs"
            >
              Explorar Convocatorias Abiertas
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#e8dfd1] text-xs font-bold transition border border-[#C9B8A6]/50"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navegación superior */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={useLocation().state?.from === '/onboarding' ? '/onboarding' : '/projects'}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {useLocation().state?.from === '/onboarding' ? 'Volver al Onboarding' : 'Volver al Feed de Convocatorias'}
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C9B8A6] text-[11px] font-bold text-[#5A0F24]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C2C45]" />
            <span>Nueva convocatoria</span>
          </span>
        </div>

        {/* Layout Responsive de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <ProjectForm onValidationChange={setChecklistItems} />
          </div>

          <ProjectValidationChecklist items={checklistItems} />
        </div>
      </div>
    </DashboardLayout>
  );
}
