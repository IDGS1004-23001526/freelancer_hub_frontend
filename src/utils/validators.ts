/**
 * General validation utility functions
 */

/**
 * Validates whether an email string follows standard RFC pattern
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Validates full name: minimum 3 characters, letters and spaces
 */
export function isValidFullName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 3) return false;
  // Allow letters from various alphabets, spaces, dots, hyphens
  const regex = /^[\p{L}\s.'-]{3,60}$/u;
  return regex.test(trimmed);
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
}

/**
 * Evaluates password strength and returns reactive validation errors
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number');
  } else {
    score += 1;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4 && password.length >= 10) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    score,
    strength,
    errors,
  };
}

export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}

export type CardBrand = 'Visa' | 'Mastercard' | 'Amex' | 'Desconocida';

/**
 * Strips all non-digit characters from a card number string
 */
export function sanitizeCardDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Detects card franchise (Visa, Mastercard, Amex) from digits
 */
export function detectCardBrand(value: string): CardBrand {
  const digits = sanitizeCardDigits(value);
  if (!digits) return 'Desconocida';

  if (/^4/.test(digits)) {
    return 'Visa';
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
    return 'Mastercard';
  }
  if (/^3[47]/.test(digits)) {
    return 'Amex';
  }
  return 'Desconocida';
}

/**
 * Validates a credit/debit card number using the Luhn algorithm (Mod 10)
 */
export function isValidLuhn(value: string): boolean {
  const digits = sanitizeCardDigits(value);
  const brand = detectCardBrand(digits);

  if (brand === 'Amex') {
    if (digits.length !== 15) return false;
  } else if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Reject all-zeros
  if (/^0+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Masks a card number so only the last 4 digits are visible: **** **** **** 4242
 */
export function maskCardNumber(valueOrLast4: string): string {
  const digits = sanitizeCardDigits(valueOrLast4);
  const last4 = digits.slice(-4).padStart(4, '*');
  return `**** **** **** ${last4}`;
}

