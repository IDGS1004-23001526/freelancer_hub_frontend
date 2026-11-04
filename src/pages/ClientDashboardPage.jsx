import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProjectCard from '../features/projects/components/ProjectCard.jsx';
import { PROJECT_CATEGORIES } from '../interfaces/project.interface.js';
import { useProjectStore } from '../stores/project.store.js';
import { useAuthStore } from '../stores/auth.store.js';

export default function ClientDashboardPage() {
  const location = useLocation();
  const { projects, wallet } = useProjectStore();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');

  const displayName = user?.fullName || 'Sofía Ramírez';
  const highlightedId = location.state?.newProjectId || null;

  const openProjectsCount = projects.filter((p) => p.status === 'ABIERTO').length;
  const totalProposals = projects.reduce(
    (acc, item) => acc + (item.proposalsCount || 0),
    0
  );

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

  const formatMoney = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: wallet.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Banner del Dashboard de Clientes */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.1)] border border-[#C9B8A6]/50 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#C68A8F]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#8C2C45]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span className="text-[11px] font-bold text-[#5A0F24] uppercase tracking-wider">
                  Menú Principal • Panel de Clientes
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight mb-2">
                ¡Hola, {displayName}! Gestiona tus convocatorias
              </h1>
              <p className="text-xs md:text-sm text-[#5A0F24]/75 leading-relaxed">
                Publica nuevos proyectos, supervisa las convocatorias con estado{' '}
                <span className="font-bold text-emerald-800">ABIERTO</span> y administra tu saldo protegido en Escrow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/projects/new"
                data-testid="hero-btn-nueva-convocatoria"
                className="py-3 px-5 rounded-2xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs md:text-sm font-bold shadow-[0_8px_22px_-4px_rgba(140,44,69,0.4)] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Nueva Convocatoria</span>
              </Link>
            </div>
          </div>

          {/* KPI Metric Cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7 pt-6 border-t border-[#C9B8A6]/40">
            <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A0F24]/70 uppercase tracking-wider">
                  Convocatorias Abiertas
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-extrabold text-[#5A0F24]">
                    {openProjectsCount}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ABIERTO
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#8C2C45] text-[#F3EFE6] flex items-center justify-center shrink-0 shadow-xs">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A0F24]/70 uppercase tracking-wider">
                  Total Proyectos
                </p>
                <p className="text-xl font-extrabold text-[#5A0F24] mt-0.5">
                  {projects.length} registrados
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#5A0F24] text-[#F3EFE6] flex items-center justify-center shrink-0 shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A0F24]/70 uppercase tracking-wider">
                  Saldo / Tarjeta ({wallet.cardLast4})
                </p>
                <p className="text-xl font-extrabold text-[#5A0F24] mt-0.5">
                  {formatMoney(wallet.balance)} {wallet.currency}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#C68A8F]/30 text-[#5A0F24] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-[#8C2C45]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A0F24]/70 uppercase tracking-wider">
                  Propuestas Recibidas
                </p>
                <p className="text-xl font-extrabold text-[#5A0F24] mt-0.5">
                  {totalProposals} postulaciones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catálogo y Filtros de Convocatorias */}
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-[#5A0F24] tracking-tight">
                Catálogo de Convocatorias y Proyectos
              </h2>
              <p className="text-xs text-[#5A0F24]/70">
                Explora tus convocatorias publicadas y filtra por estado o especialidad técnica.
              </p>
            </div>

            {/* Tabs de Estado */}
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#C9B8A6]/50 self-start">
              {[
                { id: 'TODOS', label: `Todos (${projects.length})` },
                { id: 'ABIERTO', label: `ABIERTO (${openProjectsCount})` },
                { id: 'EN_PROGRESO', label: 'En Progreso' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-[#8C2C45] text-white shadow-2xs'
                      : 'text-[#5A0F24]/70 hover:text-[#5A0F24] hover:bg-[#F3EFE6]/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de búsqueda y selector de categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#C9B8A6]/50 shadow-2xs">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a868a]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, categoría o habilidad (ej. React, TypeScript, Figma)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f2ee]/60 border border-[#e8deda] focus:bg-white focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs md:text-sm text-[#2b1b1e] placeholder-[#b0a0a4] focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a868a]">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f2ee]/60 border border-[#e8deda] focus:bg-white focus:ring-2 focus:ring-[#72293e]/20 focus:border-[#72293e] rounded-xl text-xs md:text-sm text-[#2b1b1e] focus:outline-none transition-all cursor-pointer"
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

          {/* Grid de Proyectos */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-[#C9B8A6] space-y-3">
              <FolderKanban className="w-10 h-10 text-[#8C2C45]/50 mx-auto" />
              <h3 className="text-base font-extrabold text-[#5A0F24]">
                No se encontraron convocatorias con esos filtros
              </h3>
              <p className="text-xs text-[#5A0F24]/70 max-w-md mx-auto">
                Intenta limpiar tu búsqueda o publica una nueva convocatoria para conectar con especialistas.
              </p>
              <div className="pt-2">
                <Link
                  to="/projects/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nueva Convocatoria</span>
                </Link>
              </div>
            </div>
          ) : (
            <div
              data-testid="projects-catalog-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
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

        {/* Banner informativo de Garantía Escrow */}
        <section className="p-5 rounded-2xl bg-gradient-to-r from-[#fff3f4] to-[#F3EFE6] border border-[#C68A8F]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#8C2C45] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-extrabold text-[#5A0F24]">
                Protección Total para Clientes con Custodia Escrow
              </h4>
              <p className="text-xs text-[#5A0F24]/75">
                Los fondos de tus convocatorias se liberan únicamente cuando apruebas los entregables acordados.
              </p>
            </div>
          </div>
          <Link
            to="/projects/new"
            className="text-xs font-extrabold text-[#8C2C45] hover:text-[#5A0F24] underline shrink-0"
          >
            Publicar proyecto ahora →
          </Link>
        </section>
      </div>
    </DashboardLayout>
  );
}
