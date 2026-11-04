import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProjectForm from '../features/projects/components/ProjectForm.jsx';

export default function NewProjectPage() {
  const tips = [
    {
      icon: Sparkles,
      title: 'Título claro y orientado a resultados',
      desc: 'Especifica el entregable principal para atraer a los especialistas adecuados.',
    },
    {
      icon: CheckCircle2,
      title: 'Mínimo 3 habilidades técnicas',
      desc: 'El algoritmo de coincidencia notificará automáticamente a los freelancers con esos tags.',
    },
    {
      icon: ShieldCheck,
      title: 'Publicación con estado ABIERTO',
      desc: 'Una vez registrada, tu convocatoria aparecerá en el catálogo activa para recibir propuestas.',
    },
    {
      icon: Zap,
      title: 'Fondos protegidos en Escrow',
      desc: 'Tu presupuesto permanece seguro y solo se libera al aprobar cada hito.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb / Regresar */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard de Clientes</span>
          </Link>
        </div>

        {/* Layout de 2 columnas: Formulario Reactivo + Guía Lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <ProjectForm />
          </div>

          {/* Columna Lateral con el estilo de RegisterShowcase */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-gradient-to-b from-[#ffffff] via-[#F3EFE6]/70 to-[#F3EFE6] rounded-3xl p-6 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] border border-[#C9B8A6]/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C68A8F]/25 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/50 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span className="text-[10px] font-bold text-[#5A0F24] uppercase tracking-wider">
                    Guía de Publicación
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#5A0F24] tracking-tight mb-2">
                  Consejos para una convocatoria exitosa
                </h3>
                <p className="text-xs text-[#5A0F24]/75 leading-relaxed mb-5">
                  Las convocatorias bien estructuradas reciben propuestas calificadas en menos de 24 horas.
                </p>

                <div className="space-y-3">
                  {tips.map((tip, idx) => {
                    const TipIcon = tip.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 border border-[#C9B8A6]/40 shadow-2xs"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#8C2C45]/10 text-[#8C2C45] flex items-center justify-center shrink-0 mt-0.5">
                          <TipIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#5A0F24]">
                            {tip.title}
                          </h4>
                          <p className="text-[11px] text-[#5A0F24]/70 leading-normal mt-0.5">
                            {tip.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
