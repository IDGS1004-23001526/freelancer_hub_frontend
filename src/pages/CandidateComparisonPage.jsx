import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  DollarSign,
  Calendar,
  Tag,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import CandidateComparisonView from '../features/projects/components/CandidateComparisonView.jsx';
import { useProjectStore } from '../stores/project.store.js';

export default function CandidateComparisonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, getProjectById } = useProjectStore();

  const defaultProject =
    (id && getProjectById(id)) || projects[0] || null;
  const [selectedProjectId, setSelectedProjectId] = useState(
    defaultProject?.id || 'proj_101'
  );

  const activeProject =
    getProjectById(id || selectedProjectId) || defaultProject;

  const handleProjectSwitch = (newId) => {
    setSelectedProjectId(newId);
    if (id) {
      navigate(`/projects/${newId}/candidates`);
    }
  };

  const formattedBudget = activeProject
    ? new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: activeProject.currency || 'USD',
        maximumFractionDigits: 0,
      }).format(activeProject.budget)
    : '$0';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navegación superior y selector de convocatoria */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={activeProject ? `/projects/${activeProject.id}` : '/projects'}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {activeProject
                ? 'Volver al detalle de la convocatoria'
                : 'Volver a mis convocatorias'}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#8C2C45]" />
            <label
              htmlFor="select-project-candidates"
              className="text-xs font-bold text-[#5A0F24]/80"
            >
              Convocatoria:
            </label>
            <select
              id="select-project-candidates"
              value={activeProject?.id || ''}
              onChange={(e) => handleProjectSwitch(e.target.value)}
              data-testid="select-project-switcher"
              className="px-3.5 py-2 rounded-xl bg-white border border-[#C9B8A6] text-xs font-bold text-[#5A0F24] shadow-2xs focus:outline-none focus:border-[#8C2C45]"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title} ({proj.proposalsCount} candidatos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen compacto del proyecto evaluado */}
        {activeProject && (
          <div className="bg-gradient-to-r from-[#5A0F24] to-[#8C2C45] rounded-3xl p-6 text-[#F3EFE6] shadow-[0_15px_35px_-15px_rgba(90,15,36,0.25)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-[11px] font-bold">
                <Tag className="w-3 h-3 text-[#C68A8F]" />
                <span>{activeProject.category}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                {activeProject.title}
              </h1>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeProject.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-lg bg-white/10 text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white/10 rounded-2xl p-4 border border-white/15 shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#F3EFE6]/75 block font-bold">
                  Presupuesto máximo
                </span>
                <span className="text-base font-extrabold flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-[#C68A8F]" />
                  {formattedBudget} {activeProject.currency}
                </span>
              </div>

              <div className="pl-4 border-l border-white/20">
                <span className="text-[10px] uppercase tracking-wider text-[#F3EFE6]/75 block font-bold">
                  Fecha estimada
                </span>
                <span className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C68A8F]" />
                  {activeProject.estimatedDate}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Vista Comparativa de Candidatos */}
        <CandidateComparisonView project={activeProject} />
      </div>
    </DashboardLayout>
  );
}
