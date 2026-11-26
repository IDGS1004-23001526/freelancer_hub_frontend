import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  FileText,
  DollarSign,
  Clock,
  Link2,
  Plus,
  Trash2,
  Layers,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { proposalApi } from '../../../api/proposal.api.js';

const MAX_PORTFOLIO_URLS = 3;

const INITIAL_MILESTONE = () => ({
  title: '',
  amount: '',
  deliveryDays: '',
});

function isValidHttpUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatMXN(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export default function SubmitProposalModal({
  isOpen,
  project,
  onClose,
  onSuccess,
  onAlreadyApplied,
}) {
  const [coverLetter, setCoverLetter] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState(['']);
  const [milestones, setMilestones] = useState([INITIAL_MILESTONE()]);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCoverLetter('');
    setTotalPrice('');
    setEstimatedDays('');
    setPortfolioUrls(['']);
    setMilestones([INITIAL_MILESTONE()]);
    setTouched({});
    setIsSubmitting(false);
    setSubmitError(null);
  }, [isOpen, project?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const maxBudget = Number(project?.budget) || 0;
  const parsedTotalPrice = Number(totalPrice);
  const parsedEstimatedDays = Number(estimatedDays);

  const milestonesSum = useMemo(
    () =>
      milestones.reduce((acc, m) => {
        const val = Number(m.amount);
        return acc + (Number.isFinite(val) && val > 0 ? val : 0);
      }, 0),
    [milestones]
  );

  const milestonesDaysSum = useMemo(
    () =>
      milestones.reduce((acc, m) => {
        const val = Number(m.deliveryDays);
        return acc + (Number.isInteger(val) && val > 0 ? val : 0);
      }, 0),
    [milestones]
  );

  const validation = useMemo(() => {
    const errors = {};
    const trimmedCover = coverLetter.trim();

    if (!trimmedCover) {
      errors.coverLetter = 'La carta de propuesta es obligatoria.';
    } else if (trimmedCover.length < 20) {
      errors.coverLetter = `Mínimo 20 caracteres (${trimmedCover.length}/20).`;
    } else if (trimmedCover.length > 5000) {
      errors.coverLetter = 'No puede superar los 5000 caracteres.';
    }

    if (totalPrice === '' || !Number.isFinite(parsedTotalPrice) || parsedTotalPrice <= 0) {
      errors.totalPrice = 'Ingresa un monto ofertado mayor a $0 MXN.';
    } else if (maxBudget > 0 && parsedTotalPrice > maxBudget) {
      errors.totalPrice = `El monto ofertado (${formatMXN(parsedTotalPrice)} MXN) no puede exceder el presupuesto del cliente (${formatMXN(maxBudget)}).`;
    }

    if (
      estimatedDays === '' ||
      !Number.isInteger(parsedEstimatedDays) ||
      parsedEstimatedDays <= 0
    ) {
      errors.estimatedDays = 'Ingresa un plazo entero mayor a 0 días naturales.';
    } else if (parsedEstimatedDays > 365) {
      errors.estimatedDays = 'El plazo máximo permitido es de 365 días naturales.';
    }

    const urlErrors = portfolioUrls.map((url) =>
      isValidHttpUrl(url) ? null : 'Ingresa una URL válida (ej. https://github.com/usuario/proyecto).'
    );
    if (urlErrors.some(Boolean)) {
      errors.portfolioUrls = urlErrors;
    }

    const milestoneErrors = milestones.map((m) => {
      const mErr = {};
      const titleTrimmed = m.title.trim();
      const amountVal = Number(m.amount);
      const daysVal = Number(m.deliveryDays);

      if (!titleTrimmed) {
        mErr.title = 'El título del hito es obligatorio.';
      } else if (titleTrimmed.length < 5) {
        mErr.title = 'Mínimo 5 caracteres.';
      } else if (titleTrimmed.length > 150) {
        mErr.title = 'Máximo 150 caracteres.';
      }

      if (m.amount === '' || !Number.isFinite(amountVal) || amountVal <= 0) {
        mErr.amount = 'Monto mayor a 0.';
      }

      if (m.deliveryDays === '' || !Number.isInteger(daysVal) || daysVal <= 0) {
        mErr.deliveryDays = 'Días enteros > 0.';
      } else if (daysVal > 365) {
        mErr.deliveryDays = 'Máximo 365 días.';
      }

      return mErr;
    });

    if (milestoneErrors.some((mErr) => Object.keys(mErr).length > 0)) {
      errors.milestones = milestoneErrors;
    }

    const priceDifference = parsedTotalPrice - milestonesSum;
    const isMathAligned =
      Number.isFinite(parsedTotalPrice) &&
      parsedTotalPrice > 0 &&
      Math.abs(priceDifference) <= 0.01;

    if (
      !errors.totalPrice &&
      milestones.length > 0 &&
      milestonesSum > 0 &&
      !isMathAligned
    ) {
      errors.milestonesMatch = `La suma de los hitos (${formatMXN(milestonesSum)} MXN) debe ser igual al monto total ofertado (${formatMXN(parsedTotalPrice)} MXN).`;
    } else if (!errors.totalPrice && milestonesSum <= 0) {
      errors.milestonesMatch = 'Asigna el costo parcial a tus hitos para cuadrar el monto total.';
    }

    return {
      errors,
      isMathAligned,
      priceDifference,
      isValid: Object.keys(errors).length === 0,
    };
  }, [
    coverLetter,
    totalPrice,
    parsedTotalPrice,
    maxBudget,
    estimatedDays,
    parsedEstimatedDays,
    portfolioUrls,
    milestones,
    milestonesSum,
  ]);

  if (!isOpen || !project) return null;

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePortfolioUrlChange = (index, value) => {
    setPortfolioUrls((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleAddPortfolioUrl = () => {
    if (portfolioUrls.length >= MAX_PORTFOLIO_URLS) return;
    setPortfolioUrls((prev) => [...prev, '']);
  };

  const handleRemovePortfolioUrl = (index) => {
    if (portfolioUrls.length === 1) {
      setPortfolioUrls(['']);
      return;
    }
    setPortfolioUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    setMilestones((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMilestone = () => {
    setMilestones((prev) => [...prev, INITIAL_MILESTONE()]);
  };

  const handleRemoveMilestone = (index) => {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSyncTotalToMilestones = () => {
    if (milestonesSum <= 0) return;
    setTotalPrice(String(Number(milestonesSum.toFixed(2))));
    markTouched('totalPrice');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setTouched({
      coverLetter: true,
      totalPrice: true,
      estimatedDays: true,
      portfolioUrls: true,
      milestones: true,
    });

    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      projectId: project.id,
      coverLetter: coverLetter.trim(),
      totalPrice: Number(parsedTotalPrice.toFixed(2)),
      estimatedDays: parsedEstimatedDays,
      portfolioUrls: portfolioUrls.map((u) => u.trim()).filter(Boolean).slice(0, 3),
      milestones: milestones.map((m, idx) => ({
        title: m.title.trim(),
        amount: Number(Number(m.amount).toFixed(2)),
        deliveryDays: Number(m.deliveryDays),
        order: idx + 1,
      })),
    };

    const result = await proposalApi.submitProposal(payload, project.skills || []);
    setIsSubmitting(false);

    if (result.success && result.data) {
      onSuccess?.(result.data);
      onClose?.();
      return;
    }

    if (result.alreadyApplied) {
      onAlreadyApplied?.(result.error);
      onClose?.();
      return;
    }

    setSubmitError(result.error || 'Ocurrió un error al enviar tu propuesta.');
  };

  const isExceedingBudget =
    totalPrice !== '' && Number.isFinite(parsedTotalPrice) && maxBudget > 0 && parsedTotalPrice > maxBudget;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-proposal-modal-title"
      data-testid="submit-proposal-modal"
      className="fixed inset-0 z-50 bg-[#2b1b1e]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose?.();
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#C9B8A6]/70 shadow-[0_25px_65px_-15px_rgba(90,15,36,0.35)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#5A0F24] via-[#8C2C45] to-[#5A0F24] text-[#F3EFE6] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-[#C68A8F]" />
              <span>Propuesta formal protegida por Escrow</span>
            </div>
            <h2
              id="submit-proposal-modal-title"
              className="text-lg sm:text-xl font-extrabold tracking-tight"
            >
              Postular Propuesta Económica
            </h2>
            <p className="text-xs text-[#F3EFE6]/85 truncate">
              Convocatoria: <strong>{project.title}</strong> • Presupuesto del cliente:{' '}
              <strong>{formatMXN(maxBudget)} {project.currency || 'MXN'}</strong>
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Cerrar modal de propuesta"
            data-testid="btn-close-proposal-modal"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Formulario con Scroll */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-6">
          {submitError && (
            <div
              role="alert"
              data-testid="proposal-submit-error"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-[#8C2C45] shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 1. Carta de Propuesta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="proposal-cover-letter"
                className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Carta de propuesta (enfoque técnico y experiencia) *</span>
              </label>
              <span
                className={`text-[11px] font-bold ${
                  coverLetter.trim().length >= 20 ? 'text-emerald-700' : 'text-[#5A0F24]/60'
                }`}
              >
                {coverLetter.trim().length} / 5000 caracteres
              </span>
            </div>

            <textarea
              id="proposal-cover-letter"
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              onBlur={() => markTouched('coverLetter')}
              data-testid="input-cover-letter"
              placeholder="Describe cómo abordarás técnicamente la convocatoria, la arquitectura o herramientas que usarás y tu experiencia en proyectos similares..."
              className={`w-full p-3.5 rounded-2xl bg-[#f6f2ee]/60 border text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                touched.coverLetter && validation.errors.coverLetter
                  ? 'border-[#8C2C45] focus:ring-[#8C2C45]/20'
                  : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
              }`}
            />

            {touched.coverLetter && validation.errors.coverLetter && (
              <p
                data-testid="error-cover-letter"
                className="text-[11px] font-bold text-[#8C2C45] flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.errors.coverLetter}</span>
              </p>
            )}
          </div>

          {/* 2. Monto Total Ofertado en MXN y Plazo en Días Naturales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monto total en MXN */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="proposal-total-price"
                  className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span>Monto total ofertado (MXN) *</span>
                </label>
                <span className="text-[10px] font-bold text-[#5A0F24]/65">
                  Máx: {formatMXN(maxBudget)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#5A0F24]/70">
                  $
                </span>
                <input
                  id="proposal-total-price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  onBlur={() => markTouched('totalPrice')}
                  data-testid="input-total-price"
                  placeholder="Ej. 3500"
                  className={`w-full pl-7 pr-14 py-2.5 rounded-xl bg-[#f6f2ee]/60 border text-sm font-bold text-[#5A0F24] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    (touched.totalPrice || isExceedingBudget) && validation.errors.totalPrice
                      ? 'border-[#8C2C45] bg-red-50/40 focus:ring-[#8C2C45]/25'
                      : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-[#8C2C45]">
                  MXN
                </span>
              </div>

              {(touched.totalPrice || isExceedingBudget) && validation.errors.totalPrice && (
                <p
                  data-testid="error-total-price"
                  className="text-[11px] font-bold text-[#8C2C45] flex items-start gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{validation.errors.totalPrice}</span>
                </p>
              )}
            </div>

            {/* Plazo de entrega en días naturales */}
            <div className="space-y-1.5">
              <label
                htmlFor="proposal-estimated-days"
                className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Plazo de entrega (días naturales) *</span>
              </label>

              <div className="relative">
                <input
                  id="proposal-estimated-days"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  onBlur={() => markTouched('estimatedDays')}
                  data-testid="input-estimated-days"
                  placeholder="Ej. 21"
                  className={`w-full pl-3.5 pr-24 py-2.5 rounded-xl bg-[#f6f2ee]/60 border text-sm font-bold text-[#5A0F24] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    touched.estimatedDays && validation.errors.estimatedDays
                      ? 'border-[#8C2C45] focus:ring-[#8C2C45]/25'
                      : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#5A0F24]/60">
                  días naturales
                </span>
              </div>

              {touched.estimatedDays && validation.errors.estimatedDays && (
                <p
                  data-testid="error-estimated-days"
                  className="text-[11px] font-bold text-[#8C2C45] flex items-start gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{validation.errors.estimatedDays}</span>
                </p>
              )}
            </div>
          </div>

          {/* 3. Hasta 3 URLs de Proyectos Previos en Portafolio */}
          <div className="p-4 rounded-2xl bg-[#F3EFE6]/55 border border-[#C9B8A6]/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span>Portafolio de proyectos previos (hasta {MAX_PORTFOLIO_URLS} URLs)</span>
                </h3>
                <p className="text-[11px] text-[#5A0F24]/70">
                  Comparte enlaces a repositorios, demos o casos de estudio relevantes.
                </p>
              </div>

              <button
                type="button"
                disabled={portfolioUrls.length >= MAX_PORTFOLIO_URLS}
                onClick={handleAddPortfolioUrl}
                data-testid="btn-add-portfolio-url"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EFE6] disabled:opacity-45 disabled:cursor-not-allowed border border-[#C9B8A6] text-[11px] font-bold text-[#5A0F24] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Agregar URL ({portfolioUrls.length}/{MAX_PORTFOLIO_URLS})</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {portfolioUrls.map((url, idx) => {
                const urlErr = validation.errors.portfolioUrls?.[idx];
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handlePortfolioUrlChange(idx, e.target.value)}
                        onBlur={() => markTouched('portfolioUrls')}
                        data-testid={`input-portfolio-url-${idx}`}
                        placeholder={`https://github.com/tu-usuario/proyecto-${idx + 1}`}
                        className={`flex-1 px-3.5 py-2 rounded-xl bg-white border text-xs text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none focus:ring-2 transition-all ${
                          urlErr
                            ? 'border-[#8C2C45] focus:ring-[#8C2C45]/20'
                            : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
                        }`}
                      />
                      {(portfolioUrls.length > 1 || url.trim() !== '') && (
                        <button
                          type="button"
                          onClick={() => handleRemovePortfolioUrl(idx)}
                          aria-label={`Eliminar URL ${idx + 1}`}
                          className="p-2 rounded-xl bg-white hover:bg-red-50 text-[#8C2C45] border border-[#C9B8A6]/60 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {urlErr && (
                      <p
                        data-testid={`error-portfolio-url-${idx}`}
                        className="text-[11px] font-bold text-[#8C2C45]"
                      >
                        {urlErr}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Desglose de Hitos Cotizados */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#f6f2ee]/80 border border-[#C9B8A6]/70 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span>Desglose de hitos cotizados ({milestones.length}) *</span>
                </h3>
                <p className="text-[11px] text-[#5A0F24]/70">
                  Define los entregables parciales con su título, costo parcial en MXN y días estimados.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMilestone}
                data-testid="btn-add-milestone"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar hito</span>
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((milestone, idx) => {
                const mErr = validation.errors.milestones?.[idx] || {};
                const showErrs = Boolean(touched.milestones);
                return (
                  <div
                    key={idx}
                    data-testid={`milestone-row-${idx}`}
                    className="p-3.5 rounded-2xl bg-white border border-[#C9B8A6]/60 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#8C2C45] uppercase tracking-wider">
                        <span className="w-5 h-5 rounded-lg bg-[#5A0F24] text-white text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>Hito #{idx + 1}</span>
                      </span>

                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          aria-label={`Eliminar hito ${idx + 1}`}
                          data-testid={`btn-remove-milestone-${idx}`}
                          className="text-[11px] font-bold text-red-700 hover:text-red-900 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Título del hito */}
                      <div className="md:col-span-6 space-y-1">
                        <label
                          htmlFor={`milestone-title-${idx}`}
                          className="text-[11px] font-bold text-[#5A0F24]/80 block"
                        >
                          Título del entregable *
                        </label>
                        <input
                          id={`milestone-title-${idx}`}
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                          onBlur={() => markTouched('milestones')}
                          data-testid={`input-milestone-title-${idx}`}
                          placeholder="Ej. Arquitectura base y API REST"
                          className={`w-full px-3 py-2 rounded-xl bg-[#f6f2ee]/50 border text-xs text-[#2b1b1e] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 ${
                            showErrs && mErr.title
                              ? 'border-[#8C2C45] focus:ring-[#8C2C45]/20'
                              : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
                          }`}
                        />
                        {showErrs && mErr.title && (
                          <p className="text-[10px] font-bold text-[#8C2C45]">{mErr.title}</p>
                        )}
                      </div>

                      {/* Costo parcial */}
                      <div className="md:col-span-3 space-y-1">
                        <label
                          htmlFor={`milestone-amount-${idx}`}
                          className="text-[11px] font-bold text-[#5A0F24]/80 block"
                        >
                          Costo parcial (MXN) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A0F24]/65">
                            $
                          </span>
                          <input
                            id={`milestone-amount-${idx}`}
                            type="number"
                            min="1"
                            step="0.01"
                            value={milestone.amount}
                            onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                            onBlur={() => markTouched('milestones')}
                            data-testid={`input-milestone-amount-${idx}`}
                            placeholder="1500"
                            className={`w-full pl-6 pr-3 py-2 rounded-xl bg-[#f6f2ee]/50 border text-xs font-bold text-[#5A0F24] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 ${
                              showErrs && mErr.amount
                                ? 'border-[#8C2C45] focus:ring-[#8C2C45]/20'
                                : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
                            }`}
                          />
                        </div>
                        {showErrs && mErr.amount && (
                          <p className="text-[10px] font-bold text-[#8C2C45]">{mErr.amount}</p>
                        )}
                      </div>

                      {/* Días del hito */}
                      <div className="md:col-span-3 space-y-1">
                        <label
                          htmlFor={`milestone-days-${idx}`}
                          className="text-[11px] font-bold text-[#5A0F24]/80 block"
                        >
                          Días estimados *
                        </label>
                        <input
                          id={`milestone-days-${idx}`}
                          type="number"
                          min="1"
                          max="365"
                          step="1"
                          value={milestone.deliveryDays}
                          onChange={(e) =>
                            handleMilestoneChange(idx, 'deliveryDays', e.target.value)
                          }
                          onBlur={() => markTouched('milestones')}
                          data-testid={`input-milestone-days-${idx}`}
                          placeholder="7"
                          className={`w-full px-3 py-2 rounded-xl bg-[#f6f2ee]/50 border text-xs font-bold text-[#5A0F24] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 ${
                            showErrs && mErr.deliveryDays
                              ? 'border-[#8C2C45] focus:ring-[#8C2C45]/20'
                              : 'border-[#C9B8A6]/70 focus:border-[#8C2C45] focus:ring-[#8C2C45]/15'
                          }`}
                        />
                        {showErrs && mErr.deliveryDays && (
                          <p className="text-[10px] font-bold text-[#8C2C45]">{mErr.deliveryDays}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Balance de Hitos vs Monto Total */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                validation.isMathAligned
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-[#F3EFE6] border-[#C9B8A6] text-[#5A0F24]'
              }`}
            >
              <div className="flex items-start gap-2.5 text-xs">
                {validation.isMathAligned ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#8C2C45] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-extrabold">
                    Suma de hitos: {formatMXN(milestonesSum)} MXN{' '}
                    <span className="font-semibold opacity-75">
                      ({milestonesDaysSum} días acumulados)
                    </span>
                  </p>
                  <p className="text-[11px] opacity-85">
                    {validation.isMathAligned
                      ? 'El desglose de hitos cuadra exactamente con tu monto total ofertado.'
                      : validation.errors.milestonesMatch ||
                        'La suma de los costos parciales debe coincidir con el monto total ofertado.'}
                  </p>
                </div>
              </div>

              {!validation.isMathAligned &&
                milestonesSum > 0 &&
                (maxBudget <= 0 || milestonesSum <= maxBudget) && (
                  <button
                    type="button"
                    onClick={handleSyncTotalToMilestones}
                    data-testid="btn-sync-total-price"
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#5A0F24] text-[#5A0F24] hover:text-white border border-[#C9B8A6] text-[11px] font-extrabold transition-colors shrink-0 cursor-pointer"
                  >
                    Igualar total a {formatMXN(milestonesSum)}
                  </button>
                )}
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-[#C9B8A6]/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] disabled:opacity-50 text-[#5A0F24] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !validation.isValid}
              data-testid="btn-submit-proposal"
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all inline-flex items-center justify-center gap-2 ${
                isSubmitting || !validation.isValid
                  ? 'bg-[#C9B8A6]/60 text-[#5A0F24]/50 cursor-not-allowed'
                  : 'bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-[0_8px_20px_-4px_rgba(140,44,69,0.4)] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando propuesta...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Propuesta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
