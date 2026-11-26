import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  FileCheck2,
  RefreshCw,
  Tag,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import FreelancerLayout from '../layouts/FreelancerLayout.jsx';
import { PROJECT_CATEGORIES } from '../interfaces/project.interface.js';
import { useProjectStore } from '../stores/project.store.js';
import { useAuthStore } from '../stores/auth.store.js';
import { projectApi } from '../api/project.api.js';
import { proposalApi } from '../api/proposal.api.js';

export default function FreelancerProjectsPage({ defaultTab = 'projects' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects: localProjects } = useProjectStore();
  const { user } = useAuthStore();

  const initialQuery = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [remoteProjects, setRemoteProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [myProposals, setMyProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [expandedProposalId, setExpandedProposalId] = useState(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== searchQuery) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoadingProjects(true);
    projectApi
      .getProjects()
      .then((res) => {
        if (!cancelled && Array.isArray(res?.data)) {
          setRemoteProjects(res.data);
        }
      })
      .catch(() => {
        // Mantiene proyectos locales si la API remota no responde
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const allProjects = useMemo(() => {
    const merged = new Map();
    localProjects.forEach((p) => {
      if (p?.id) merged.set(p.id, p);
    });
    remoteProjects.forEach((p) => {
      if (p?.id) {
        merged.set(p.id, {
          ...merged.get(p.id),
          ...p,
          skills: Array.isArray(p.skills)
            ? p.skills
            : merged.get(p.id)?.skills || [],
        });
      }
    });
    return Array.from(merged.values());
  }, [localProjects, remoteProjects]);

  const loadMyProposals = async () => {
    setLoadingProposals(true);
    try {
      const items = await proposalApi.getMyProposals(user?.id, allProjects);
      setMyProposals(items);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    loadMyProposals();
  }, [user?.id, allProjects.length]);

  const appliedProjectIds = useMemo(
    () => new Set(myProposals.map((p) => p.projectId)),
    [myProposals]
  );

  const openProjects = useMemo(
    () =>
      allProjects.filter(
        (p) => p.status === 'ABIERTO' || p.status === 'ACTIVE'
      ),
    [allProjects]
  );

  const availableSkills = useMemo(() => {
    const set = new Set();
    openProjects.forEach((p) => {
      (p.skills || []).forEach((s) => {
        if (s) set.add(s);
      });
    });
    return Array.from(set).slice(0, 14);
  }, [openProjects]);

  const toggleSkillFilter = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('TODAS');
    setSelectedSkills([]);
    if (searchParams.has('q')) {
      setSearchParams({});
    }
  };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return openProjects.filter((project) => {
      const matchesSearch =
        !q ||
        project.title?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q) ||
        project.category?.toLowerCase().includes(q) ||
        (project.skills || []).some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'TODAS' || project.category === selectedCategory;

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((reqSkill) =>
          (project.skills || []).some(
            (s) => s.toLowerCase() === reqSkill.toLowerCase()
          )
        );

      return matchesSearch && matchesCategory && matchesSkills;
    });
  }, [openProjects, searchQuery, selectedCategory, selectedSkills]);

  const formatMoney = (amount, currency = 'MXN') =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  return (
    <FreelancerLayout
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Buscar convocatorias, habilidades o categorías..."
    >
      <div className="space-y-6">
        {/* Encabezado compacto consistente con la vista Freelancer */}
        <section className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#5A0F24] tracking-tight">
              {activeTab === 'projects'
                ? 'Convocatorias Abiertas'
                : 'Mis Postulaciones'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A0F24]/70 mt-0.5">
              {activeTab === 'projects'
                ? 'Explora proyectos activos, filtra por habilidades y envía tu propuesta formal por hitos.'
                : 'Consulta el estado de tus postulaciones enviadas, cotizaciones y desglose de hitos.'}
            </p>
          </div>

          {/* Selector de pestañas (Convocatorias / Mis Postulaciones) */}
          <div className="inline-flex p-1 rounded-xl bg-[#F3EFE6] border border-[#C9B8A6]/40 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              data-testid="tab-explorar-convocatorias"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#8C2C45] text-white shadow-xs'
                  : 'text-[#5A0F24]/75 hover:text-[#5A0F24]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Convocatorias ({openProjects.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('proposals')}
              data-testid="tab-mis-postulaciones"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'proposals'
                  ? 'bg-[#8C2C45] text-white shadow-xs'
                  : 'text-[#5A0F24]/75 hover:text-[#5A0F24]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Mis Postulaciones ({myProposals.length})</span>
            </button>
          </div>
        </section>

        {activeTab === 'projects' ? (
          <div className="space-y-5">
            {/* Barra de filtros por categoría y chips de habilidades (HU-02) */}
            <section className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A0F24]/60">
                    Categoría:
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#F3EFE6] border border-[#C9B8A6]/40 text-xs font-bold text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                  >
                    <option value="TODAS">Todas las categorías</option>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {(searchQuery ||
                  selectedCategory !== 'TODAS' ||
                  selectedSkills.length > 0) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] cursor-pointer self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer filtros</span>
                  </button>
                )}
              </div>

              {availableSkills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#C9B8A6]/25">
                  <span className="text-[11px] font-bold text-[#5A0F24]/60 mr-1">
                    Habilidades:
                  </span>
                  {availableSkills.map((skill) => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkillFilter(skill)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-[#8C2C45] text-white border-[#8C2C45]'
                            : 'bg-[#F3EFE6] text-[#5A0F24] border-[#C9B8A6]/40 hover:border-[#8C2C45]'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Listado de convocatorias */}
            {loadingProjects && filteredProjects.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 animate-pulse space-y-3"
                  >
                    <div className="h-4 w-24 bg-[#F3EFE6] rounded" />
                    <div className="h-6 w-3/4 bg-[#F3EFE6] rounded" />
                    <div className="h-14 w-full bg-[#F3EFE6] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-10 text-center space-y-3">
                <p className="text-sm font-bold text-[#5A0F24]">
                  No se encontraron convocatorias con los filtros seleccionados.
                </p>
                <p className="text-xs text-[#5A0F24]/70">
                  Prueba ajustando tu búsqueda o restableciendo las etiquetas de habilidades.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer filtros</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => {
                  const hasApplied = appliedProjectIds.has(project.id);
                  return (
                    <article
                      key={project.id}
                      data-testid={`freelancer-project-card-${project.id}`}
                      className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 shadow-xs hover:shadow-md hover:border-[#8C2C45]/50 transition flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3EFE6] text-[#5A0F24] border border-[#C9B8A6]/40">
                            <Tag className="w-3 h-3 text-[#8C2C45]" />
                            {project.category || 'Desarrollo'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {hasApplied && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Ya postulado
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                              ABIERTO
                            </span>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-base font-extrabold text-[#5A0F24] leading-snug">
                            {project.title}
                          </h2>
                          <p className="text-xs text-[#2b1b1e]/75 mt-1.5 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(project.skills || []).slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-lg bg-[#F3EFE6] text-[11px] font-semibold text-[#5A0F24]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#C9B8A6]/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="inline-flex items-center gap-1 font-extrabold text-[#5A0F24]">
                            <DollarSign className="w-3.5 h-3.5 text-[#8C2C45]" />
                            {formatMoney(project.budget, project.currency)}
                          </span>
                          {project.deadline && (
                            <span className="inline-flex items-center gap-1 text-[#5A0F24]/70 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-[#8C2C45]" />
                              {project.deadline}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/projects/${project.id}`}
                          state={{ project }}
                          className="px-3.5 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition shrink-0"
                        >
                          {hasApplied ? 'Ver detalle' : 'Ver y postular'}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Pestaña: Mis Postulaciones (alineada con MyProposalsScreen móvil + HU-03) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#5A0F24]/70">
                {myProposals.length}{' '}
                {myProposals.length === 1
                  ? 'postulación registrada'
                  : 'postulaciones registradas'}
              </p>
              <button
                type="button"
                onClick={loadMyProposals}
                disabled={loadingProposals}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C9B8A6]/50 text-xs font-bold text-[#5A0F24] hover:border-[#8C2C45] transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#8C2C45] ${
                    loadingProposals ? 'animate-spin' : ''
                  }`}
                />
                <span>Actualizar</span>
              </button>
            </div>

            {loadingProposals && myProposals.length === 0 ? (
              <div className="space-y-3">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 animate-pulse space-y-3"
                  >
                    <div className="h-4 w-28 bg-[#F3EFE6] rounded" />
                    <div className="h-6 w-2/3 bg-[#F3EFE6] rounded" />
                    <div className="h-4 w-1/2 bg-[#F3EFE6] rounded" />
                  </div>
                ))}
              </div>
            ) : myProposals.length === 0 ? (
              <div
                data-testid="empty-my-proposals"
                className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-10 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F3EFE6] text-[#8C2C45] flex items-center justify-center mx-auto">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h2 className="text-base font-extrabold text-[#5A0F24]">
                  Aún no tienes postulaciones registradas.
                </h2>
                <p className="text-xs text-[#5A0F24]/70 max-w-md mx-auto">
                  Explora las convocatorias abiertas y envía tu propuesta económica desglosada en hitos para comenzar.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Explorar Convocatorias</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="my-proposals-list">
                {myProposals.map((proposal) => {
                  const isWon = proposal.status === 'ADJUDICADA';
                  const isRejected = proposal.status === 'RECHAZADA';
                  const isExpanded = expandedProposalId === proposal.id;

                  const badgeClass = isWon
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isRejected
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-[#F3EFE6] text-[#5A0F24] border-[#C68A8F]/40';

                  return (
                    <article
                      key={proposal.id}
                      data-testid={`my-proposal-card-${proposal.projectId}`}
                      className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border uppercase tracking-wide ${badgeClass}`}
                        >
                          {proposal.status}
                        </span>

                        <span className="text-sm font-extrabold text-[#8C2C45]">
                          {formatMoney(proposal.totalPrice, proposal.currency)}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-[#5A0F24]">
                            {proposal.projectTitle}
                          </h3>
                          <p className="text-xs text-[#5A0F24]/70 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>{proposal.companyName}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8C2C45]" />
                              {proposal.estimatedDays} días
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Layers className="w-3 h-3 text-[#8C2C45]" />
                              {proposal.milestones.length}{' '}
                              {proposal.milestones.length === 1
                                ? 'hito'
                                : 'hitos'}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedProposalId(
                                isExpanded ? null : proposal.id
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#F3EFE6] hover:bg-[#C68A8F]/20 text-[#5A0F24] text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>{isExpanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            to={`/projects/${proposal.projectId}`}
                            className="px-3 py-1.5 rounded-xl border border-[#8C2C45] text-[#8C2C45] hover:bg-[#F3EFE6] text-xs font-bold inline-flex items-center gap-1 transition"
                          >
                            <span>Convocatoria</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pt-3 border-t border-[#C9B8A6]/30 space-y-3">
                          {proposal.coverLetter && (
                            <div className="p-3 rounded-xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/30">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A0F24]/70 mb-1">
                                Carta de propuesta
                              </p>
                              <p className="text-xs text-[#2b1b1e]/85 whitespace-pre-line leading-relaxed">
                                {proposal.coverLetter}
                              </p>
                            </div>
                          )}

                          {proposal.milestones.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A0F24]/70">
                                Desglose de hitos cotizados
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {proposal.milestones.map((m, idx) => (
                                  <div
                                    key={m.id || idx}
                                    className="p-2.5 rounded-xl bg-white border border-[#C9B8A6]/40 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-bold text-[#5A0F24] truncate">
                                        {idx + 1}. {m.title}
                                      </p>
                                      <p className="text-[11px] text-[#5A0F24]/65">
                                        {m.deliveryDays} días naturales
                                      </p>
                                    </div>
                                    <span className="font-extrabold text-[#8C2C45] shrink-0">
                                      {formatMoney(m.amount, proposal.currency)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {proposal.portfolioUrls.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-[#5A0F24]/70">
                                Portafolio:
                              </span>
                              {proposal.portfolioUrls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-[#8C2C45] hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Enlace #{idx + 1}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </FreelancerLayout>
  );
}
