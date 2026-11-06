import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Plus,
  FolderKanban,
  UserCheck,
  Clock,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { useProjectStore } from '../stores/project.store.js';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { getProjectById } = useProjectStore();

  const project = location.state?.project || getProjectById(id);
  const justCreated = Boolean(location.state?.justCreated);

  if (!project) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 text-center border border-[#C9B8A6]/50 space-y-4">
          <h2 className="text-xl font-extrabold text-[#5A0F24]">
            Convocatoria no encontrada
          </h2>
          <p className="text-xs text-[#5A0F24]/75">
            El proyecto solicitado no existe o fue movido del catálogo.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C2C45] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir al Catálogo de Convocatorias</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isOpen = project.status === 'ABIERTO';
  const formattedBudget = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: project.currency || 'USD',
    minimumFractionDigits: 2,
  }).format(project.budget);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/projects"
            data-testid="link-back-catalog"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo de Convocatorias</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A0F24]/75 hover:text-[#5A0F24]"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#8C2C45]" />
            <span>Ir al Menú Principal</span>
          </Link>
        </div>

        {/* Banner de Confirmación de Registro Exitoso */}
        {justCreated && (
          <div
            role="status"
            data-testid="convocatoria-created-banner"
            className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-emerald-950">
                    ¡Convocatoria registrada y publicada exitosamente!
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                    ABIERTO
                  </span>
                </div>
                <p className="text-xs text-emerald-900/80 mt-0.5">
                  Tu proyecto ya está visible en el catálogo general y listo para recibir propuestas de especialistas.
                </p>
              </div>
            </div>

            <Link
              to="/projects"
              state={{ newProjectId: project.id }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 text-center transition-colors"
            >
              Ver en el Catálogo →
            </Link>
          </div>
        )}

        {/* Tarjeta Principal de Detalle del Proyecto */}
        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.1)] border border-[#C9B8A6]/50 relative overflow-hidden space-y-6">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#C68A8F]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header: Categoría + Badge ABIERTO */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#C9B8A6]/40">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/50 text-xs font-bold text-[#5A0F24]">
                <Tag className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span data-testid="detail-category">{project.category}</span>
              </span>
              <span className="text-[11px] font-medium text-[#5A0F24]/60">
                ID: {project.id}
              </span>
            </div>

            {/* Badge de Estado ABIERTO */}
            {isOpen ? (
              <div
                data-testid="detail-status-badge"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-900 text-xs font-extrabold tracking-wider uppercase shadow-xs"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>ABIERTO</span>
              </div>
            ) : (
              <div
                data-testid="detail-status-badge"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] border border-[#C9B8A6] text-[#5A0F24] text-xs font-extrabold tracking-wider uppercase"
              >
                <Clock className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>{project.status}</span>
              </div>
            )}
          </div>

          {/* Título y Cliente */}
          <div className="relative z-10 space-y-2">
            <h1
              data-testid="detail-title"
              className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight leading-snug"
            >
              {project.title}
            </h1>
            <p className="text-xs font-semibold text-[#8C2C45] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Publicado por {project.clientName}</span>
            </p>
          </div>

          {/* Métricas Clave: Presupuesto, Fecha Estimada y Estado */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8C2C45] text-white flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 block">
                  Presupuesto Asignado
                </span>
                <span
                  data-testid="detail-budget"
                  className="text-base font-extrabold text-[#5A0F24]"
                >
                  {formattedBudget} {project.currency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5A0F24] text-white flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 block">
                  Fecha Estimada
                </span>
                <span
                  data-testid="detail-estimated-date"
                  className="text-base font-extrabold text-[#5A0F24]"
                >
                  {project.estimatedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 block">
                  Custodia Escrow
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  Garantía Activa • {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción del Proyecto */}
          <div className="relative z-10 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]">
              Descripción y Alcance de la Convocatoria
            </h3>
            <p className="text-xs md:text-sm text-[#5A0F24]/85 leading-relaxed bg-[#f6f2ee]/60 p-4 rounded-2xl border border-[#e8deda]">
              {project.description}
            </p>
          </div>

          {/* Habilidades Requeridas (Chips) */}
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#8C2C45]" />
                <span>
                  Habilidades Técnicas Requeridas ({project.skills.length})
                </span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-700">
                ✓ Mínimo 3 validadas
              </span>
            </div>

            <div
              data-testid="detail-skills-list"
              className="flex flex-wrap gap-2"
            >
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5A0F24] text-[#F3EFE6] text-xs font-bold shadow-2xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#C68A8F]" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Acciones inferiores */}
          <div className="relative z-10 pt-5 border-t border-[#C9B8A6]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/projects"
              state={{ newProjectId: project.id }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] text-xs font-bold transition-colors text-center"
            >
              Ir al Catálogo de Proyectos
            </Link>

            <Link
              to="/projects/new"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Publicar Otra Convocatoria</span>
            </Link>
          </div>
        </article>
      </div>
    </DashboardLayout>
  );
}
