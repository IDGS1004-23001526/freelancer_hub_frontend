import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import CardInputForm from '../features/payments/CardInputForm.jsx';
import Toast from '../features/ui/Toast.jsx';
import { paymentApi } from '../api/payment.api.js';
import { maskCardNumber } from '../utils/validators.js';
import { useProjectStore } from '../stores/project.store.js';

export default function PaymentMethodsPage() {
  const { updateActiveCard } = useProjectStore();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchCards = async () => {
      setLoading(true);
      const list = await paymentApi.getPaymentMethods();
      if (mounted) {
        setCards(list);
        setLoading(false);
        const primary = list.find((c) => c.isDefault) || list[0];
        if (primary) {
          updateActiveCard(primary.brand, primary.last4);
        }
      }
    };
    fetchCards();
    return () => {
      mounted = false;
    };
  }, [updateActiveCard]);

  const handleRegisterCard = async (payload) => {
    setIsSubmitting(true);
    try {
      const created = await paymentApi.registerPaymentMethod(payload);
      const updatedList = await paymentApi.getPaymentMethods();
      setCards(updatedList);

      const primary = updatedList.find((c) => c.isDefault) || created;
      if (primary) {
        updateActiveCard(primary.brand, primary.last4);
      }

      setToast({
        type: 'success',
        title: 'Tarjeta guardada',
        message: `Tu tarjeta ${created.brand} con terminación ${created.last4} quedó registrada.`,
      });
    } catch {
      setToast({
        type: 'error',
        title: 'No se pudo guardar',
        message: 'Ocurrió un problema al registrar la tarjeta. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (card) => {
    setDeletingId(card.id);
    try {
      const remaining = await paymentApi.deletePaymentMethod(card.id);
      setCards(remaining);

      const nextPrimary = remaining.find((c) => c.isDefault) || remaining[0];
      if (nextPrimary) {
        updateActiveCard(nextPrimary.brand, nextPrimary.last4);
      }

      setToast({
        type: 'info',
        title: 'Tarjeta eliminada',
        message: `Quitamos la tarjeta ${card.brand} terminada en ${card.last4} de tu cuenta.`,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = (card) => {
    const updated = paymentApi.setDefaultPaymentMethod(card.id);
    setCards(updated);
    updateActiveCard(card.brand, card.last4);
    setToast({
      type: 'success',
      title: 'Tarjeta principal actualizada',
      message: `Ahora usarás tu ${card.brand} (${maskCardNumber(card.last4)}) por defecto.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Encabezado Principal */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.1)] border border-[#C9B8A6]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight">
              Mis métodos de pago
            </h1>
            <p className="text-xs md:text-sm text-[#5A0F24]/75 mt-1 max-w-2xl">
              Agrega o administra las tarjetas que usas para contratar y fondear tus proyectos en la plataforma.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A0F24] text-[#F3EFE6] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0F24]/70 block">
                Conexión segura
              </span>
              <span className="text-xs font-extrabold text-[#5A0F24]">
                Datos protegidos y cifrados
              </span>
            </div>
          </div>
        </section>

        {/* Layout de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-6">
            <CardInputForm
              onRegisterCard={handleRegisterCard}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Columna Derecha: Tarjetas Guardadas */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] border border-[#C9B8A6]/60 space-y-5">
              <div className="flex items-center justify-between border-b border-[#C9B8A6]/50 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#5A0F24]">
                    Tarjetas guardadas ({cards.length})
                  </h2>
                  <p className="text-xs text-[#5A0F24]/70">
                    Selecciona cuál quieres usar por defecto o elimina las que ya no ocupes.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-xs font-bold text-[#5A0F24]/70">
                  Cargando tus tarjetas...
                </div>
              ) : cards.length === 0 ? (
                <div
                  data-testid="empty-cards-state"
                  className="p-8 rounded-2xl bg-[#F3EFE6]/50 border border-dashed border-[#C9B8A6] text-center space-y-2"
                >
                  <CreditCard className="w-8 h-8 text-[#8C2C45] mx-auto" />
                  <h3 className="text-sm font-extrabold text-[#5A0F24]">
                    Aún no tienes tarjetas registradas
                  </h3>
                  <p className="text-xs text-[#5A0F24]/70">
                    Cuando agregues una tarjeta en el formulario de al lado, aparecerá aquí para tus próximos proyectos.
                  </p>
                </div>
              ) : (
                <div
                  data-testid="saved-cards-list"
                  className="space-y-3.5"
                >
                  {cards.map((card) => {
                    const masked = maskCardNumber(card.last4);
                    return (
                      <div
                        key={card.id}
                        data-testid={`saved-card-item-${card.last4}`}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          card.isDefault
                            ? 'bg-[#F3EFE6]/80 border-[#8C2C45] shadow-xs'
                            : 'bg-white border-[#C9B8A6]/60 hover:border-[#8C2C45]/50'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              data-testid={`saved-card-brand-${card.last4}`}
                              className="px-2.5 py-0.5 rounded-lg bg-[#5A0F24] text-[#F3EFE6] text-xs font-extrabold"
                            >
                              {card.brand}
                            </span>
                            <span
                              data-testid={`saved-card-masked-${card.last4}`}
                              className="font-mono text-sm sm:text-base font-extrabold text-[#5A0F24] tracking-wider"
                            >
                              {masked}
                            </span>
                            {card.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Principal</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A0F24]/80">
                            <span className="font-bold uppercase">
                              {card.holderName}
                            </span>
                            <span>•</span>
                            <span>
                              Vence {card.expMonth}/{card.expYear}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!card.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(card)}
                              data-testid={`btn-default-card-${card.last4}`}
                              className="px-3 py-2 rounded-xl bg-[#F3EFE6] hover:bg-[#C68A8F]/30 text-[#5A0F24] border border-[#C9B8A6] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Dejar como tarjeta principal"
                            >
                              <Star className="w-3.5 h-3.5 text-[#8C2C45]" />
                              <span>Hacer principal</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={deletingId === card.id}
                            onClick={() => handleDeleteCard(card)}
                            data-testid={`btn-delete-card-${card.last4}`}
                            aria-label={`Eliminar tarjeta ${card.brand} terminada en ${card.last4}`}
                            className="px-3 py-2 rounded-xl bg-[#fff5f5] hover:bg-[#8C2C45] text-[#8C2C45] hover:text-white border border-[#8C2C45]/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nota informativa natural para el cliente */}
            <div className="bg-white rounded-3xl p-6 border border-[#C9B8A6]/60 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#5A0F24]">
                <ShieldCheck className="w-4 h-4 text-[#8C2C45]" />
                <span>¿Cómo protegemos tus pagos?</span>
              </div>
              <p className="text-xs text-[#5A0F24]/80 leading-relaxed">
                Cuando inicias un proyecto, el pago queda resguardado en garantía y solo se libera al freelancer cuando revisas y apruebas cada avance. Puedes cambiar o quitar tus tarjetas en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
