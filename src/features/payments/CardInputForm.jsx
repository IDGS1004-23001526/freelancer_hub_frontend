import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
  Calendar,
} from 'lucide-react';
import {
  detectCardBrand,
  isValidLuhn,
  maskCardNumber,
  sanitizeCardDigits,
} from '../../utils/validators.js';

function formatCardDigits(digits, brand) {
  if (!digits) return '';
  if (brand === 'Amex') {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function generateGatewayToken(brand, last4) {
  const brandSlug = (brand || 'card').toLowerCase().replace(/\s+/g, '');
  const randomHex = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `tok_${brandSlug}_${randomHex}_${last4}`;
}

export default function CardInputForm({ onRegisterCard, isSubmitting = false }) {
  const [holderName, setHolderName] = useState('');
  const [rawDigits, setRawDigits] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [isNumberFocused, setIsNumberFocused] = useState(false);
  const [maskWhileTyping, setMaskWhileTyping] = useState(false);

  const [touched, setTouched] = useState({
    holderName: false,
    cardNumber: false,
    expiry: false,
    cvc: false,
  });

  const markTouched = (field) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const detectedBrand = useMemo(() => detectCardBrand(rawDigits), [rawDigits]);
  const expectedLength = detectedBrand === 'Amex' ? 15 : 16;
  const expectedCvcLength = detectedBrand === 'Amex' ? 4 : 3;

  const maskedPreview = useMemo(() => {
    if (!rawDigits) return '**** **** **** ****';
    const last4 = rawDigits.slice(-4).padStart(4, '*');
    return `**** **** **** ${last4}`;
  }, [rawDigits]);

  const displayedInputValue = useMemo(() => {
    if (!rawDigits) return '';
    if ((maskWhileTyping || !isNumberFocused) && rawDigits.length >= 4) {
      return maskCardNumber(rawDigits);
    }
    return formatCardDigits(rawDigits, detectedBrand);
  }, [rawDigits, maskWhileTyping, isNumberFocused, detectedBrand]);

  const validation = useMemo(() => {
    const cleanHolder = holderName.trim();
    let holderError = null;
    if (!cleanHolder) {
      holderError = 'Escribe el nombre del titular.';
    } else if (cleanHolder.length < 3) {
      holderError = 'Escribe el nombre completo como viene en la tarjeta.';
    }

    let cardNumberError = null;
    const luhnPassed = isValidLuhn(rawDigits);
    if (!rawDigits) {
      cardNumberError = 'Ingresa los números de tu tarjeta.';
    } else if (detectedBrand === 'Desconocida') {
      cardNumberError = 'Solo aceptamos tarjetas Visa, Mastercard o American Express.';
    } else if (rawDigits.length !== expectedLength) {
      cardNumberError = `Faltan dígitos (llevas ${rawDigits.length} de ${expectedLength}).`;
    } else if (!luhnPassed) {
      cardNumberError = 'El número de tarjeta no es válido, revísalo por favor.';
    }

    let expiryError = null;
    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
    let expMonth = '';
    let expYear = '';
    if (!expiry) {
      expiryError = 'Indica el mes y año de vencimiento.';
    } else if (!expiryMatch) {
      expiryError = 'Usa el formato MM/AA (por ejemplo, 09/28).';
    } else {
      expMonth = expiryMatch[1];
      expYear = expiryMatch[2];
      const monthNum = parseInt(expMonth, 10);
      const yearNum = 2000 + parseInt(expYear, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (monthNum < 1 || monthNum > 12) {
        expiryError = 'El mes debe estar entre 01 y 12.';
      } else if (
        yearNum < currentYear ||
        (yearNum === currentYear && monthNum < currentMonth)
      ) {
        expiryError = 'Esta tarjeta ya venció.';
      }
    }

    let cvcError = null;
    if (!cvc) {
      cvcError = 'Ingresa el código de seguridad.';
    } else if (!/^\d+$/.test(cvc) || cvc.length !== expectedCvcLength) {
      cvcError = `Ingresa los ${expectedCvcLength} dígitos de seguridad.`;
    }

    const isValid =
      !holderError && !cardNumberError && !expiryError && !cvcError;

    return {
      holderError,
      cardNumberError,
      expiryError,
      cvcError,
      luhnPassed,
      expMonth,
      expYear,
      isHolderValid: !holderError,
      isCardNumberValid: !cardNumberError,
      isExpiryValid: !expiryError,
      isCvcValid: !cvcError,
      isValid,
    };
  }, [holderName, rawDigits, detectedBrand, expectedLength, expiry, cvc, expectedCvcLength]);

  const handleCardNumberChange = (e) => {
    const val = e.target.value;
    markTouched('cardNumber');
    if (val.includes('*')) {
      const trailingDigits = sanitizeCardDigits(val);
      setRawDigits(trailingDigits.slice(0, 16));
      return;
    }
    const digits = sanitizeCardDigits(val);
    const brand = detectCardBrand(digits);
    const maxLen = brand === 'Amex' ? 15 : 16;
    setRawDigits(digits.slice(0, maxLen));
  };

  const handleExpiryChange = (e) => {
    markTouched('expiry');
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiry(digits);
    }
  };

  const handleCvcChange = (e) => {
    markTouched('cvc');
    const digits = e.target.value.replace(/\D/g, '').slice(0, expectedCvcLength);
    setCvc(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      holderName: true,
      cardNumber: true,
      expiry: true,
      cvc: true,
    });

    if (!validation.isValid || isSubmitting) {
      return;
    }

    const last4 = rawDigits.slice(-4);
    const gatewayToken = generateGatewayToken(detectedBrand, last4);

    setCvc('');
    setRawDigits('');
    setHolderName('');
    setExpiry('');
    setTouched({
      holderName: false,
      cardNumber: false,
      expiry: false,
      cvc: false,
    });

    if (onRegisterCard) {
      await onRegisterCard({
        token: gatewayToken,
        brand: detectedBrand,
        last4,
        holderName: holderName.trim().toUpperCase(),
        expMonth: validation.expMonth,
        expYear: validation.expYear,
        isDefault,
      });
    }
  };

  const showHolderError =
    (touched.holderName || holderName.length > 0) && validation.holderError;
  const showCardError =
    (touched.cardNumber || rawDigits.length > 0) && validation.cardNumberError;
  const showExpiryError =
    (touched.expiry || expiry.length > 0) && validation.expiryError;
  const showCvcError =
    (touched.cvc || cvc.length > 0) && validation.cvcError;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(90,15,36,0.12)] border border-[#C9B8A6]/60 relative overflow-hidden space-y-6">
      <div className="absolute -top-14 -right-14 w-56 h-56 bg-[#C68A8F]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Encabezado */}
      <div className="relative z-10 border-b border-[#C9B8A6]/50 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#5A0F24] tracking-tight">
            Agregar una tarjeta
          </h2>
          <p className="text-xs text-[#5A0F24]/75 mt-0.5">
            Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express.
          </p>
        </div>

        <div
          data-testid="detected-brand-badge"
          className="px-3 py-1.5 rounded-xl bg-[#F3EFE6] border border-[#C9B8A6] text-right"
        >
          <span className="text-xs font-extrabold text-[#5A0F24]">
            {detectedBrand === 'Desconocida'
              ? 'Visa • Mastercard • Amex'
              : detectedBrand}
          </span>
        </div>
      </div>

      {/* Vista previa de la tarjeta */}
      <div className="relative z-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#5A0F24] via-[#721831] to-[#8C2C45] text-[#F3EFE6] shadow-[0_12px_30px_-8px_rgba(90,15,36,0.45)] border border-[#C68A8F]/30 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#C68A8F]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#F3EFE6]/90">
              FreelanceHub
            </span>
          </div>
          <span
            data-testid="card-preview-brand"
            className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F3EFE6]/15 border border-[#F3EFE6]/30 text-white"
          >
            {detectedBrand === 'Desconocida' ? 'TARJETA' : detectedBrand.toUpperCase()}
          </span>
        </div>

        <div>
          <p
            data-testid="masked-card-preview"
            className="font-mono text-lg sm:text-xl font-extrabold tracking-widest text-white"
          >
            {maskedPreview}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#F3EFE6]/70 block">
              Titular
            </span>
            <span className="font-bold tracking-wide uppercase">
              {holderName.trim() || 'NOMBRE DEL TITULAR'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#F3EFE6]/70 block">
              Vence
            </span>
            <span className="font-bold">{expiry || 'MM/AA'}</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        data-testid="card-input-form"
        className="relative z-10 space-y-5"
      >
        {/* 1. Nombre del Titular */}
        <div>
          <label
            htmlFor="card-holder-name"
            className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5 mb-1.5"
          >
            <User className="w-3.5 h-3.5 text-[#8C2C45]" />
            <span>Nombre en la tarjeta</span>
          </label>
          <input
            id="card-holder-name"
            name="holderName"
            type="text"
            maxLength={60}
            value={holderName}
            onChange={(e) => {
              setHolderName(e.target.value);
              markTouched('holderName');
            }}
            onBlur={() => markTouched('holderName')}
            placeholder="Como aparece impreso en la tarjeta"
            data-testid="input-card-holder"
            className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm uppercase text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border ${
              showHolderError
                ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20'
                : validation.isHolderValid
                ? 'border-emerald-500/70 bg-white'
                : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#8C2C45]'
            }`}
          />
          {showHolderError && (
            <p
              role="alert"
              data-testid="error-card-holder"
              className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.holderError}</span>
            </p>
          )}
        </div>

        {/* 2. Número de Tarjeta */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="card-number"
              className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Número de tarjeta</span>
            </label>

            <div className="flex items-center gap-2">
              {rawDigits.length >= 13 && (
                <span
                  data-testid="luhn-status-badge"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    validation.luhnPassed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#fff5f5] text-[#8C2C45] border border-[#8C2C45]/40'
                  }`}
                >
                  {validation.luhnPassed ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Tarjeta válida</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Número inválido</span>
                    </>
                  )}
                </span>
              )}

              <button
                type="button"
                onClick={() => setMaskWhileTyping((prev) => !prev)}
                data-testid="btn-toggle-mask"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C2C45] hover:text-[#5A0F24] cursor-pointer"
              >
                {maskWhileTyping ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mostrar</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <input
            id="card-number"
            name="cardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={displayedInputValue}
            onFocus={() => setIsNumberFocused(true)}
            onBlur={() => {
              setIsNumberFocused(false);
              markTouched('cardNumber');
            }}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            data-testid="input-card-number"
            className={`w-full px-4 py-3 rounded-xl font-mono text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border ${
              showCardError
                ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20'
                : validation.isCardNumberValid
                ? 'border-emerald-500/70 bg-white'
                : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#8C2C45]'
            }`}
          />

          {showCardError ? (
            <p
              role="alert"
              data-testid="error-card-number"
              className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.cardNumberError}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-[#5A0F24]/70">
              Por seguridad, solo serán visibles los últimos 4 dígitos.
            </p>
          )}
        </div>

        {/* 3. Expiración y CVV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="card-expiry"
              className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5 mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Fecha de vencimiento</span>
            </label>
            <input
              id="card-expiry"
              name="expiry"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={expiry}
              onChange={handleExpiryChange}
              onBlur={() => markTouched('expiry')}
              placeholder="MM/AA"
              data-testid="input-card-expiry"
              className={`w-full px-4 py-3 rounded-xl font-mono text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border ${
                showExpiryError
                  ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20'
                  : validation.isExpiryValid
                  ? 'border-emerald-500/70 bg-white'
                  : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#8C2C45]'
              }`}
            />
            {showExpiryError && (
              <p
                role="alert"
                data-testid="error-card-expiry"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.expiryError}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="card-cvc"
              className="text-xs font-extrabold text-[#5A0F24] flex items-center gap-1.5 mb-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Código de seguridad (CVV)</span>
            </label>
            <input
              id="card-cvc"
              name="cvc"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={expectedCvcLength}
              value={cvc}
              onChange={handleCvcChange}
              onBlur={() => markTouched('cvc')}
              placeholder={expectedCvcLength === 4 ? '4 dígitos' : '3 dígitos'}
              data-testid="input-card-cvc"
              className={`w-full px-4 py-3 rounded-xl font-mono text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:outline-none transition-all border ${
                showCvcError
                  ? 'border-[#8C2C45] bg-[#fff5f5]/70 ring-2 ring-[#8C2C45]/20'
                  : validation.isCvcValid
                  ? 'border-emerald-500/70 bg-white'
                  : 'border-[#C9B8A6] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#8C2C45]'
              }`}
            />
            {showCvcError ? (
              <p
                role="alert"
                data-testid="error-card-cvc"
                className="mt-1.5 text-[11px] font-bold text-[#8C2C45] flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.cvcError}</span>
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-[#5A0F24]/70">
                Los {expectedCvcLength} números detrás de tu tarjeta.
              </p>
            )}
          </div>
        </div>

        {/* Opción para marcar como tarjeta principal */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/50 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 accent-[#8C2C45] rounded cursor-pointer"
          />
          <span className="text-xs font-bold text-[#5A0F24]">
            Usar esta tarjeta como mi método de pago principal
          </span>
        </label>

        {/* Nota de privacidad */}
        <div className="p-3.5 rounded-2xl bg-[#F3EFE6] border border-[#C9B8A6]/60 flex items-start gap-2.5 text-[11px] text-[#5A0F24]/85">
          <ShieldCheck className="w-4 h-4 text-[#8C2C45] shrink-0 mt-0.5" />
          <div>
            Tus datos viajan cifrados. Por tu seguridad, nunca almacenamos el código CVV ni los 16 dígitos de tu tarjeta.
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!validation.isValid || isSubmitting}
          data-testid="btn-register-card"
          className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            !validation.isValid || isSubmitting
              ? 'bg-[#C9B8A6]/60 text-[#5A0F24]/50 border border-[#C9B8A6] cursor-not-allowed opacity-70'
              : 'bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-[0_8px_22px_-4px_rgba(90,15,36,0.4)] cursor-pointer'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>
            {isSubmitting ? 'Guardando tarjeta...' : 'Guardar tarjeta'}
          </span>
        </button>
      </form>
    </div>
  );
}
