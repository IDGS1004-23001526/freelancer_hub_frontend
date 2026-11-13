import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutGrid,
  Table2,
  SlidersHorizontal,
  Users,
  ArrowUpDown,
  MousePointerClick,
} from 'lucide-react';
import { useCandidateStore } from '../../../stores/candidate.store.js';
import { calculateCandidateMcda } from '../../../utils/mcda.js';
import CandidateCard from './CandidateCard.jsx';
import CandidateComparisonTable from './CandidateComparisonTable.jsx';
import CandidateProposalDetail from './CandidateProposalDetail.jsx';
import {
  PortfolioModal,
  QuickChatModal,
  ContractCreatedBanner,
} from './CandidateModals.jsx';
import Toast from '../../ui/Toast.jsx';

export default function CandidateComparisonView({ project }) {
  const {
    proposals,
    loading,
    acceptingId,
    viewMode,
    sortBy,
    weights,
    activeContract,
    loadProposals,
    setViewMode,
    setSortBy,
    applyPriorityPreset,
    acceptProposal,
    updateProposalStatus,
  } = useCandidateStore();

  const [priorityPreset, setPriorityPreset] = useState('balanced');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedPortfolioCandidate, setSelectedPortfolioCandidate] =
    useState(null);
  const [selectedChatCandidate, setSelectedChatCandidate] = useState(null);
  const [toast, setToast] = useState(null);
  const sectionRef = useRef(null);

  const projectId = project?.id || 'proj_101';
  const projectTitle = project?.title || 'Convocatoria activa';
  const projectCategory = project?.category || 'Desarrollo Web';
  const projectBudget = project?.budget || 4500;
  const projectCurrency = project?.currency || 'USD';
  const projectSkills = useMemo(
    () => project?.skills || ['React', 'TypeScript', 'Node.js'],
    [project?.skills]
  );

  useEffect(() => {
    setSelectedCandidateId(null);
    loadProposals(projectId, {
      title: projectTitle,
      category: projectCategory,
      budget: projectBudget,
      currency: projectCurrency,
      skills: projectSkills,
    });
  }, [
    projectId,
    projectTitle,
    projectCategory,
    projectBudget,
    projectCurrency,
    projectSkills,
    loadProposals,
  ]);

  const formatMoney = (amount, currency = projectCurrency) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const scoredAndSortedCandidates = useMemo(() => {
    const withUpdatedScores = proposals.map((candidate) => ({
      ...candidate,
      mcda: calculateCandidateMcda(
        candidate,
        projectBudget,
        projectSkills,
        32,
        weights
      ),
    }));

    return [...withUpdatedScores].sort((a, b) => {
      if (sortBy === 'price') {
        return a.totalPrice - b.totalPrice;
      }
      if (sortBy === 'timeline') {
        return a.estimatedDays - b.estimatedDays;
      }
      if (sortBy === 'reputation') {
        return b.reputation - a.reputation;
      }
      return (b.mcda?.totalScore ?? 0) - (a.mcda?.totalScore ?? 0);
    });
  }, [proposals, projectBudget, projectSkills, weights, sortBy]);

  const hasAcceptedProposal = useMemo(
    () => scoredAndSortedCandidates.some((c) => c.status === 'ACCEPTED'),
    [scoredAndSortedCandidates]
  );

  const selectedCandidate = useMemo(
    () =>
      scoredAndSortedCandidates.find((c) => c.id === selectedCandidateId) ||
      null,
    [scoredAndSortedCandidates, selectedCandidateId]
  );

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  const handlePriorityChange = (presetKey) => {
    setPriorityPreset(presetKey);
    applyPriorityPreset(presetKey);
  };

  const handleAcceptProposal = async (candidate) => {
    setSelectedCandidateId(candidate.id);
    const contract = await acceptProposal(candidate, {
      budget: projectBudget,
      currency: projectCurrency,
      skills: projectSkills,
    });

    setToast({
      type: 'success',
      title: 'Propuesta aceptada',
      message: `Se creó el contrato con ${candidate.freelancerName} por ${formatMoney(
        contract.totalAmount,
        contract.currency
      )}.`,
    });
  };

  const handleToggleRejectProposal = async (candidate) => {
    const nextStatus = candidate.status === 'REJECTED' ? 'PENDING' : 'REJECTED';
    await updateProposalStatus(candidate.id, nextStatus);
    setToast({
      type: nextStatus === 'REJECTED' ? 'info' : 'success',
      title:
        nextStatus === 'REJECTED'
          ? 'Postulación descartada'
          : 'Postulación restaurada',
      message:
        nextStatus === 'REJECTED'
          ? `La postulación de ${candidate.freelancerName} fue marcada como descartada.`
          : `La postulación de ${candidate.freelancerName} volvió a estado en evaluación.`,
    });
  };

  return (
    <section
      ref={sectionRef}
      data-testid="candidate-comparison-view"
      className="space-y-6"
    >
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Banner cuando ya se creó un contrato */}
      {activeContract && activeContract.projectId === projectId && (
        <ContractCreatedBanner
          contract={activeContract}
          formatMoney={formatMoney}
        />
      )}

      {/* Si hay una postulación seleccionada, entra a la vista de detalle completo con todos sus datos y acciones */}
      {selectedCandidate ? (
        <CandidateProposalDetail
          candidate={selectedCandidate}
          allCandidates={scoredAndSortedCandidates}
          onSelectCandidate={(id) => handleSelectCandidate(id)}
          projectBudget={projectBudget}
          projectTitle={projectTitle}
          formatMoney={formatMoney}
          onViewPortfolio={(cand) => setSelectedPortfolioCandidate(cand)}
          onStartChat={(cand) => setSelectedChatCandidate(cand)}
          onAcceptProposal={handleAcceptProposal}
          onToggleRejectProposal={handleToggleRejectProposal}
          isAccepting={acceptingId === selectedCandidate.id}
          hasAcceptedProposal={hasAcceptedProposal}
          onCloseDetail={() => setSelectedCandidateId(null)}
        />
      ) : (
        <>
          {/* Vista General de Postulaciones: Encabezado y controles */}
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#C9B8A6]/60 shadow-[0_12px_35px_-15px_rgba(90,15,36,0.08)] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 text-[11px] font-bold text-[#8C2C45]">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {scoredAndSortedCandidates.length} postulaciones recibidas
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#5A0F24] tracking-tight">
                  Vista general de postulaciones
                </h2>
                <p className="text-xs md:text-sm text-[#5A0F24]/75">
                  Revisa los detalles básicos de cada candidato y selecciona cualquier postulación para entrar a su expediente completo y ejecutar las acciones correspondientes.
                </p>
              </div>

              {/* Selector de modo: Tarjetas vs Tabla */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  data-testid="btn-view-cards"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-[#5A0F24] text-[#F3EFE6] shadow-2xs'
                      : 'text-[#5A0F24]/75 hover:text-[#5A0F24]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tarjetas básicas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  data-testid="btn-view-table"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-[#5A0F24] text-[#F3EFE6] shadow-2xs'
                      : 'text-[#5A0F24]/75 hover:text-[#5A0F24]'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Tabla básica</span>
                </button>
              </div>
            </div>

            {/* Barra de prioridades y ordenamiento */}
            <div className="pt-4 border-t border-[#C9B8A6]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#5A0F24]/75 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span>¿Qué te interesa priorizar en esta elección?</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'balanced', label: 'Balance general' },
                    { key: 'skills', label: 'Dominio técnico' },
                    { key: 'budget', label: 'Mejor precio' },
                    { key: 'speed', label: 'Entrega más rápida' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handlePriorityChange(option.key)}
                      data-testid={`priority-${option.key}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        priorityPreset === option.key
                          ? 'bg-[#8C2C45] text-white'
                          : 'bg-[#F3EFE6]/80 hover:bg-[#e8dfd1] text-[#5A0F24] border border-[#C9B8A6]/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start lg:self-end">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8C2C45]" />
                <label
                  htmlFor="candidate-sort"
                  className="text-xs font-bold text-[#5A0F24]/80"
                >
                  Ordenar por:
                </label>
                <select
                  id="candidate-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  data-testid="select-sort-candidates"
                  className="px-3 py-1.5 rounded-xl bg-[#F3EFE6] border border-[#C9B8A6] text-xs font-bold text-[#5A0F24] focus:outline-none focus:border-[#8C2C45]"
                >
                  <option value="score">Mayor compatibilidad</option>
                  <option value="price">Menor precio cotizado</option>
                  <option value="timeline">Menor tiempo de entrega</option>
                  <option value="reputation">Mejor calificación</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listado general con detalles básicos (Tarjetas o Tabla) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-3xl bg-white/70 border border-[#C9B8A6]/40 animate-pulse p-6"
                />
              ))}
            </div>
          ) : viewMode === 'cards' ? (
            <div
              data-testid="candidate-cards-grid"
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              {scoredAndSortedCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={index + 1}
                  isSelected={selectedCandidateId === candidate.id}
                  onSelect={() => handleSelectCandidate(candidate.id)}
                  formatMoney={formatMoney}
                />
              ))}
            </div>
          ) : (
            <CandidateComparisonTable
              candidates={scoredAndSortedCandidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={(cand) => handleSelectCandidate(cand.id)}
              formatMoney={formatMoney}
            />
          )}

          {/* Indicador informativo inferior en la vista general */}
          <div className="p-4 rounded-2xl bg-[#F3EFE6]/75 border border-dashed border-[#C9B8A6] text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold text-[#5A0F24]/75">
            <MousePointerClick className="w-4 h-4 text-[#8C2C45]" />
            <span>
              Haz clic en cualquiera de las postulaciones para entrar a todos sus detalles, revisar hitos, portafolio y ejecutar las acciones de contratación o contacto.
            </span>
          </div>
        </>
      )}

      {/* Modales interactivos para Ver Portafolio e Iniciar Chat */}
      <PortfolioModal
        candidate={selectedPortfolioCandidate}
        onClose={() => setSelectedPortfolioCandidate(null)}
        onStartChat={(cand) => setSelectedChatCandidate(cand)}
      />

      <QuickChatModal
        candidate={selectedChatCandidate}
        projectTitle={project?.title || 'tu proyecto'}
        onClose={() => setSelectedChatCandidate(null)}
      />
    </section>
  );
}
