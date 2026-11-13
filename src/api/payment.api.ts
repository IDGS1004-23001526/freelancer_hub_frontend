import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  PaymentMethodItem,
  RegisterCardPayload,
} from '../interfaces/payment.interface.js';
import { maskCardNumber } from '../utils/validators.js';

export const PAYMENT_METHODS_STORAGE_KEY = 'fh_payment_methods_pci';

const INITIAL_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'pm_pci_4829',
    token: 'tok_visa_pci_9f8a7b6c4829',
    brand: 'Visa',
    last4: '4829',
    maskedNumber: '**** **** **** 4829',
    holderName: 'SOFIA RAMIREZ',
    expMonth: '08',
    expYear: '28',
    isDefault: true,
    createdAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'pm_pci_4444',
    token: 'tok_mc_pci_3d2e1f0a4444',
    brand: 'Mastercard',
    last4: '4444',
    maskedNumber: '**** **** **** 4444',
    holderName: 'ESTUDIO NEXUS SA',
    expMonth: '11',
    expYear: '27',
    isDefault: false,
    createdAt: '2026-10-28T16:20:00.000Z',
  },
];

/**
 * Sanitiza cualquier objeto de tarjeta antes de persistirlo localmente
 * para garantizar cumplimiento estricto de PCI-DSS (sin PAN ni CVC).
 */
function sanitizeForPciStorage(item: PaymentMethodItem): PaymentMethodItem {
  const cleanLast4 = String(item.last4 || '').replace(/\D/g, '').slice(-4);
  return {
    id: item.id,
    token: item.token,
    brand: item.brand,
    last4: cleanLast4,
    maskedNumber: maskCardNumber(cleanLast4),
    holderName: item.holderName.trim().toUpperCase(),
    expMonth: String(item.expMonth).padStart(2, '0'),
    expYear: String(item.expYear).slice(-2),
    isDefault: Boolean(item.isDefault),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

export function loadStoredPaymentMethods(): PaymentMethodItem[] {
  try {
    const raw = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizeForPciStorage);
      }
    }
  } catch {
    // Fallback a semilla inicial
  }
  const seeded = INITIAL_PAYMENT_METHODS.map(sanitizeForPciStorage);
  localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveStoredPaymentMethods(methods: PaymentMethodItem[]): PaymentMethodItem[] {
  const sanitized = methods.map(sanitizeForPciStorage);
  localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(sanitized));
  return sanitized;
}

export const paymentApi = {
  /**
   * GET /api/v1/payment-methods
   * Lista los métodos de pago tokenizados del cliente autenticado.
   */
  getPaymentMethods: async (): Promise<PaymentMethodItem[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<PaymentMethodItem[]> | PaymentMethodItem[]
      >('/v1/payment-methods');
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      if (Array.isArray(rawData)) {
        return saveStoredPaymentMethods(rawData);
      }
    } catch {
      // Fallback a almacenamiento local seguro (solo tokens y últimos 4 dígitos)
    }
    return loadStoredPaymentMethods();
  },

  /**
   * POST /api/v1/payment-methods
   * Registra una tarjeta enviando únicamente token de pasarela, marca y últimos 4 dígitos.
   */
  registerPaymentMethod: async (
    payload: RegisterCardPayload
  ): Promise<PaymentMethodItem> => {
    const cleanLast4 = payload.last4.replace(/\D/g, '').slice(-4);
    const safePayload: RegisterCardPayload = {
      token: payload.token,
      brand: payload.brand,
      last4: cleanLast4,
      holderName: payload.holderName.trim().toUpperCase(),
      expMonth: String(payload.expMonth).padStart(2, '0'),
      expYear: String(payload.expYear).slice(-2),
      isDefault: payload.isDefault,
    };

    try {
      const response = await apiClient.post<
        ApiResponse<PaymentMethodItem> | PaymentMethodItem
      >('/v1/payment-methods', safePayload);

      const createdFromApi =
        (response.data as ApiResponse<PaymentMethodItem>)?.data ||
        (response.data as PaymentMethodItem);

      if (createdFromApi && createdFromApi.id) {
        const sanitizedCreated = sanitizeForPciStorage({
          ...createdFromApi,
          last4: createdFromApi.last4 || cleanLast4,
          maskedNumber: maskCardNumber(createdFromApi.last4 || cleanLast4),
        });
        const current = loadStoredPaymentMethods();
        const nextList = sanitizedCreated.isDefault
          ? [
              sanitizedCreated,
              ...current.map((c) => ({ ...c, isDefault: false })),
            ]
          : [sanitizedCreated, ...current];
        saveStoredPaymentMethods(nextList);
        return sanitizedCreated;
      }
    } catch {
      // Fallback local garantizando cumplimiento PCI-DSS
    }

    const current = loadStoredPaymentMethods();
    const shouldBeDefault = Boolean(payload.isDefault || current.length === 0);

    const newCard: PaymentMethodItem = sanitizeForPciStorage({
      id: `pm_pci_${Date.now()}`,
      token: safePayload.token,
      brand: safePayload.brand,
      last4: cleanLast4,
      maskedNumber: maskCardNumber(cleanLast4),
      holderName: safePayload.holderName,
      expMonth: safePayload.expMonth,
      expYear: safePayload.expYear,
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString(),
    });

    const updated = shouldBeDefault
      ? [newCard, ...current.map((item) => ({ ...item, isDefault: false }))]
      : [newCard, ...current];

    saveStoredPaymentMethods(updated);
    return newCard;
  },

  /**
   * DELETE /api/v1/payment-methods/:id
   * Desvincula y elimina una tarjeta guardada.
   */
  deletePaymentMethod: async (id: string): Promise<PaymentMethodItem[]> => {
    try {
      await apiClient.delete(`/v1/payment-methods/${id}`);
    } catch {
      // Continúa con eliminación en estado local sincronizado
    }

    const current = loadStoredPaymentMethods();
    const remaining = current.filter((item) => item.id !== id);

    if (remaining.length > 0 && !remaining.some((item) => item.isDefault)) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }

    return saveStoredPaymentMethods(remaining);
  },

  /**
   * Define una tarjeta guardada como predeterminada para fondeos Escrow.
   */
  setDefaultPaymentMethod: (id: string): PaymentMethodItem[] => {
    const current = loadStoredPaymentMethods();
    const updated = current.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));
    return saveStoredPaymentMethods(updated);
  },
};
