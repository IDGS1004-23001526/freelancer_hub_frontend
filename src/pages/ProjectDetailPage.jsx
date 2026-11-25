import React, { useEffect, useState } from 'react';
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
  Users,
  Send,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import FreelancerLayout from '../layouts/FreelancerLayout.jsx';
import CandidateComparisonView from '../features/projects/components/CandidateComparisonView.jsx';
import SubmitProposalModal from '../features/projects/components/SubmitProposalModal.jsx';
import Toast from '../features/ui/Toast.jsx';
import { useProjectStore } from '../stores/project.store.js';
import { useAuthStore } from '../stores/auth.store.js';
import { projectApi } from '../api/project.api.js';
import { proposalApi } from '../api/proposal.api.js';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { getProjectById } = useProjectStore();
  const { user } = useAuthStore();

  const storedProject = location.state?.project || getProjectById(id);
  const [remoteProject, setRemoteProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(!storedProject);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [proposalRefreshKey, setProposalRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  const project = storedProject || remoteProject;
  const justCreated = Boolean(location.state?.justCreated);
  const isClient = user?.role === 'CLIENT' || user?.role === 'CLIENTE';
  const ActiveLayout = isClient ? DashboardLayout : FreelancerLayout;

  useEffect(() => {
    if (storedProject || !id) {
      setLoadingProject(false);
      return;
    }

    let cancelled = false;
    setLoadingProject(true);
    projectApi
      .getProjectById(id)
      .then((res) => {
        if (!cancelled && res?.data) {
          setRemoteProject(res.data);
        }
      })
      .catch(() => {
        // Mantiene estado de no encontrada si falla la consulta remota
      })
      .finally(() => {
        if (!cancelled) setLoadingProject(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, storedProject]);

  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;

    proposalApi
      .getMyProposalForProject(project.id, user?.id)
      .then((existing) => {
        if (cancelled) return;
        if (existing) {
          setSubmittedProposal(existing);
          setAlreadyApplied(true);
        } else {
          setSubmittedProposal(null);
          setAlreadyApplied(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [project?.id, user?.id]);

  if (loadingProject) {
    return (
      <ActiveLayout>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 border border-[#C9B8A6]/50 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#F3EFE6] rounded-xl" />
          <div className="h-10 w-3/4 bg-[#F3EFE6] rounded-xl" />
          <div className="h-28 w-full bg-[#F3EFE6] rounded-2xl" />
        </div>
      </ActiveLayout>
    );
  }

  if (!project) {
    return (
      <ActiveLayout>
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
      </ActiveLayout>
    );
  }

  const isOpen = project.status === 'ABIERTO' || project.status === 'ACTIVE';
  const formattedBudget = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: project.currency || 'USD',
    minimumFractionDigits: 2,
  }).format(project.budget);

  const handleProposalSuccess = (proposal) => {
    setSubmittedProposal(proposal);
    setAlreadyApplied(true);
    setProposalRefreshKey((prev) => prev + 1);
    setToast({
      type: 'success',
      title: '¡Propuesta enviada!',
      message:
        'Tu propuesta económica y desglose de hitos se han registrado exitosamente.',
    });
  };

  const handleAlreadyApplied = (message) => {
    setAlreadyApplied(true);
    setToast({
      type: 'info',
      title: 'Postulación ya registrada',
      message: message || 'Ya has enviado una propuesta a este proyecto.',
    });
  };

  return (
    <ActiveLayout>
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

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

          {/* Estado de Postulación del Freelancer */}
          {alreadyApplied ? (
            <div
              role="status"
              data-testid="already-applied-banner"
              className="relative z-10 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                    Ya has enviado una propuesta a este proyecto
                  </p>
                  {submittedProposal && (
                    <p className="text-[11px] text-emerald-900/80">
                      Oferta registrada por{' '}
                      <strong>
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                        }).format(submittedProposal.totalPrice)}{' '}
                        MXN
                      </strong>{' '}
                      • Plazo de {submittedProposal.estimatedDays} días naturales (
                      {submittedProposal.milestones?.length || 0} hitos)
                    </p>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-center">
                Propuesta enviada
              </span>
            </div>
          ) : null}

          {/* Acciones inferiores */}
          <div className="relative z-10 pt-5 border-t border-[#C9B8A6]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/projects"
              state={{ newProjectId: project.id }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] text-xs font-bold transition-colors text-center"
            >
              Ir al Catálogo de Proyectos
            </Link>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
              {isOpen && !isClient && !alreadyApplied && (
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(true)}
                  data-testid="btn-open-submit-proposal"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-extrabold shadow-[0_6px_18px_-4px_rgba(140,44,69,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Postular Propuesta</span>
                </button>
              )}

              {!isClient && alreadyApplied && (
                <Link
                  to="/my-proposals"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-[#F3EFE6] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Ver mis postulaciones</span>
                </Link>
              )}

              {isClient && (
                <>
                  <Link
                    to={`/projects/${project.id}/candidates`}
                    data-testid="link-compare-candidates"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-[#F3EFE6] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4 text-[#C68A8F]" />
                    <span>Abrir comparador en pantalla completa</span>
                  </Link>

                  <Link
                    to="/projects/new"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] border border-[#C9B8A6] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#8C2C45]" />
                    <span>+ Publicar Otra Convocatoria</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Matriz Comparativa de Candidatos integrada en el detalle (solo Clientes) */}
        {isClient && (
          <CandidateComparisonView
            key={`${project.id}-${proposalRefreshKey}`}
            project={project}
          />
        )}
      </div>

      {/* Modal de Postulación de Propuesta Económica (FREEL-45 / HU-03) */}
      <SubmitProposalModal
        isOpen={isProposalModalOpen}
        project={project}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={handleProposalSuccess}
        onAlreadyApplied={handleAlreadyApplied}
      />
    </ActiveLayout>
  );
}
