import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Tag,
  Users,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

export default function ProjectCard({ project, highlight = false }) {
  const isOpen = project.status === 'ABIERTO';

  const formattedBudget = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: project.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(project.budget);

  return (
    <div
      data-testid={`project-card-${project.id}`}
      className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
        highlight
          ? 'border-[#8C2C45] ring-2 ring-[#8C2C45]/20 shadow-[0_15px_35px_-10px_rgba(140,44,69,0.2)]'
          : 'border-[#C9B8A6]/60 hover:border-[#8C2C45]/60 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] hover:shadow-[0_15px_35px_-12px_rgba(90,15,36,0.16)]'
      }`}
    >
      {/* Top Row: Category + Status Badge (ABIERTO) */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 text-[11px] font-bold text-[#5A0F24]">
            <Tag className="w-3 h-3 text-[#8C2C45]" />
            <span>{project.category}</span>
          </span>

          {isOpen ? (
            <span
              data-testid="project-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-extrabold tracking-wide uppercase shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>ABIERTO</span>
            </span>
          ) : (
            <span
              data-testid="project-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C9B8A6] text-[#5A0F24] text-[11px] font-extrabold tracking-wide uppercase"
            >
              <Clock className="w-3 h-3 text-[#8C2C45]" />
              <span>{project.status.replace('_', ' ')}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-extrabold text-[#5A0F24] group-hover:text-[#8C2C45] transition-colors leading-snug mb-2">
          <Link to={`/projects/${project.id}`} className="focus:outline-none">
            {project.title}
          </Link>
        </h3>

        {/* Description preview */}
        <p className="text-xs text-[#5A0F24]/75 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-xl bg-[#F3EFE6]/80 border border-[#C9B8A6]/50 text-[#5A0F24] text-[11px] font-semibold"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Metrics & Detail Link */}
      <div className="pt-4 border-t border-[#C9B8A6]/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/60 block">
              Presupuesto
            </span>
            <span className="text-sm font-extrabold text-[#5A0F24] flex items-center gap-0.5">
              <DollarSign className="w-3.5 h-3.5 text-[#8C2C45]" />
              {formattedBudget} {project.currency}
            </span>
          </div>

          <div className="pl-4 border-l border-[#C9B8A6]/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/60 block">
              Fecha Estimada
            </span>
            <span className="text-xs font-bold text-[#5A0F24] flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#8C2C45]" />
              {project.estimatedDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project.id}/candidates`}
            data-testid={`btn-compare-candidates-${project.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A0F24] bg-[#F3EFE6] hover:bg-[#e8dfd1] px-2.5 py-2 rounded-xl border border-[#C9B8A6]/50 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#8C2C45]" />
            <span>{project.proposalsCount || 2} candidatos</span>
          </Link>

          <Link
            to={`/projects/${project.id}`}
            data-testid={`btn-view-project-${project.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#8C2C45]/10 hover:bg-[#8C2C45] text-[#8C2C45] hover:text-white text-xs font-bold transition-all"
          >
            <span>Ver Detalle</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
