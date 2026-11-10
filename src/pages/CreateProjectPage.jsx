import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProjectForm from '../features/projects/components/ProjectForm.jsx';
import ProjectValidationChecklist from '../features/projects/components/ProjectValidationChecklist.jsx';

export default function CreateProjectPage() {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navegación superior */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Feed de Convocatorias</span>
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
