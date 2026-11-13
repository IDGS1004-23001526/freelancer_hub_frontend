import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  Star,
  ExternalLink,
  FileArchive,
  ArrowRight,
  RotateCcw,
  Lock,
  X,
  Calendar,
  GripVertical,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import BlindReviewModal from '../features/reviews/BlindReviewModal.jsx';
import Toast from '../features/ui/Toast.jsx';
import { useContractStore } from '../stores/contract.store.js';
import { useAuthStore } from '../stores/auth.store.js';

const KANBAN_COLUMNS = [
  {
    key: 'TODO',
    title: 'Por Hacer',
    subtitle: 'Entregas planeadas en preparación',
    badgeClass: 'bg-[#F3EFE6] text-[#5A0F24] border border-[#C9B8A6]',
    headerBorder: 'border-t-4 border-t-[#8C2C45]',
  },
  {
    key: 'IN_REVIEW',
    title: 'En Revisión',
    subtitle: 'Listas para que revises y apruebes el avance',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
    headerBorder: 'border-t-4 border-t-amber-500',
  },
  {
    key: 'APPROVED',
    title: 'Aprobado & Pagado',
    subtitle: 'Entregas validadas con pago liberado',
    badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    headerBorder: 'border-t-4 border-t-emerald-600',
  },
];

export default function ContractKanbanPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const {
    contracts,
    selectedContractId,
    loading,
    updatingMilestoneId,
    submittingReview,
    loadContracts,
    setSelectedContractId,
    moveMilestone,
    submitBlindReview,
    revealCounterpartReview,
  } = useContractStore();

  const [inspectingMilestoneId, setInspectingMilestoneId] = useState(null);
  const [draggedMilestoneId, setDraggedMilestoneId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadContracts(id);
  }, [id, loadContracts]);

  const activeContract = useMemo(
    () =>
      contracts.find((c) => c.id === (id || selectedContractId)) ||
      contracts[0] ||
      null,
    [contracts, id, selectedContractId]
  );

  const inspectingMilestone = useMemo(
    () =>
      activeContract?.milestones.find((m) => m.id === inspectingMilestoneId) ||
      null,
    [activeContract, inspectingMilestoneId]
  );

  const formatMoney = (amount, currency = activeContract?.currency || 'USD') =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const metrics = useMemo(() => {
    if (!activeContract) {
      return {
        releasedAmount: 0,
        escrowAmount: 0,
        progressPct: 0,
        completedCount: 0,
        totalCount: 0,
      };
    }

    const totalCount = activeContract.milestones.length;
    const completedCount = activeContract.milestones.filter(
      (m) => m.status === 'APPROVED'
    ).length;
    const releasedAmount = activeContract.milestones
      .filter((m) => m.status === 'APPROVED')
      .reduce((acc, m) => acc + m.amount, 0);
    const escrowAmount = Math.max(
      0,
      activeContract.totalAmount - releasedAmount
    );
    const progressPct =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      releasedAmount,
      escrowAmount,
      progressPct,
      completedCount,
      totalCount,
    };
  }, [activeContract]);

  const handleStatusChange = async (milestone, nextStatus) => {
    if (!activeContract || milestone.status === nextStatus) return;

    const { justCompletedContract } = await moveMilestone(
      activeContract.id,
      milestone.id,
      nextStatus
    );

    if (nextStatus === 'APPROVED') {
      setToast({
        type: 'success',
        title: 'Hito aprobado y pago liberado',
        message: `Se liberaron ${formatMoney(
          milestone.amount,
          activeContract.currency
        )} a ${activeContract.freelancerName} por "${milestone.title}".`,
      });
    } else if (nextStatus === 'IN_REVIEW') {
      setToast({
        type: 'info',
        title: 'Entrega lista para revisión',
        message: `El hito "${milestone.title}" pasó a la columna En Revisión.`,
      });
    } else {
      setToast({
        type: 'info',
        title: 'Hito devuelto a Por Hacer',
        message: `Se solicitaron ajustes sobre "${milestone.title}".`,
      });
    }

    if (justCompletedContract) {
      setInspectingMilestoneId(null);
      setTimeout(() => {
        setIsReviewModalOpen(true);
      }, 350);
    }
  };

  const handleDropOnColumn = async (columnKey) => {
    setDragOverColumn(null);
    if (!draggedMilestoneId || !activeContract) return;
    const milestone = activeContract.milestones.find(
      (m) => m.id === draggedMilestoneId
    );
    setDraggedMilestoneId(null);
    if (milestone && milestone.status !== columnKey) {
      await handleStatusChange(milestone, columnKey);
    }
  };

  const handleReviewSubmit = async (payload) => {
    if (!activeContract) return;
    const reviewerName = user?.fullName || 'Sofía Ramírez';
    await submitBlindReview(
      payload,
      reviewerName,
      activeContract.freelancerName
    );
    setToast({
      type: 'success',
      title: 'Calificación guardada',
      message:
        'Tu reseña quedó protegida hasta que ambas partes hayan calificado.',
    });
  };

  const handleRevealCounterpart = async (contractId) => {
    if (!activeContract) return;
    await revealCounterpartReview(contractId, activeContract.freelancerName);
    setToast({
      type: 'success',
      title: '¡Ambas calificaciones están listas!',
      message: `Ya puedes leer la opinión que ${activeContract.freelancerName} dejó sobre este proyecto.`,
    });
  };

  const allCompleted =
    metrics.totalCount > 0 && metrics.completedCount === metrics.totalCount;

  return (
    <DashboardLayout>
      <div
        data-testid="contract-kanban-page"
        className="max-w-7xl mx-auto space-y-6"
      >
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Navegación superior y selector de contrato activo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al panel principal</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#8C2C45]" />
            <label
              htmlFor="select-active-contract"
              className="text-xs font-bold text-[#5A0F24]/80"
            >
              Contrato en seguimiento:
            </label>
            <select
              id="select-active-contract"
              value={activeContract?.id || ''}
              onChange={(e) => setSelectedContractId(e.target.value)}
              data-testid="select-contract-switcher"
              className="px-3.5 py-2 rounded-xl bg-white border border-[#C9B8A6] text-xs font-bold text-[#5A0F24] shadow-2xs focus:outline-none focus:border-[#8C2C45]"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.projectTitle} — {c.freelancerName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cabecera del Contrato y Resumen de Fondos en Custodia */}
        {activeContract && (
          <section className="bg-white rounded-3xl p-6 md:p-7 border border-[#C9B8A6]/60 shadow-[0_12px_35px_-15px_rgba(90,15,36,0.08)] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/50 text-[11px] font-bold text-[#8C2C45]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Contrato #{activeContract.id}</span>
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      allCompleted
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {allCompleted
                      ? 'Todas las entregas aprobadas'
                      : 'En ejecución'}
                  </span>
                </div>

                <h1 className="text-xl md:text-2xl font-extrabold text-[#5A0F24] tracking-tight">
                  {activeContract.projectTitle}
                </h1>

                <p className="text-xs md:text-sm text-[#5A0F24]/75">
                  Especialista a cargo:{' '}
                  <strong className="text-[#5A0F24]">
                    {activeContract.freelancerName}
                  </strong>{' '}
                  ({activeContract.freelancerRole})
                </p>
              </div>

              {/* Botón de Calificación Ciega (disponible al concluir o para evaluar el contrato) */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  data-testid="btn-open-blind-review"
                  className={`py-2.5 px-4 rounded-2xl text-xs font-extrabold transition-all inline-flex items-center gap-2 cursor-pointer ${
                    allCompleted
                      ? 'bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-md'
                      : 'bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] border border-[#C9B8A6]'
                  }`}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>
                    {activeContract.review
                      ? 'Ver estado de tu calificación'
                      : 'Calificar colaboración (Reseña ciega)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Indicadores financieros y barra de avance de hitos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#C9B8A6]/40">
              <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 block">
                  Saldo protegido en custodia
                </span>
                <span
                  data-testid="kanban-escrow-balance"
                  className="text-lg font-extrabold text-[#5A0F24] block mt-0.5"
                >
                  {formatMoney(metrics.escrowAmount, activeContract.currency)}{' '}
                  {activeContract.currency}
                </span>
                <span className="text-[11px] text-[#5A0F24]/70">
                  Pendiente de liberar por entregas
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/70 block">
                  Monto ya liberado al especialista
                </span>
                <span
                  data-testid="kanban-released-balance"
                  className="text-lg font-extrabold text-emerald-900 block mt-0.5"
                >
                  {formatMoney(metrics.releasedAmount, activeContract.currency)}{' '}
                  {activeContract.currency}
                </span>
                <span className="text-[11px] text-emerald-800">
                  {metrics.completedCount} de {metrics.totalCount} hitos pagados
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65">
                    Avance general del contrato
                  </span>
                  <span className="text-sm font-extrabold text-[#8C2C45]">
                    {metrics.progressPct}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#C9B8A6]/40 overflow-hidden my-2">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${metrics.progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#5A0F24]/70">
                  Arrastra tarjetas o usa los botones para actualizar cada etapa
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Banner cuando todos los hitos están aprobados */}
        {allCompleted && activeContract && (
          <div
            data-testid="contract-completed-banner"
            className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-fade-in"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-emerald-950">
                  ¡Todos los hitos de este contrato fueron aprobados y pagados!
                </h3>
                <p className="text-xs text-emerald-900/85 mt-0.5">
                  {activeContract.review
                    ? activeContract.review.isCounterpartSubmitted
                      ? 'Ambas calificaciones ya están disponibles y visibles.'
                      : 'Ya enviaste tu calificación; permanece oculta esperando la evaluación de tu contraparte.'
                    : `Comparte tu calificación sobre el trabajo con ${activeContract.freelancerName}. Tu opinión permanecerá oculta hasta que ambos califiquen.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shrink-0 cursor-pointer transition-colors"
            >
              {activeContract.review
                ? 'Ver calificación mutua →'
                : 'Dejar calificación ahora →'}
            </button>
          </div>
        )}

        {/* Tablero Kanban de 3 Columnas: 'Por Hacer', 'En Revisión' y 'Aprobado & Pagado' */}
        {loading || !activeContract ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-white/70 border border-[#C9B8A6]/40 animate-pulse p-5"
              />
            ))}
          </div>
        ) : (
          <div
            data-testid="kanban-board-columns"
            className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
          >
            {KANBAN_COLUMNS.map((column) => {
              const columnMilestones = activeContract.milestones.filter(
                (m) => m.status === column.key
              );
              const isDragTarget = dragOverColumn === column.key;

              return (
                <div
                  key={column.key}
                  data-testid={`kanban-column-${column.key}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverColumn(column.key);
                  }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={() => handleDropOnColumn(column.key)}
                  className={`bg-white/90 rounded-3xl p-5 border border-[#C9B8A6]/60 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] min-h-[420px] flex flex-col justify-between transition-all ${
                    column.headerBorder
                  } ${
                    isDragTarget
                      ? 'ring-4 ring-[#8C2C45]/25 bg-[#F3EFE6]/70'
                      : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Cabecera de la columna */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#C9B8A6]/40">
                      <div>
                        <h2 className="text-base font-extrabold text-[#5A0F24]">
                          {column.title}
                        </h2>
                        <p className="text-[11px] text-[#5A0F24]/70">
                          {column.subtitle}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${column.badgeClass}`}
                      >
                        {columnMilestones.length}
                      </span>
                    </div>

                    {/* Lista de tarjetas de hitos en esta columna */}
                    {columnMilestones.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#f6f2ee]/60 border border-dashed border-[#C9B8A6] text-center text-xs text-[#5A0F24]/60 font-semibold">
                        No hay entregas en «{column.title}» por ahora.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {columnMilestones.map((ms) => {
                          const isUpdating = updatingMilestoneId === ms.id;
                          return (
                            <article
                              key={ms.id}
                              draggable
                              onDragStart={() => setDraggedMilestoneId(ms.id)}
                              onDragEnd={() => {
                                setDraggedMilestoneId(null);
                                setDragOverColumn(null);
                              }}
                              data-testid={`kanban-card-${ms.id}`}
                              className={`p-4 rounded-2xl bg-white border-2 transition-all space-y-3 shadow-xs hover:shadow-md ${
                                ms.status === 'APPROVED'
                                  ? 'border-emerald-300 bg-emerald-50/25'
                                  : ms.status === 'IN_REVIEW'
                                    ? 'border-amber-300 bg-amber-50/20'
                                    : 'border-[#C9B8A6]/60'
                              } ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
                            >
                              {/* Encabezado de la tarjeta: Número de hito y Monto en custodia */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <GripVertical className="w-3.5 h-3.5 text-[#5A0F24]/40 cursor-grab shrink-0" />
                                  <span className="px-2.5 py-0.5 rounded-lg bg-[#5A0F24] text-[#F3EFE6] text-[10px] font-extrabold">
                                    Hito #{ms.order}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/60 block">
                                    {ms.status === 'APPROVED'
                                      ? 'Pago liberado'
                                      : 'Monto en custodia'}
                                  </span>
                                  <span
                                    data-testid={`milestone-amount-${ms.id}`}
                                    className="text-sm font-extrabold text-[#8C2C45]"
                                  >
                                    {formatMoney(
                                      ms.amount,
                                      activeContract.currency
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Título y descripción humana del hito */}
                              <div className="space-y-1">
                                <h3 className="text-sm font-extrabold text-[#5A0F24] leading-snug">
                                  {ms.title}
                                </h3>
                                <p className="text-xs text-[#5A0F24]/75 leading-relaxed">
                                  {ms.description}
                                </p>
                              </div>

                              {/* Fecha comprometida */}
                              <div className="flex items-center justify-between text-[11px] text-[#5A0F24]/70 pt-1">
                                <span className="inline-flex items-center gap-1 font-semibold">
                                  <Calendar className="w-3.5 h-3.5 text-[#8C2C45]" />
                                  <span>Fecha estimada: {ms.dueDate}</span>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#8C2C45]" />
                                  <span>{ms.deliveryDays} días</span>
                                </span>
                              </div>

                              {/* Botones de acción en la tarjeta */}
                              <div className="pt-3 border-t border-[#C9B8A6]/40 flex flex-wrap items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => setInspectingMilestoneId(ms.id)}
                                  data-testid={`btn-inspect-${ms.id}`}
                                  className="flex-1 py-2 px-3 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#8C2C45]" />
                                  <span>Inspeccionar entrega</span>
                                </button>

                                {ms.status === 'TODO' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(ms, 'IN_REVIEW')
                                    }
                                    data-testid={`btn-move-review-${ms.id}`}
                                    className="py-2 px-3 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Enviar este hito a revisión"
                                  >
                                    <span>Pasar a revisión</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {ms.status === 'IN_REVIEW' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(ms, 'APPROVED')
                                    }
                                    data-testid={`btn-approve-${ms.id}`}
                                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Aprobar y pagar</span>
                                  </button>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Inspección de Entrega Técnica */}
        {inspectingMilestone && activeContract && (
          <div
            role="dialog"
            aria-modal="true"
            data-testid="delivery-inspection-modal"
            className="fixed inset-0 z-50 bg-[#2b1b1e]/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#C9B8A6]/60 shadow-[0_25px_65px_-15px_rgba(90,15,36,0.35)] overflow-hidden animate-fade-in">
              {/* Cabecera */}
              <div className="p-6 bg-gradient-to-r from-[#5A0F24] to-[#8C2C45] text-[#F3EFE6] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#C68A8F]" />
                    <span>
                      Inspección de entrega • Hito #{inspectingMilestone.order}
                    </span>
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    {inspectingMilestone.title}
                  </h3>
                  <p className="text-xs text-[#F3EFE6]/85">
                    Monto asignado en custodia:{' '}
                    <strong>
                      {formatMoney(
                        inspectingMilestone.amount,
                        activeContract.currency
                      )}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingMilestoneId(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Cerrar inspección"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cuerpo del modal */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]/75">
                    ¿Qué incluye esta etapa?
                  </h4>
                  <p className="text-xs md:text-sm text-[#5A0F24] bg-[#F3EFE6]/60 p-4 rounded-2xl border border-[#C9B8A6]/50 leading-relaxed">
                    {inspectingMilestone.description}
                  </p>
                </div>

                {inspectingMilestone.delivery ? (
                  <>
                    {/* Notas del especialista */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]/75">
                        Mensaje de {activeContract.freelancerName} sobre esta entrega
                      </h4>
                      <p className="text-xs md:text-sm text-[#5A0F24]/90 bg-[#f6f2ee] p-4 rounded-2xl border border-[#e8deda] leading-relaxed">
                        “{inspectingMilestone.delivery.notes}”
                      </p>
                    </div>

                    {/* Enlaces y archivo entregado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={inspectingMilestone.delivery.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-2xl bg-[#F3EFE6]/80 hover:bg-[#F3EFE6] border border-[#C9B8A6]/60 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C2C45] block">
                            Repositorio / Diseño
                          </span>
                          <span className="text-xs font-extrabold text-[#5A0F24]">
                            Abrir avance enviado
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#8C2C45]" />
                      </a>

                      {inspectingMilestone.delivery.demoUrl && (
                        <a
                          href={inspectingMilestone.delivery.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3.5 rounded-2xl bg-[#F3EFE6]/80 hover:bg-[#F3EFE6] border border-[#C9B8A6]/60 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C2C45] block">
                              Demostración en vivo
                            </span>
                            <span className="text-xs font-extrabold text-[#5A0F24]">
                              Probar vista interactiva
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-[#8C2C45]" />
                        </a>
                      )}
                    </div>

                    {/* Archivo y sello de integridad SHA-256 */}
                    <div className="p-4 rounded-2xl bg-emerald-50/75 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <FileArchive className="w-5 h-5 text-emerald-700" />
                          <div>
                            <p className="text-xs font-extrabold text-emerald-950">
                              {inspectingMilestone.delivery.fileName} (
                              {inspectingMilestone.delivery.fileSize})
                            </p>
                            <p className="text-[11px] text-emerald-800">
                              Archivo verificado sin alteraciones desde su envío
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                          Integridad verificada
                        </span>
                      </div>

                      <div className="pt-2 border-t border-emerald-200/70 flex items-center gap-2 text-[11px] text-emerald-900/80 font-mono break-all">
                        <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>
                          Huella SHA-256: {inspectingMilestone.delivery.sha256Hash}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#F3EFE6]/60 border border-dashed border-[#C9B8A6] text-center space-y-2">
                    <p className="text-xs font-bold text-[#5A0F24]">
                      Este hito aún se encuentra en la etapa «Por Hacer».
                    </p>
                    <p className="text-[11px] text-[#5A0F24]/70">
                      Puedes enviarlo a revisión para simular la recepción del entregable por parte del especialista.
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones del modal */}
              <div className="px-6 py-4 bg-[#F3EFE6]/70 border-t border-[#C9B8A6]/50 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setInspectingMilestoneId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A0F24] hover:bg-[#C9B8A6]/30 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {inspectingMilestone.status === 'TODO' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(inspectingMilestone, 'IN_REVIEW');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Recibir entrega en revisión</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {inspectingMilestone.status === 'IN_REVIEW' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          handleStatusChange(inspectingMilestone, 'TODO');
                          setInspectingMilestoneId(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Solicitar ajustes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleStatusChange(inspectingMilestone, 'APPROVED');
                          setInspectingMilestoneId(null);
                        }}
                        data-testid="btn-modal-approve-milestone"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprobar entrega y liberar pago</span>
                      </button>
                    </>
                  )}

                  {inspectingMilestone.status === 'APPROVED' && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-extrabold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Entrega aprobada y pagada</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Calificación Ciega y Feedback Recíproco (HU-13) */}
        <BlindReviewModal
          isOpen={isReviewModalOpen}
          contract={activeContract}
          submitting={submittingReview}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmitReview={handleReviewSubmit}
          onRevealCounterpart={handleRevealCounterpart}
        />
      </div>
    </DashboardLayout>
  );
}
