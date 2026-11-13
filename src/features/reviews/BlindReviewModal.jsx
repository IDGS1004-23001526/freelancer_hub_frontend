import React, { useState } from 'react';
import {
  Star,
  Lock,
  CheckCircle2,
  X,
  Eye,
  Clock,
  Sparkles,
  Send,
  ShieldCheck,
} from 'lucide-react';

const RATING_LABELS = {
  1: 'Necesita mejorar varios aspectos',
  2: 'Cumplió parcialmente lo acordado',
  3: 'Buen trabajo y entregas a tiempo',
  4: 'Muy buena comunicación y calidad',
  5: 'Excelente colaboración en todo momento',
};

export default function BlindReviewModal({
  isOpen,
  contract,
  submitting = false,
  onClose,
  onSubmitReview,
  onRevealCounterpart,
}) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !contract) return null;

  const existingReview = contract.review || null;
  const activeStars = hoveredRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingReview) return;

    if (rating < 1 || rating > 5) {
      setErrorMsg('Por favor elige una calificación de 1 a 5 estrellas.');
      return;
    }

    if (comment.trim().length < 10) {
      setErrorMsg(
        'Cuéntanos brevemente cómo fue tu experiencia (mínimo 10 caracteres).'
      );
      return;
    }

    setErrorMsg('');
    await onSubmitReview({
      contractId: contract.id,
      freelancerId: contract.freelancerId,
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="blind-review-modal"
      className="fixed inset-0 z-50 bg-[#2b1b1e]/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#C9B8A6]/60 shadow-[0_25px_65px_-15px_rgba(90,15,36,0.35)] overflow-hidden animate-fade-in">
        {/* Cabecera del modal */}
        <div className="p-6 bg-gradient-to-r from-[#5A0F24] to-[#8C2C45] text-[#F3EFE6] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EFE6] text-[#5A0F24] font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
              {contract.avatarInitials}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3 h-3 text-[#C68A8F]" />
                <span>Evaluación mutua protegida</span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">
                ¿Cómo fue trabajar con {contract.freelancerName}?
              </h3>
              <p className="text-xs text-[#F3EFE6]/85 truncate max-w-sm">
                Proyecto: {contract.projectTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar ventana de calificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Aviso de calificación ciega requerido */}
          <div
            data-testid="blind-review-notice"
            className="p-4 rounded-2xl bg-[#F3EFE6] border border-[#C68A8F]/60 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#5A0F24] text-[#F3EFE6] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-[#C68A8F]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-[#5A0F24]">
                Tu valoración permanecerá oculta hasta que ambas partes hayan emitido su calificación
              </p>
              <p className="text-[11px] text-[#5A0F24]/75 leading-relaxed">
                De esta forma cuidamos que tanto tú como el especialista puedan compartir una opinión sincera, justa y libre de presiones.
              </p>
            </div>
          </div>

          {/* Si ya se envió la calificación: bloquear reenvío y mostrar estado */}
          {existingReview ? (
            <div className="space-y-4">
              {!existingReview.isCounterpartSubmitted ? (
                <div
                  data-testid="blind-review-waiting-state"
                  className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-amber-950">
                        Calificación enviada, esperando a la contraparte
                      </h4>
                      <p className="text-xs text-amber-900/85 leading-relaxed">
                        Tu reseña quedó registrada y resguardada. Se hará visible en cuanto{' '}
                        <strong>{contract.freelancerName}</strong> también comparta su evaluación del proyecto.
                      </p>
                    </div>
                  </div>

                  {onRevealCounterpart && (
                    <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-amber-900/75 font-semibold">
                        ¿Quieres ver cómo luce cuando ambas partes ya calificaron?
                      </span>
                      <button
                        type="button"
                        onClick={() => onRevealCounterpart(contract.id)}
                        data-testid="btn-simulate-counterpart-review"
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Recibir calificación de {contract.freelancerName.split(' ')[0]}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  data-testid="blind-review-unlocked-state"
                  className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950">
                      ¡Ambas partes han calificado! Reseñas desbloqueadas
                    </h4>
                    <p className="text-xs text-emerald-900/85">
                      Tanto tu valoración como la de {contract.freelancerName} ya son públicas en el historial del contrato.
                    </p>
                  </div>
                </div>
              )}

              {/* Resumen de la reseña enviada por el cliente */}
              <div className="p-4 rounded-2xl bg-[#f6f2ee] border border-[#C9B8A6]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#5A0F24]">
                    Tu calificación para {contract.freelancerName}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= existingReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#C9B8A6]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#5A0F24]/85 leading-relaxed">
                  “{existingReview.comment}”
                </p>
              </div>

              {/* Si la contraparte ya envió su reseña, mostrarla */}
              {existingReview.isCounterpartSubmitted && (
                <div className="p-4 rounded-2xl bg-[#F3EFE6]/80 border border-[#8C2C45]/35 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#8C2C45] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Lo que {contract.freelancerName} opinó de trabajar contigo
                      </span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (existingReview.counterpartRating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-[#C9B8A6]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#5A0F24]/85 leading-relaxed">
                    “{existingReview.counterpartComment}”
                  </p>
                </div>
              )}

              {/* Botón deshabilitado para impedir reenvíos */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled
                  data-testid="btn-submit-blind-review"
                  className="px-4 py-2.5 rounded-xl bg-[#C9B8A6]/40 text-[#5A0F24]/50 text-xs font-extrabold cursor-not-allowed inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Calificación ya registrada (no se permiten reenvíos)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#5A0F24] hover:bg-[#8C2C45] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          ) : (
            /* Formulario para enviar la calificación por primera y única vez */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selector de 1 a 5 estrellas */}
              <div className="p-4 rounded-2xl bg-[#f6f2ee] border border-[#e8deda] text-center space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24] block">
                  Selecciona tu calificación general (1 a 5 estrellas)
                </label>

                <div
                  role="radiogroup"
                  aria-label="Calificación en estrellas"
                  className="flex items-center justify-center gap-2 py-1"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeStars;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        data-testid={`star-rating-${star}`}
                        aria-label={`${star} estrellas`}
                        className="p-2 rounded-2xl hover:bg-white transition-all cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-transform ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 scale-110'
                              : 'text-[#C9B8A6] hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-[#8C2C45]">
                  {activeStars} de 5 estrellas — {RATING_LABELS[activeStars]}
                </p>
              </div>

              {/* Área de comentarios */}
              <div className="space-y-2">
                <label
                  htmlFor="blind-review-comment"
                  className="text-xs font-extrabold text-[#5A0F24] block"
                >
                  Cuéntanos cómo fue tu experiencia trabajando en este proyecto
                </label>
                <textarea
                  id="blind-review-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  data-testid="input-review-comment"
                  placeholder={`Escribe qué te pareció la calidad de las entregas, el cumplimiento de fechas y la comunicación con ${contract.freelancerName}...`}
                  className="w-full p-3.5 rounded-2xl bg-[#f6f2ee]/70 border border-[#C9B8A6] focus:bg-white focus:border-[#8C2C45] text-xs md:text-sm text-[#5A0F24] placeholder-[#5A0F24]/45 focus:outline-none transition-all"
                />
                <div className="flex items-center justify-between text-[11px] text-[#5A0F24]/65">
                  <span>
                    Sé claro y constructivo; una vez enviada no se puede modificar.
                  </span>
                  <span>{comment.trim().length} caracteres</span>
                </div>
              </div>

              {errorMsg && (
                <p
                  role="alert"
                  className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-xl"
                >
                  {errorMsg}
                </p>
              )}

              {/* Pie del formulario */}
              <div className="pt-2 border-t border-[#C9B8A6]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5A0F24]/70">
                  <ShieldCheck className="w-4 h-4 text-[#8C2C45]" />
                  <span>Reseña única verificada por contrato</span>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5A0F24] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                  >
                    Ahora no
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="btn-submit-blind-review"
                    className="px-5 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] disabled:opacity-50 text-white text-xs font-extrabold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {submitting
                        ? 'Guardando calificación...'
                        : 'Enviar calificación'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
