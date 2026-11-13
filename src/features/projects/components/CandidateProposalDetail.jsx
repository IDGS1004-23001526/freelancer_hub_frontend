import React from 'react';
import {
  Star,
  Clock,
  CheckCircle2,
  Briefcase,
  MessageSquare,
  Layers,
  MapPin,
  FileText,
  Sparkles,
  ExternalLink,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  XCircle,
  RotateCcw,
  Award,
  Hash,
  DollarSign,
} from 'lucide-react';

export default function CandidateProposalDetail({
  candidate,
  allCandidates = [],
  onSelectCandidate,
  projectBudget,
  projectTitle,
  formatMoney,
  onViewPortfolio,
  onStartChat,
  onAcceptProposal,
  onToggleRejectProposal,
  isAccepting,
  hasAcceptedProposal,
  onCloseDetail,
}) {
  if (!candidate) return null;

  const score = candidate.mcda?.totalScore ?? 85;
  const isAccepted = candidate.status === 'ACCEPTED';
  const isRejected = candidate.status === 'REJECTED';
  const withinBudget =
    !projectBudget || candidate.totalPrice <= projectBudget;
  const budgetDifference = projectBudget
    ? projectBudget - candidate.totalPrice
    : 0;

  const currentIndex = allCandidates.findIndex((c) => c.id === candidate.id);
  const prevCandidate =
    currentIndex > 0 ? allCandidates[currentIndex - 1] : null;
  const nextCandidate =
    currentIndex >= 0 && currentIndex < allCandidates.length - 1
      ? allCandidates[currentIndex + 1]
      : null;

  const formattedDate = new Date(candidate.createdAt).toLocaleDateString(
    'es-MX',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <div
      data-testid={`candidate-detail-panel-${candidate.id}`}
      className="space-y-5 animate-fade-in"
    >
      {/* Barra superior de navegación: Volver a la vista general + Selector rápido entre postulaciones */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#C9B8A6]/60 shadow-[0_10px_30px_-15px_rgba(90,15,36,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {onCloseDetail && (
            <button
              type="button"
              onClick={onCloseDetail}
              data-testid="btn-back-to-proposals-overview"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-[#F3EFE6] text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#C68A8F]" />
              <span>Volver a la vista general de postulaciones</span>
            </button>
          )}

          <div className="text-xs text-[#5A0F24]/75 font-semibold flex items-center gap-1.5">
            <span>Vista General</span>
            <span>/</span>
            <span className="font-extrabold text-[#5A0F24]">
              Postulación de {candidate.freelancerName}
            </span>
          </div>
        </div>

        {allCandidates.length > 1 && onSelectCandidate && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-bold text-[#5A0F24]/70 mr-1">
              Postulación {currentIndex + 1} de {allCandidates.length}
            </span>
            <button
              type="button"
              disabled={!prevCandidate}
              onClick={() => prevCandidate && onSelectCandidate(prevCandidate.id)}
              className="p-2 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] disabled:opacity-40 disabled:cursor-not-allowed text-[#5A0F24] transition-colors cursor-pointer"
              title="Postulación anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!nextCandidate}
              onClick={() => nextCandidate && onSelectCandidate(nextCandidate.id)}
              className="p-2 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] disabled:opacity-40 disabled:cursor-not-allowed text-[#5A0F24] transition-colors cursor-pointer"
              title="Siguiente postulación"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contenedor principal con todos los datos y acciones de la postulación */}
      <div className="bg-white rounded-3xl border-2 border-[#8C2C45] ring-4 ring-[#8C2C45]/15 shadow-[0_22px_55px_-12px_rgba(90,15,36,0.22)] overflow-hidden">
        {/* Franja superior iluminada con metadatos de la postulación */}
        <div className="bg-gradient-to-r from-[#5A0F24] via-[#8C2C45] to-[#5A0F24] px-6 py-4 text-[#F3EFE6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#C68A8F]" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Expediente Completo de la Postulación
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold">
              <Hash className="w-3 h-3 text-[#C68A8F]" />
              <span>ID: {candidate.id}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-[#F3EFE6]/90 flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#C68A8F]" />
              <span>Recibida el {formattedDate}</span>
            </span>

            {isAccepted ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wide">
                Estado: Aceptada
              </span>
            ) : isRejected ? (
              <span className="px-3 py-1 rounded-full bg-stone-700 text-white text-[11px] font-extrabold uppercase tracking-wide">
                Estado: Descartada
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-100 text-[11px] font-extrabold uppercase tracking-wide">
                Estado: En evaluación
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Cabecera completa del candidato + Barra de acciones principales */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#C9B8A6]/45">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5A0F24] to-[#8C2C45] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md ring-4 ring-[#8C2C45]/20">
                {candidate.avatarInitials}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl md:text-2xl font-extrabold text-[#5A0F24]">
                    {candidate.freelancerName}
                  </h3>
                  {isAccepted && (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Propuesta Aceptada</span>
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-stone-200 text-stone-700 text-xs font-extrabold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Postulación Descartada</span>
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-sm font-bold text-[#8C2C45]">
                  {candidate.freelancerRole}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#5A0F24]/80">
                  <span className="inline-flex items-center gap-1 font-extrabold text-[#5A0F24] bg-[#F3EFE6] px-2.5 py-1 rounded-lg border border-[#C9B8A6]/50">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {candidate.reputation.toFixed(1)} ({candidate.reviewsCount}{' '}
                    reseñas verificadas)
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#5A0F24] bg-[#F3EFE6] px-2.5 py-1 rounded-lg border border-[#C9B8A6]/50">
                    <Award className="w-3.5 h-3.5 text-[#8C2C45]" />
                    {candidate.completedProjects} proyectos completados
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#5A0F24]/80">
                    <MapPin className="w-3.5 h-3.5 text-[#8C2C45]" />
                    {candidate.freelancerLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas en la cabecera */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onViewPortfolio(candidate)}
                data-testid={`btn-header-portfolio-${candidate.id}`}
                className="py-2.5 px-4 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] text-xs font-bold border border-[#C9B8A6]/60 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-[#8C2C45]" />
                <span>Ver Portafolio</span>
              </button>

              <button
                type="button"
                onClick={() => onStartChat(candidate)}
                data-testid={`btn-header-chat-${candidate.id}`}
                className="py-2.5 px-4 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] text-xs font-bold border border-[#C9B8A6]/60 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#8C2C45]" />
                <span>Contactar / Chat</span>
              </button>

              <button
                type="button"
                disabled={isAccepted || isAccepting || hasAcceptedProposal || isRejected}
                onClick={() => onAcceptProposal(candidate)}
                className={`py-2.5 px-5 rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-2 ${
                  isAccepted
                    ? 'bg-emerald-600 text-white cursor-default'
                    : hasAcceptedProposal || isRejected
                      ? 'bg-[#C9B8A6]/40 text-[#5A0F24]/50 cursor-not-allowed'
                      : 'bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-md cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isAccepted
                    ? 'Contrato Generado'
                    : isAccepting
                      ? 'Generando...'
                      : 'Aceptar Propuesta'}
                </span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Datos Clave de la Postulación (4 indicadores completos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#F3EFE6]/80 border border-[#C9B8A6]/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Oferta Económica Total</span>
              </span>
              <span className="text-xl font-extrabold text-[#5A0F24] block">
                {formatMoney(candidate.totalPrice, candidate.currency)}{' '}
                <span className="text-xs font-bold text-[#5A0F24]/70">
                  {candidate.currency}
                </span>
              </span>
              <span
                className={`text-[11px] font-bold block ${
                  withinBudget ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {withinBudget
                  ? budgetDifference > 0
                    ? `Ahorro de ${formatMoney(budgetDifference, candidate.currency)} vs. presupuesto`
                    : 'Exactamente en el presupuesto'
                  : `Excede por ${formatMoney(Math.abs(budgetDifference), candidate.currency)}`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6]/80 border border-[#C9B8A6]/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Tiempo de Ejecución</span>
              </span>
              <span className="text-xl font-extrabold text-[#5A0F24] block">
                {candidate.estimatedDays} días naturales
              </span>
              <span className="text-[11px] font-semibold text-[#5A0F24]/75 block">
                Dividido en {candidate.milestones.length} hitos verificables
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFE6]/80 border border-[#C9B8A6]/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/65 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Índice de Compatibilidad</span>
              </span>
              <span className="text-xl font-extrabold text-[#8C2C45] block">
                {score}% de afinidad
              </span>
              <span className="text-[11px] font-semibold text-[#5A0F24]/75 block">
                {candidate.mcda?.matchedSkills?.length || candidate.skills.length}{' '}
                habilidades clave validadas
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/70 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Modalidad de Pago</span>
              </span>
              <span className="text-base font-extrabold text-emerald-950 block">
                Custodia Escrow 100%
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 block">
                Liberación por entregable aprobado
              </span>
            </div>
          </div>

          {/* Contenido detallado en 2 columnas: Propuesta, Evaluación y Habilidades (Izq) + Cronograma de Hitos y Portafolio (Der) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna izquierda */}
            <div className="lg:col-span-6 space-y-6">
              {/* Carta de presentación y propuesta técnica */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8C2C45]" />
                  <span>Carta de presentación y propuesta técnica</span>
                </h4>
                <div className="p-5 rounded-2xl bg-[#f6f2ee] border border-[#e8deda] space-y-2">
                  {projectTitle && (
                    <p className="text-[11px] font-bold text-[#8C2C45]">
                      Postulación para: {projectTitle}
                    </p>
                  )}
                  <p className="text-xs md:text-sm text-[#5A0F24]/90 leading-relaxed">
                    “{candidate.coverLetter}”
                  </p>
                </div>
              </div>

              {/* Desglose completo de compatibilidad MCDA */}
              {candidate.mcda && (
                <div className="p-5 rounded-2xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]">
                      Evaluación detallada de criterios (MCDA)
                    </span>
                    <span className="text-sm font-extrabold text-[#8C2C45]">
                      Puntaje global: {score}%
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      {
                        label: 'Dominio de habilidades requeridas',
                        val: candidate.mcda.skillsScore,
                      },
                      {
                        label: 'Competitividad de tarifa vs. presupuesto',
                        val: candidate.mcda.budgetScore,
                      },
                      {
                        label: 'Velocidad y plazo de entrega propuesto',
                        val: candidate.mcda.timelineScore,
                      },
                      {
                        label: 'Reputación e historial de entregas',
                        val: candidate.mcda.reputationScore,
                      },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#5A0F24]/85">
                            {item.label}
                          </span>
                          <strong className="text-[#5A0F24]">{item.val}%</strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#C9B8A6]/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#8C2C45] transition-all duration-300"
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Todas las habilidades técnicas del candidato */}
                  <div className="pt-3 border-t border-[#C9B8A6]/40 space-y-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A0F24] block">
                      Habilidades técnicas del especialista ({candidate.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map((skill) => {
                        const isMatched =
                          candidate.mcda?.matchedSkills?.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1 ${
                              isMatched
                                ? 'bg-[#5A0F24] text-[#F3EFE6]'
                                : 'bg-white text-[#5A0F24] border border-[#C9B8A6]'
                            }`}
                          >
                            {isMatched && (
                              <CheckCircle2 className="w-3 h-3 text-[#C68A8F]" />
                            )}
                            <span>{skill}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Portafolio de proyectos relacionados */}
              {candidate.portfolio?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#8C2C45]" />
                      <span>
                        Casos de estudio y portafolio ({candidate.portfolio.length})
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => onViewPortfolio(candidate)}
                      className="text-[11px] font-bold text-[#8C2C45] hover:text-[#5A0F24] underline cursor-pointer"
                    >
                      Ampliar portafolio →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {candidate.portfolio.map((pf) => (
                      <div
                        key={pf.id}
                        className="p-4 rounded-2xl bg-[#f6f2ee] border border-[#e8deda] flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-extrabold text-[#5A0F24]">
                              {pf.title}
                            </p>
                            <span className="px-2 py-0.5 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 text-[10px] font-bold text-[#8C2C45]">
                              {pf.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A0F24]/80 leading-relaxed">
                            {pf.summary}
                          </p>
                          {pf.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {pf.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 rounded-md bg-white border border-[#C9B8A6]/50 text-[10px] font-semibold text-[#5A0F24]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <a
                          href={pf.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white hover:bg-[#5A0F24] text-[#5A0F24] hover:text-white border border-[#C9B8A6] transition-colors shrink-0"
                          title="Abrir enlace del proyecto"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha: Plan de Hitos y Entregables */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8C2C45]" />
                  <span>
                    Cronograma de hitos y pagos propuestos ({candidate.milestones.length})
                  </span>
                </h4>
                <span className="text-xs font-extrabold text-[#8C2C45]">
                  Total: {formatMoney(candidate.totalPrice, candidate.currency)}
                </span>
              </div>

              <div className="space-y-3">
                {candidate.milestones.map((ms) => {
                  const pct =
                    candidate.totalPrice > 0
                      ? Math.round((ms.amount / candidate.totalPrice) * 100)
                      : 0;
                  return (
                    <div
                      key={ms.id}
                      className="p-4 rounded-2xl bg-[#F3EFE6]/65 border border-[#C9B8A6]/60 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-[#5A0F24] text-[#F3EFE6] text-xs font-extrabold flex items-center justify-center shrink-0">
                            {ms.order}
                          </span>
                          <div>
                            <h5 className="text-xs md:text-sm font-extrabold text-[#5A0F24]">
                              {ms.title}
                            </h5>
                            <span className="text-[10px] font-bold text-[#8C2C45]">
                              Hito #{ms.order} • {pct}% del presupuesto cotizado
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-[#5A0F24] bg-white px-3 py-1 rounded-xl border border-[#C9B8A6]/50 shrink-0">
                          {formatMoney(ms.amount, candidate.currency)}
                        </span>
                      </div>

                      <p className="text-xs text-[#5A0F24]/85 pl-9 leading-relaxed">
                        {ms.description}
                      </p>

                      <div className="pl-9 pt-1 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#5A0F24]/70">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#8C2C45]" />
                          Entrega estimada: {ms.deliveryDays} días
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          Pago protegido en Escrow
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-emerald-950">
                    Garantía de Custodia en cada entregable
                  </p>
                  <p className="text-emerald-900/85 leading-relaxed">
                    Al aceptar esta postulación, el monto de cada hito queda resguardado en custodia y solo se libera al especialista cuando revisas y apruebas el entregable correspondiente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra inferior con TODAS las acciones correspondientes de la postulación */}
          <div className="pt-6 border-t-2 border-[#C9B8A6]/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#F3EFE6]/40 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-6 md:px-8">
            <div className="flex flex-wrap items-center gap-2.5">
              {onCloseDetail && (
                <button
                  type="button"
                  onClick={onCloseDetail}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#F3EFE6] text-[#5A0F24] border border-[#C9B8A6] text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#8C2C45]" />
                  <span>Volver a Postulaciones</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onViewPortfolio(candidate)}
                data-testid={`btn-portfolio-${candidate.id}`}
                className="py-2.5 px-4 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] border border-[#C9B8A6]/60 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-[#8C2C45]" />
                <span>Ver Portafolio Completo</span>
              </button>

              <button
                type="button"
                onClick={() => onStartChat(candidate)}
                data-testid={`btn-chat-${candidate.id}`}
                className="py-2.5 px-4 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] border border-[#C9B8A6]/60 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#8C2C45]" />
                <span>Iniciar Chat con {candidate.freelancerName.split(' ')[0]}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {onToggleRejectProposal && !isAccepted && (
                <button
                  type="button"
                  onClick={() => onToggleRejectProposal(candidate)}
                  data-testid={`btn-reject-${candidate.id}`}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    isRejected
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-white hover:bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {isRejected ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Restaurar Postulación</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Descartar Postulación</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                disabled={
                  isAccepted || isAccepting || hasAcceptedProposal || isRejected
                }
                onClick={() => onAcceptProposal(candidate)}
                data-testid={`btn-accept-${candidate.id}`}
                className={`flex-1 sm:flex-initial py-3 px-6 rounded-xl text-xs font-extrabold transition-all inline-flex items-center justify-center gap-2 ${
                  isAccepted
                    ? 'bg-emerald-600 text-white cursor-default'
                    : hasAcceptedProposal || isRejected
                      ? 'bg-[#C9B8A6]/40 text-[#5A0F24]/50 cursor-not-allowed'
                      : 'bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-md cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isAccepted
                    ? 'Propuesta Aceptada • Contrato Creado'
                    : isAccepting
                      ? 'Generando contrato...'
                      : 'Aceptar Propuesta y Contratar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
