import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type {
  PaymentMethodItem,
  RegisterCardPayload,
} from '../interfaces/payment.interface.js';
import { maskCardNumber } from '../utils/validators.js';

const BRAND_TO_API: Record<string, string> = {
  visa: 'visa',
  mastercard: 'mastercard',
  amex: 'amex',
  'american express': 'amex',
  discover: 'discover',
};

const BRAND_FROM_API: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
};

/** Convierte la respuesta del backend (ya sanitizada, sin token) al modelo de la UI. */
function fromApi(row: any): PaymentMethodItem {
  const last4 = String(row.last4 || '').slice(-4);
  return {
    id: row.id,
    token: '',
    brand: BRAND_FROM_API[row.cardBrand] || row.cardBrand || 'Tarjeta',
    last4,
    maskedNumber: maskCardNumber(last4),
    holderName: '',
    expMonth: String(row.expMonth ?? '').padStart(2, '0'),
    expYear: String(row.expYear ?? '').slice(-2),
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt,
  };
}

export const paymentApi = {
  /**
   * GET /api/v1/payment-methods
   * Lista los métodos de pago tokenizados del usuario autenticado.
   */
  getPaymentMethods: async (): Promise<PaymentMethodItem[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/v1/payment-methods');
    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return rows.map(fromApi);
  },

  /**
   * POST /api/v1/payment-methods
   * Registra una tarjeta enviando únicamente token de pasarela, marca, últimos 4 dígitos y expiración.
   */
  registerPaymentMethod: async (payload: RegisterCardPayload): Promise<PaymentMethodItem> => {
    const cardBrand = BRAND_TO_API[String(payload.brand || '').toLowerCase()];
    if (!cardBrand) {
      throw new Error('Solo aceptamos tarjetas Visa, Mastercard, American Express o Discover.');
    }
    const expYearNum = Number(payload.expYear);
    const response = await apiClient.post<ApiResponse<any>>('/v1/payment-methods', {
      gatewayToken: payload.token,
      cardBrand,
      last4: payload.last4.replace(/\D/g, '').slice(-4),
      expMonth: Number(payload.expMonth),
      expYear: expYearNum < 100 ? 2000 + expYearNum : expYearNum,
      isDefault: Boolean(payload.isDefault),
    });
    return fromApi(response.data.data);
  },

  /**
   * DELETE /api/v1/payment-methods/:id
   * Desvincula una tarjeta y devuelve la lista actualizada.
   */
  deletePaymentMethod: async (id: string): Promise<PaymentMethodItem[]> => {
    await apiClient.delete(`/v1/payment-methods/${id}`);
    return paymentApi.getPaymentMethods();
  },

  /**
   * PATCH /api/v1/payment-methods/:id/default
   * Define una tarjeta guardada como predeterminada para fondeos Escrow.
   */
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethodItem[]> => {
    const response = await apiClient.patch<ApiResponse<any[]>>(`/v1/payment-methods/${id}/default`);
    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return rows.map(fromApi);
  },
};
