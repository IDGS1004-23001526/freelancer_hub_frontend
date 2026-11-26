import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { profileApi } from '../../../api/profile.api.js';
import { paymentApi } from '../../../api/payment.api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import CardInputForm from '../../payments/CardInputForm.jsx';
import ProjectForm from '../../projects/components/ProjectForm.jsx';

const STEPS = [
  { id: 'company_profile', label: 'Empresa' },
  { id: 'payment_method', label: 'Método de pago' },
  { id: 'first_project', label: 'Convocatoria' },
];

/**
 * Onboarding del cliente en un modal, igual que el del freelancer:
 * cada paso se completa aquí mismo y el progreso se recalcula desde el backend.
 */
export default function ClientOnboardingModal({ isOpen, onClose, initialStep = 1, progress, onProgressUpdated }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(initialStep);
    setError('');
    profileApi
      .getMyProfile()
      .then((res) => {
        const p = res?.data;
        if (!p) return;
        setCompanyName([p.firstName, p.lastName].filter(Boolean).join(' '));
        setBio(p.bio || '');
        setLocation(p.location || '');
      })
      .catch(() => {});
  }, [isOpen, initialStep]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDone = (id) => Boolean(progress?.steps?.find((s) => s.id === id)?.isCompleted);

  // Recalcula el progreso y avanza al siguiente paso pendiente (o cierra si ya no hay).
  const afterStepSaved = async () => {
    let next = null;
    try {
      const res = await profileApi.getOnboardingStatus();
      if (res?.data) {
        onProgressUpdated(res.data);
        const pendingIndex = res.data.steps.findIndex((s) => !s.isCompleted);
        next = pendingIndex === -1 ? null : pendingIndex + 1;
      }
    } catch {
      next = currentStep < STEPS.length ? currentStep + 1 : null;
    }
    if (next) {
      setCurrentStep(next);
    } else {
      onClose();
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !bio.trim()) {
      setError('Escribe el nombre de tu empresa y una descripción.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await profileApi.updateProfile({
        firstName: companyName.trim(),
        lastName: '',
        bio: bio.trim(),
        location: location.trim() || undefined,
      });
      await afterStepSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterCard = async (cardPayload) => {
    setError('');
    try {
      await paymentApi.registerPaymentMethod(cardPayload);
      await afterStepSaved();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo registrar la tarjeta.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-onboarding-title"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(90,15,36,0.25)] border border-[#C9B8A6]/60 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-[#C9B8A6]/40 bg-[#F3EFE6]/60 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-semibold text-[#5A0F24]/70 mb-1">
              {progress?.completedSteps ?? 0} de {STEPS.length} pasos completados
            </p>
            <h2 id="client-onboarding-title" className="text-lg md:text-xl font-extrabold text-[#5A0F24]">
              Configurar cuenta de cliente
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#5A0F24]/60 hover:text-[#5A0F24] hover:bg-[#C9B8A6]/30 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#C9B8A6]/40 shrink-0" role="tablist">
          {STEPS.map((step, idx) => {
            const active = currentStep === idx + 1;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setError('');
                  setCurrentStep(idx + 1);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-bold transition-colors cursor-pointer ${
                  active ? 'text-[#8C2C45] border-b-2 border-[#8C2C45]' : 'text-[#5A0F24]/60 hover:text-[#5A0F24]'
                }`}
              >
                {isDone(step.id) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-label="Completado" />
                ) : (
                  <span>{idx + 1}.</span>
                )}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <p role="alert" className="mb-4 text-xs text-[#8C2C45] bg-[#F3EFE6] border border-[#C68A8F]/40 rounded-xl p-3">
              {error}
            </p>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <Input
                id="company-name"
                label="Nombre de la empresa o estudio"
                placeholder="Nombre de tu empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <div>
                <label htmlFor="company-bio" className="block text-xs font-bold text-[#5A0F24] mb-1.5">
                  Descripción del negocio
                </label>
                <textarea
                  id="company-bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A qué se dedica tu empresa y qué tipo de proyectos sueles contratar"
                  className="w-full rounded-xl border border-[#C9B8A6] bg-white p-3 text-sm text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]/40"
                  required
                />
              </div>
              <Input
                id="company-location"
                label="Ubicación (opcional)"
                placeholder="Ciudad, país"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#8C2C45] hover:bg-[#5A0F24] text-white cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar y continuar</span>
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-[#5A0F24]/75">
                Con esta tarjeta fondearás la custodia Escrow cuando contrates a un freelancer. No se hace ningún cargo ahora.
              </p>
              <CardInputForm onRegisterCard={handleRegisterCard} />
            </div>
          )}

          {currentStep === 3 && <ProjectForm onCreated={afterStepSaved} />}
        </div>
      </div>
    </div>
  );
}
