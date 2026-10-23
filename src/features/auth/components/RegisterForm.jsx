import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import Input from '../../ui/Input.jsx';
import Button from '../../ui/Button.jsx';
import Toast from '../../ui/Toast.jsx';
import RoleSelector from './RoleSelector.jsx';
import { useAuthStore } from '../../../stores/auth.store.js';
import { isValidEmail, isValidFullName, validatePassword } from '../../../utils/validators.js';

/**
 * RegisterForm component handling responsive user registration with:
 * - Visual role selector (Client vs Freelancer)
 * - Reactive instant validation with real-time error feedback
 * - Password strength meter
 * - Toast notification
 * - Automatic redirection to Onboarding flow
 *
 * Uses the specified color palette:
 * - #5A0F24 (deep burgundy/wine)
 * - #8C2C45 (rich berry/crimson)
 * - #C68A8F (dusty rose/mauve)
 * - #F3EFE6 (soft cream/off-white)
 * - #C9B8A6 (warm beige/sand)
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  // Form states
  const [role, setRole] = useState('FREELANCER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field interaction tracking (touched states for reactive validation)
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    acceptTerms: false,
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Mark a field as touched on blur or input
  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Reactive validation computations
  const fullNameError = touched.fullName
    ? !fullName.trim()
      ? 'El nombre completo es obligatorio.'
      : !isValidFullName(fullName)
      ? 'Ingresa tu nombre y apellido (mínimo 3 caracteres, solo letras).'
      : null
    : null;

  const emailError = touched.email
    ? !email.trim()
      ? 'El correo electrónico es obligatorio.'
      : !isValidEmail(email)
      ? 'Introduce un formato de correo válido (ej. sofia@estudio.com).'
      : null
    : null;

  const passwordValidation = validatePassword(password);
  const passwordError = touched.password
    ? !password
      ? 'La contraseña es obligatoria.'
      : !passwordValidation.isValid
      ? passwordValidation.errors[0]
      : null
    : null;

  const confirmPasswordError = touched.confirmPassword
    ? !confirmPassword
      ? 'Por favor confirma tu contraseña.'
      : confirmPassword !== password
      ? 'Las contraseñas no coinciden.'
      : null
    : null;

  const termsError = touched.acceptTerms && !acceptTerms
    ? 'Debes aceptar los Términos y Condiciones para continuar.'
    : null;

  // Real-time password strength color indicator
  const getStrengthBarColor = () => {
    if (!password) return 'bg-[#C9B8A6]/40';
    if (passwordValidation.strength === 'strong') return 'bg-[#8C2C45]';
    if (passwordValidation.strength === 'medium') return 'bg-[#C68A8F]';
    return 'bg-[#C9B8A6]';
  };

  const getStrengthText = () => {
    if (!password) return '';
    if (passwordValidation.strength === 'strong') return 'Segura';
    if (passwordValidation.strength === 'medium') return 'Aceptable';
    return 'Débil';
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to reveal any pending validation errors
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });

    const isFullNameValid = isValidFullName(fullName);
    const isEmailValid = isValidEmail(email);
    const isPassValid = passwordValidation.isValid;
    const isConfirmValid = confirmPassword === password && confirmPassword.length > 0;

    if (!isFullNameValid || !isEmailValid || !isPassValid || !isConfirmValid || !acceptTerms) {
      setToast({
        type: 'error',
        title: 'Verifica los campos',
        message: 'Por favor completa todos los campos requeridos correctamente.',
      });
      return;
    }

    const result = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (result.success) {
      setToast({
        type: 'success',
        title: '¡Registro exitoso!',
        message: `Bienvenido/a ${result.user?.fullName || fullName}. Redirigiendo a tu onboarding...`,
      });

      // Smooth automatic redirection to the onboarding flow
      setTimeout(() => {
        navigate('/onboarding', {
          state: {
            newUser: result.user || { fullName, email, role },
            role,
          },
        });
      }, 1400);
    } else {
      setToast({
        type: 'error',
        title: 'Error de registro',
        message: result.error || 'No se pudo completar el registro. Inténtalo nuevamente.',
      });
    }
  };

  const handleOAuthRegister = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    window.location.href = `${apiUrl}/v1/auth/${provider}?role=${role}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto lg:mx-0">
      {/* Toast Notification Container */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Title & Subtitle */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#5A0F24] tracking-tight mb-1.5">
          Crear Cuenta
        </h1>
        <p className="text-xs md:text-sm text-[#5A0F24]/75">
          Únete a la plataforma líder para freelancers y contratantes independientes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Step 1: Visual Role Selector (Cliente vs Freelancer) */}
        <RoleSelector
          selectedRole={role}
          onChange={(newRole) => setRole(newRole)}
        />

        {/* Step 2: Full Name Input */}
        <Input
          id="fullName"
          label="Nombre Completo"
          badge="Requerido"
          type="text"
          required
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            markTouched('fullName');
          }}
          onBlur={() => markTouched('fullName')}
          error={fullNameError}
          placeholder="ej. Sofía Ramírez"
          icon={User}
        />

        {/* Step 3: Email Input */}
        <Input
          id="email"
          label="Correo electrónico"
          badge="Requerido"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            markTouched('email');
          }}
          onBlur={() => markTouched('email')}
          error={emailError}
          placeholder="ej. sofia@estudio.com"
          icon={Mail}
        />

        {/* Step 4: Password Input with Strength Meter */}
        <div>
          <Input
            id="password"
            label="Contraseña"
            badge="Min. 8 caracteres"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              markTouched('password');
            }}
            onBlur={() => markTouched('password')}
            error={passwordError}
            placeholder="Crea una contraseña segura"
            icon={Lock}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#C68A8F] hover:text-[#5A0F24] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-[#8C2C45]" /> : <Eye className="w-4 h-4 text-[#8C2C45]" />}
              </button>
            }
          />

          {/* Real-time reactive password strength bar */}
          {password && (
            <div className="mt-2 px-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#5A0F24]/70">Seguridad:</span>
                <span className="font-semibold text-[#8C2C45]">
                  {getStrengthText()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#C9B8A6]/30 rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                  style={{
                    width: `${Math.min(100, Math.max(25, (passwordValidation.score / 4) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Confirm Password Input */}
        <Input
          id="confirmPassword"
          label="Confirmar Contraseña"
          badge="Requerido"
          type={showConfirmPassword ? 'text' : 'password'}
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            markTouched('confirmPassword');
          }}
          onBlur={() => markTouched('confirmPassword')}
          error={confirmPasswordError}
          placeholder="Repite tu contraseña"
          icon={Lock}
          rightAction={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#C68A8F] hover:text-[#5A0F24] transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 text-[#8C2C45]" /> : <Eye className="w-4 h-4 text-[#8C2C45]" />}
            </button>
          }
        />

        {/* Step 6: Terms and Conditions Agreement */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5A0F24]/85 select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                markTouched('acceptTerms');
              }}
              className="mt-0.5 w-4 h-4 rounded border-[#C9B8A6] text-[#8C2C45] focus:ring-[#8C2C45]/20 accent-[#8C2C45] cursor-pointer"
            />
            <span>
              Acepto los{' '}
              <a
                href="#terminos"
                className="font-semibold text-[#8C2C45] hover:underline"
              >
                Términos del Servicio
              </a>{' '}
              y la{' '}
              <a
                href="#privacidad"
                className="font-semibold text-[#8C2C45] hover:underline"
              >
                Política de Privacidad
              </a>
              .
            </span>
          </label>
          {termsError && (
            <p className="mt-1.5 text-[11px] font-medium text-[#8C2C45] px-1">
              • {termsError}
            </p>
          )}
        </div>

        {/* Step 7: Submit Register Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 group bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-[0_8px_20px_-4px_rgba(140,44,69,0.35)]"
        >
          <span>{loading ? 'Creando tu cuenta...' : 'Crear mi cuenta'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      {/* Social Registration Separator */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#C9B8A6]/40" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-[#f6f2ee] px-3 text-[#5A0F24]/60">
            O regístrate con
          </span>
        </div>
      </div>

      {/* Social Auth Buttons (Apple & Google) */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          onClick={() => handleOAuthRegister('apple')}
          className="border-[#C9B8A6]/60 hover:bg-[#F3EFE6]/50"
        >
          <svg className="w-4 h-4 fill-current text-[#5A0F24]" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.96-14.42-7.2-11.08-12.7-23.77-16.5-38.07-3.8-14.3-5.7-27.4-5.7-39.3 0-14.76 3.69-26.86 11.06-36.3 7.37-9.44 16.73-14.28 28.08-14.52 4.35 0 9.38 1.15 15.08 3.46 5.7 2.3 9.4 3.51 11.1 3.62 2.35-.22 6.33-1.5 11.93-3.84 5.6-2.34 10.45-3.41 14.55-3.21 11.7.67 21.32 4.78 28.87 12.33-10.43 6.31-15.54 15.08-15.34 26.3.2 8.7 3.53 16.14 10 22.31 6.47 6.17 14.19 9.87 23.16 11.1-2.47 7.6-5.63 15.38-9.47 23.33zM119.22 31.84c0-7.39 2.66-14.35 7.98-20.89 5.32-6.53 11.89-10.51 19.7-11.95.89 7.39-1.46 14.34-7.05 20.86-5.59 6.52-12.46 10.51-20.63 11.98z"/>
          </svg>
          <span className="text-[#5A0F24]">Apple</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleOAuthRegister('google')}
          className="border-[#C9B8A6]/60 hover:bg-[#F3EFE6]/50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="text-[#5A0F24]">Google</span>
        </Button>
      </div>

      {/* Navigation link back to Login */}
      <div className="mt-6 text-center text-xs text-[#5A0F24]/80">
        ¿Ya tienes una cuenta?{' '}
        <Link
          to="/login"
          className="font-bold text-[#8C2C45] hover:text-[#5A0F24] hover:underline transition-colors"
        >
          Inicia Sesión
        </Link>
      </div>
    </div>
  );
}
