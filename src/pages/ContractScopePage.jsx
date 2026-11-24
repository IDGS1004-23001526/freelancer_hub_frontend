import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSignature,
  History,
  Layers,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Toast from '../features/ui/Toast.jsx';
import { useAuthStore } from '../stores/auth.store.js';
import { scopeApi } from '../api/scope.api.js';

const COMPLEXITY_OPTIONS = [
  { value: 1.0, label: 'Normal (1.0x)', hint: 'Tarifa estándar proporcional' },
  { value: 1.25, label: 'Media (1.25x)', hint: '+25% esfuerzo técnico' },
  { value: 1.5, label: 'Alta (1.5x)', hint: '+50% complejidad / urgencia' },
];

export default function ContractScopePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(id || '');
  const [activeContract, setActiveContract] = useState(null);
  const [versions, setVersions] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);

  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'addenda' | 'versions'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signingId, setSigningId] = useState(null);
  const [toast, setToast] = useState(null);

  // Formulario de nueva solicitud de cambio
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexityFactor, setComplexityFactor] = useState(1.0);
  const [deliverables, setDeliverables] = useState([
    { title: '', description: '', estimatedDays: '' },
  ]);

  // Firma directa por ID (útil si la contraparte creó la adenda desde otra sesión)
  const [manualChangeRequestId, setManualChangeRequestId] = useState('');

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await scopeApi.getContracts();
      setContracts(list);
      const targetId = id || list[0]?.id || '';
      setSelectedContractId(targetId);
    } catch (error) {
      setToast({
        type: 'error',
        title: 'No se pudieron cargar los contratos',
        message:
          error?.response?.data?.message ||
          'Verifica que tu sesión esté activa y el backend en ejecución.',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadContractDetails = useCallback(async (contractId) => {
    if (!contractId) {
      setActiveContract(null);
      setVersions([]);
      setChangeRequests([]);
      return;
    }

    try {
      const [detail, versionList] = await Promise.all([
        scopeApi.getContractById(contractId),
        scopeApi.getVersions(contractId).catch(() => []),
      ]);
      setActiveContract(detail);
      setVersions(versionList);
      setChangeRequests(scopeApi.getLocalChangeRequests(contractId));
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Error al consultar contrato',
        message:
          error?.response?.data?.message ||
          'No fue posible obtener el detalle del contrato.',
      });
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  useEffect(() => {
    if (selectedContractId) {
      loadContractDetails(selectedContractId);
    }
  }, [selectedContractId, loadContractDetails]);

  const baseMetrics = useMemo(() => {
    if (!activeContract) {
      return { baseAmount: 0, baseDays: 0, baseCount: 0, dailyRate: 0, avgDays: 0 };
    }
    const baseAmount = Number(activeContract.totalAmount || 0);
    const milestones = Array.isArray(activeContract.milestones)
      ? activeContract.milestones
      : [];
    const baseDays = milestones.reduce(
      (acc, m) => acc + Number(m.deliveryDays || 0),
      0
    );
    const baseCount = milestones.length;
    const dailyRate = baseDays > 0 ? baseAmount / baseDays : 0;
    const avgDays = baseCount > 0 ? baseDays / baseCount : 0;

    return {
      baseAmount,
      baseDays,
      baseCount,
      dailyRate,
      avgDays,
    };
  }, [activeContract]);

  // Vista previa en tiempo real del algoritmo del Triángulo de Hierro
  const previewImpact = useMemo(() => {
    if (
      baseMetrics.baseAmount <= 0 ||
      baseMetrics.baseDays <= 0 ||
      baseMetrics.baseCount <= 0
    ) {
      return null;
    }

    const validDeliverables = deliverables.filter((d) => d.title.trim().length > 0);
    if (validDeliverables.length === 0) return null;

    let addedDays = 0;
    let addedCost = 0;

    const breakdown = validDeliverables.map((item) => {
      const parsedDays = Number(item.estimatedDays);
      const rawDays =
        parsedDays > 0
          ? parsedDays * complexityFactor
          : baseMetrics.avgDays * complexityFactor;

      const deliveryDays = Math.max(1, Math.ceil(rawDays));
      const amount = Math.round(deliveryDays * baseMetrics.dailyRate * 100) / 100;

      addedDays += deliveryDays;
      addedCost += amount;

      return {
        title: item.title.trim(),
        deliveryDays,
        amount,
      };
    });

    return {
      dailyRateApplied: Math.round(baseMetrics.dailyRate * 100) / 100,
      suggestedAddedDays: addedDays,
      suggestedAddedCost: Math.round(addedCost * 100) / 100,
      newTotalDays: baseMetrics.baseDays + addedDays,
      newTotalAmount: Math.round((baseMetrics.baseAmount + addedCost) * 100) / 100,
      breakdown,
    };
  }, [baseMetrics, deliverables, complexityFactor]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: activeContract?.currency || 'MXN',
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const handleAddDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      { title: '', description: '', estimatedDays: '' },
    ]);
  };

  const handleRemoveDeliverable = (index) => {
    if (deliverables.length <= 1) return;
    setDeliverables((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDeliverableChange = (index, field, value) => {
    setDeliverables((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    if (!activeContract) return;

    const preparedDeliverables = deliverables
      .filter((d) => d.title.trim().length > 0)
      .map((d) => ({
        title: d.title.trim(),
        description: d.description.trim() || undefined,
        estimatedDays: d.estimatedDays ? Number(d.estimatedDays) : undefined,
      }));

    if (title.trim().length < 5) {
      setToast({
        type: 'error',
        title: 'Título muy corto',
        message: 'El título de la adenda debe tener al menos 5 caracteres.',
      });
      return;
    }

    if (description.trim().length < 15) {
      setToast({
        type: 'error',
        title: 'Descripción insuficiente',
        message: 'Describe el cambio de alcance con al menos 15 caracteres.',
      });
      return;
    }

    if (preparedDeliverables.length === 0) {
      setToast({
        type: 'error',
        title: 'Entregables requeridos',
        message: 'Agrega al menos un entregable nuevo para calcular el impacto.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await scopeApi.createChangeRequest(activeContract.id, {
        title: title.trim(),
        description: description.trim(),
        complexityFactor,
        addedDeliverables: preparedDeliverables,
      });

      setChangeRequests((prev) => [
        response.changeRequest,
        ...prev.filter((item) => item.id !== response.changeRequest.id),
      ]);

      setTitle('');
      setDescription('');
      setComplexityFactor(1.0);
      setDeliverables([{ title: '', description: '', estimatedDays: '' }]);
      setActiveTab('addenda');

      await loadContractDetails(activeContract.id);

      setToast({
        type: 'success',
        title: 'Adenda registrada con el Triángulo de Hierro',
        message: `Impacto calculado: +${response.ironTriangleCalculation.suggestedAddedDays} días y +${formatMoney(
          response.ironTriangleCalculation.suggestedAddedCost
        )}. Esperando firma de la contraparte.`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'No se pudo registrar la solicitud',
        message:
          error?.response?.data?.message ||
          'Verifica los datos e intenta nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (changeRequestId) => {
    if (!activeContract || !changeRequestId) return;
    setSigningId(changeRequestId);
    try {
      const res = await scopeApi.approveChangeRequest(
        activeContract.id,
        changeRequestId
      );

      setChangeRequests((prev) => {
        const exists = prev.some((c) => c.id === res.changeRequest.id);
        if (exists) {
          return prev.map((c) =>
            c.id === res.changeRequest.id ? res.changeRequest : c
          );
        }
        return [res.changeRequest, ...prev];
      });

      await loadContractDetails(activeContract.id);

      setToast({
        type: 'success',
        title: res.awaitingCounterpartySignature
          ? 'Firma digital registrada'
          : `Adenda aprobada (Versión ${res.newVersionNumber})`,
        message: res.awaitingCounterpartySignature
          ? 'Tu firma quedó registrada. El contrato base se actualizará cuando firme la contraparte.'
          : 'Ambas partes confirmaron la adenda. El contrato base y la bitácora inmutable fueron actualizados.',
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Error al firmar adenda',
        message:
          error?.response?.data?.message ||
          'No se pudo procesar la confirmación digital.',
      });
    } finally {
      setSigningId(null);
    }
  };

  const handleReject = async (changeRequestId) => {
    if (!activeContract || !changeRequestId) return;
    setSigningId(changeRequestId);
    try {
      const updated = await scopeApi.rejectChangeRequest(
        activeContract.id,
        changeRequestId
      );
      setChangeRequests((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setToast({
        type: 'info',
        title: 'Adenda rechazada',
        message: 'La solicitud de cambio fue rechazada sin alterar el contrato base.',
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Error al rechazar adenda',
        message:
          error?.response?.data?.message ||
          'No se pudo rechazar la solicitud.',
      });
    } finally {
      setSigningId(null);
    }
  };

  const handleContractSwitch = (newId) => {
    setSelectedContractId(newId);
    if (newId) {
      navigate(`/contracts/${newId}/scope`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Navegación superior */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              to={activeContract ? `/contracts/${activeContract.id}` : '/contracts'}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al tablero del contrato</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Scale className="w-4 h-4 text-[#8C2C45]" />
            <label
              htmlFor="scope-contract-select"
              className="text-xs font-bold text-[#5A0F24]/80"
            >
              Contrato:
            </label>
            <select
              id="scope-contract-select"
              value={selectedContractId}
              onChange={(e) => handleContractSwitch(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#C9B8A6] text-xs font-bold text-[#5A0F24] focus:outline-none focus:border-[#8C2C45]"
            >
              {contracts.length === 0 && (
                <option value="">Sin contratos activos</option>
              )}
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id.slice(0, 8)} — {c.status} ({formatMoney(c.totalAmount)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cabecera Triángulo de Hierro */}
        <section className="bg-white rounded-3xl p-6 md:p-7 border border-[#C9B8A6]/60 shadow-[0_12px_35px_-15px_rgba(90,15,36,0.08)] space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/50 text-[11px] font-bold text-[#8C2C45]">
                <Scale className="w-3.5 h-3.5" />
                <span>Regulación de Alcance • Triángulo de Hierro (HU-08)</span>
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#5A0F24]">
                Control de Cambios y Adendas Contractuales
              </h1>
              <p className="text-xs md:text-sm text-[#5A0F24]/75">
                Cualquier ampliación al alcance original recalcula proporcionalmente
                los días de entrega y la tarifa justa, requiriendo firma digital de
                ambas partes antes de modificar el contrato base.
              </p>
            </div>

            {activeContract && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-4 py-2.5 rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 block">
                    Versión actual
                  </span>
                  <span className="text-base font-extrabold text-[#5A0F24]">
                    v{versions.length > 0 ? versions[versions.length - 1].versionNumber : 1}
                  </span>
                </div>
              </div>
            )}
          </div>

          {activeContract && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-[#C9B8A6]/40">
              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#C9B8A6]/50">
                <span className="text-[10px] font-bold uppercase text-[#5A0F24]/65 block">
                  Monto Base Actual
                </span>
                <span className="text-base font-extrabold text-[#5A0F24]">
                  {formatMoney(baseMetrics.baseAmount)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#C9B8A6]/50">
                <span className="text-[10px] font-bold uppercase text-[#5A0F24]/65 block">
                  Plazo Total Base
                </span>
                <span className="text-base font-extrabold text-[#5A0F24]">
                  {baseMetrics.baseDays} días
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#C9B8A6]/50">
                <span className="text-[10px] font-bold uppercase text-[#5A0F24]/65 block">
                  Entregables Actuales
                </span>
                <span className="text-base font-extrabold text-[#5A0F24]">
                  {baseMetrics.baseCount} hitos
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-900/70 block">
                  Tarifa Diaria Proporcional
                </span>
                <span className="text-base font-extrabold text-emerald-900">
                  {formatMoney(baseMetrics.dailyRate)} / día
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'request'
                ? 'bg-[#5A0F24] text-white shadow-sm'
                : 'bg-white text-[#5A0F24] border border-[#C9B8A6] hover:bg-[#F3EFE6]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Solicitar Cambio (Triángulo de Hierro)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addenda')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'addenda'
                ? 'bg-[#5A0F24] text-white shadow-sm'
                : 'bg-white text-[#5A0F24] border border-[#C9B8A6] hover:bg-[#F3EFE6]'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Adendas y Doble Firma ({changeRequests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'versions'
                ? 'bg-[#5A0F24] text-white shadow-sm'
                : 'bg-white text-[#5A0F24] border border-[#C9B8A6] hover:bg-[#F3EFE6]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Bitácora Inmutable ({versions.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center text-sm text-[#5A0F24]/70 border border-[#C9B8A6]/50">
            Cargando información del contrato...
          </div>
        ) : !activeContract ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-2 border border-[#C9B8A6]/50">
            <ShieldAlert className="w-8 h-8 text-[#8C2C45] mx-auto" />
            <p className="text-sm font-bold text-[#5A0F24]">
              No se encontró un contrato activo para regular alcance.
            </p>
            <p className="text-xs text-[#5A0F24]/70">
              Formaliza una propuesta en un contrato primero para gestionar adendas.
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: Solicitar Cambio */}
            {activeTab === 'request' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleSubmitChangeRequest}
                  className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 space-y-5"
                >
                  <h2 className="text-base font-extrabold text-[#5A0F24]">
                    Nueva Solicitud de Variación de Requerimientos
                  </h2>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5A0F24]">
                      Título de la Adenda *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Módulo de exportación de reportes PDF"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#C9B8A6] bg-[#FBF9F5] text-sm text-[#5A0F24] focus:outline-none focus:border-[#8C2C45]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5A0F24]">
                      Justificación Técnica / Alcance Solicitado *
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe detalladamente qué cambia o se agrega al alcance original..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#C9B8A6] bg-[#FBF9F5] text-sm text-[#5A0F24] focus:outline-none focus:border-[#8C2C45]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5A0F24]">
                      Factor de Complejidad
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {COMPLEXITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setComplexityFactor(opt.value)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            complexityFactor === opt.value
                              ? 'bg-[#F3EFE6] border-[#8C2C45] text-[#5A0F24]'
                              : 'bg-white border-[#C9B8A6]/60 text-[#5A0F24]/75 hover:bg-[#FBF9F5]'
                          }`}
                        >
                          <span className="text-xs font-extrabold block">
                            {opt.label}
                          </span>
                          <span className="text-[11px] opacity-80">{opt.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#C9B8A6]/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]">
                        Entregables Adicionales ({deliverables.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3EFE6] hover:bg-[#e7ded0] text-xs font-bold text-[#5A0F24] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar entregable</span>
                      </button>
                    </div>

                    {deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#C9B8A6]/60 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#8C2C45]">
                            Entregable adicional #{idx + 1}
                          </span>
                          {deliverables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(idx)}
                              className="text-xs text-red-700 hover:text-red-900 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quitar</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              handleDeliverableChange(idx, 'title', e.target.value)
                            }
                            placeholder="Nombre del entregable *"
                            className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-[#C9B8A6] bg-white text-xs text-[#5A0F24]"
                            required
                          />
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={item.estimatedDays}
                            onChange={(e) =>
                              handleDeliverableChange(
                                idx,
                                'estimatedDays',
                                e.target.value
                              )
                            }
                            placeholder="Días estimados (auto)"
                            className="px-3.5 py-2 rounded-xl border border-[#C9B8A6] bg-white text-xs text-[#5A0F24]"
                          />
                        </div>

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleDeliverableChange(
                              idx,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Criterios de aceptación (opcional)"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#C9B8A6] bg-white text-xs text-[#5A0F24]"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-5 rounded-2xl bg-[#5A0F24] hover:bg-[#8C2C45] disabled:opacity-60 text-white text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    {submitting
                      ? 'Calculando y registrando...'
                      : 'Registrar Solicitud y Firmar Adenda'}
                  </button>
                </form>

                {/* Panel lateral: Vista previa Triángulo de Hierro */}
                <aside className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 space-y-4 h-fit">
                  <div className="flex items-center gap-2 text-[#5A0F24]">
                    <Scale className="w-5 h-5 text-[#8C2C45]" />
                    <h3 className="text-sm font-extrabold">
                      Simulador del Triángulo de Hierro
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong>Protección anti-trabajo gratis:</strong> Todo nuevo
                    entregable calcula automáticamente días adicionales y tarifa
                    proporcional basada en tu contrato.
                  </div>

                  {previewImpact ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#5A0F24]/75">
                            Incremento en Tiempo:
                          </span>
                          <strong className="text-[#5A0F24] inline-flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5 text-[#8C2C45]" />
                            +{previewImpact.suggestedAddedDays} días
                          </strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#5A0F24]/75">
                            Incremento en Costo:
                          </span>
                          <strong className="text-emerald-800 inline-flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            +{formatMoney(previewImpact.suggestedAddedCost)}
                          </strong>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#C9B8A6]/60 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#5A0F24]/70">Nuevo total:</span>
                          <strong className="text-[#5A0F24]">
                            {formatMoney(previewImpact.newTotalAmount)}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5A0F24]/70">Nuevo plazo:</span>
                          <strong className="text-[#5A0F24]">
                            {previewImpact.newTotalDays} días
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5A0F24]/65">
                      Escribe al menos un entregable adicional para ver el cálculo
                      sugerido en días y tarifa proporcional.
                    </p>
                  )}
                </aside>
              </div>
            )}

            {/* TAB 2: Adendas y Doble Firma */}
            {activeTab === 'addenda' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-[#C9B8A6]/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="text-xs text-[#5A0F24]/80">
                    <strong>¿Recibiste un ID de adenda de tu contraparte?</strong>{' '}
                    Pégalo aquí para registrar tu firma digital:
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualChangeRequestId}
                      onChange={(e) => setManualChangeRequestId(e.target.value)}
                      placeholder="UUID de la adenda"
                      className="px-3 py-2 rounded-xl border border-[#C9B8A6] bg-[#FBF9F5] text-xs text-[#5A0F24]"
                    />
                    <button
                      type="button"
                      disabled={!manualChangeRequestId.trim() || Boolean(signingId)}
                      onClick={() => handleApprove(manualChangeRequestId.trim())}
                      className="px-4 py-2 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                    >
                      Firmar Adenda
                    </button>
                  </div>
                </div>

                {changeRequests.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-[#C9B8A6]/50 text-sm text-[#5A0F24]/70">
                    No hay solicitudes de cambio registradas en esta sesión para este
                    contrato.
                  </div>
                ) : (
                  changeRequests.map((cr) => (
                    <div
                      key={cr.id}
                      className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                                cr.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : cr.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {cr.status}
                            </span>
                            <span className="text-[11px] font-mono text-[#5A0F24]/60">
                              ID: {cr.id}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-[#5A0F24]">
                            {cr.title}
                          </h3>
                          <p className="text-xs text-[#5A0F24]/75">
                            {cr.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#5A0F24]/70 block">
                            Impacto aprobado / sugerido
                          </span>
                          <span className="text-sm font-extrabold text-[#5A0F24]">
                            +{cr.suggestedAddedDays} días • +
                            {formatMoney(cr.suggestedAddedCost)}
                          </span>
                        </div>
                      </div>

                      {/* Estado de doble firma */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={`p-3 rounded-2xl border text-xs ${
                            cr.clientApproved
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-[#FBF9F5] border-[#C9B8A6]/60 text-[#5A0F24]/75'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            {cr.clientApproved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span>
                              Firma Cliente:{' '}
                              {cr.clientApproved ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                          {cr.clientSignature && (
                            <span className="text-[10px] font-mono block mt-1 truncate">
                              SHA256: {cr.clientSignature}
                            </span>
                          )}
                        </div>

                        <div
                          className={`p-3 rounded-2xl border text-xs ${
                            cr.freelancerApproved
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-[#FBF9F5] border-[#C9B8A6]/60 text-[#5A0F24]/75'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            {cr.freelancerApproved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span>
                              Firma Freelancer:{' '}
                              {cr.freelancerApproved ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                          {cr.freelancerSignature && (
                            <span className="text-[10px] font-mono block mt-1 truncate">
                              SHA256: {cr.freelancerSignature}
                            </span>
                          )}
                        </div>
                      </div>

                      {cr.status === 'PENDING' && (
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          <button
                            type="button"
                            disabled={signingId === cr.id}
                            onClick={() => handleApprove(cr.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              {signingId === cr.id
                                ? 'Procesando...'
                                : `Firmar como ${user?.role || 'Participante'}`}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={signingId === cr.id}
                            onClick={() => handleReject(cr.id)}
                            className="px-4 py-2 rounded-xl bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Rechazar Adenda</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Bitácora Inmutable de Versiones */}
            {activeTab === 'versions' && (
              <div className="space-y-4">
                {versions.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-[#C9B8A6]/50 text-sm text-[#5A0F24]/70">
                    La bitácora inmutable se inicializará automáticamente al registrar
                    la primera solicitud de cambio.
                  </div>
                ) : (
                  versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-full bg-[#5A0F24] text-white text-xs font-extrabold">
                            Versión {ver.versionNumber}
                          </span>
                          <span className="text-sm font-bold text-[#5A0F24]">
                            {ver.reason}
                          </span>
                        </div>
                        <span className="text-xs text-[#5A0F24]/65">
                          {new Date(ver.createdAt).toLocaleString('es-MX')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-[#5A0F24]/80">
                        <span>
                          Total: <strong>{formatMoney(ver.totalAmount)}</strong>
                        </span>
                        <span>
                          Plazo total: <strong>{ver.totalDays} días</strong>
                        </span>
                        <span>
                          Hitos en snapshot:{' '}
                          <strong>{ver.snapshot?.milestones?.length ?? 0}</strong>
                        </span>
                      </div>

                      {Array.isArray(ver.snapshot?.milestones) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                          {ver.snapshot.milestones.map((ms) => (
                            <div
                              key={ms.id}
                              className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#C9B8A6]/50 flex items-center justify-between text-xs"
                            >
                              <span className="font-semibold text-[#5A0F24] truncate pr-2">
                                #{ms.order} {ms.title}
                              </span>
                              <span className="font-bold text-[#8C2C45] shrink-0">
                                {formatMoney(ms.amount)} • {ms.deliveryDays}d
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
