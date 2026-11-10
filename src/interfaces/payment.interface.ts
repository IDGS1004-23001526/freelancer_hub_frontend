import type { CardBrand } from '../utils/validators.js';

/**
 * Representa un método de pago tokenizado bajo estándar PCI-DSS (PAY-01 / FREEL-32).
 * Prohibido almacenar PAN completo o código de seguridad CVC.
 */
export interface PaymentMethodItem {
  id: string;
  token: string;
  brand: Exclude<CardBrand, 'Desconocida'> | string;
  last4: string;
  maskedNumber: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Payload seguro enviado a POST /api/v1/payment-methods tras tokenización en memoria.
 * No incluye número completo de tarjeta ni CVC.
 */
export interface RegisterCardPayload {
  token: string;
  brand: string;
  last4: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  isDefault?: boolean;
}
