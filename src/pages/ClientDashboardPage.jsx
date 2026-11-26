import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  FolderKanban,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProjectCard from '../features/projects/components/ProjectCard.jsx';
import { PROJECT_CATEGORIES } from '../interfaces/project.interface.js';
import { useProjectStore } from '../stores/project.store.js';

export default function ClientDashboardPage() {
  const location = useLocation();
  const { projects } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');

  const highlightedId = location.state?.newProjectId || null;
  const justCreated = Boolean(location.state?.justCreated);

  const openProjectsCount = projects.filter((p) => p.status === 'ABIERTO').length;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !searchQuery.trim() ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'TODAS' || project.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'TODOS' || project.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <DashboardLayout
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Buscar por título, categoría o habilidad..."
    >
      <div className="space-y-6">
        {justCreated && (
          <div
            role="status"
            data-testid="convocatoria-created-banner"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                  ¡Convocatoria publicada exitosamente en el feed!
                </p>
                <p className="text-[11px] text-emerald-900/80">
                  Tu proyecto ya se encuentra activo con estado ABIERTO para recibir propuestas.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider shrink-0">
              ABIERTO
            </span>
          </div>
        )}

        {/* Encabezado limpio consistente con la vista Freelancer */}
        <section className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#5A0F24] tracking-tight">
              Convocatorias y Proyectos
            </h1>
            <p className="text-xs sm:text-sm text-[#5A0F24]/70 mt-0.5">
              Publica convocatorias, supervisa el estado ABIERTO y revisa las propuestas recibidas.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Link
              to="/projects/new"
              data-testid="hero-btn-nueva-convocatoria"
              className="px-4 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Convocatoria</span>
            </Link>
          </div>
        </section>

        {/* Filtros y Tabs de Estado */}
        <section className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-[#F3EFE6] border border-[#C9B8A6]/40 self-start">
              {[
                { id: 'TODOS', label: `Todos (${projects.length})` },
                { id: 'ABIERTO', label: `ABIERTO (${openProjectsCount})` },
                { id: 'EN_PROGRESO', label: 'En Progreso' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-[#8C2C45] text-white shadow-xs'
                      : 'text-[#5A0F24]/75 hover:text-[#5A0F24]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 flex-1 md:max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#C9B8A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o habilidad..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F3EFE6] border border-[#C9B8A6]/40 rounded-xl text-xs text-[#2b1b1e] placeholder-[#5A0F24]/50 focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white transition"
                />
              </div>

              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-[#8C2C45] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-[#F3EFE6] border border-[#C9B8A6]/40 rounded-xl text-xs font-bold text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-[#8C2C45] cursor-pointer"
                >
                  <option value="TODAS">Todas las categorías</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Grid de Proyectos */}
        <section>
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#C9B8A6]/40 space-y-3">
              <FolderKanban className="w-10 h-10 text-[#8C2C45]/50 mx-auto" />
              <h3 className="text-base font-extrabold text-[#5A0F24]">
                No se encontraron convocatorias con esos filtros
              </h3>
              <p className="text-xs text-[#5A0F24]/70 max-w-md mx-auto">
                Intenta limpiar tu búsqueda o publica una nueva convocatoria para conectar con especialistas.
              </p>
              <div className="pt-1">
                <Link
                  to="/projects/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Convocatoria</span>
                </Link>
              </div>
            </div>
          ) : (
            <div
              data-testid="projects-catalog-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  highlight={project.id === highlightedId}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
