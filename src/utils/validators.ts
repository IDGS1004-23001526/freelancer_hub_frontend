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
