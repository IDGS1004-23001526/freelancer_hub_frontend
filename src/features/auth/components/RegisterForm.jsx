import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
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
  const { register, googleLogin, loading } = useAuthStore();

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
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.freelancerhub.org/api';
    window.location.href = `${apiUrl}/v1/auth/${provider}?role=${role}`;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) return;

    const result = await googleLogin(token, role, 'register');
    if (result.success) {
      setToast({
        type: 'success',
        title: '¡Registro con Google exitoso!',
        message: `Bienvenido/a ${result.user?.fullName || ''}. Redirigiendo a tu onboarding...`,
      });

      setTimeout(() => {
        navigate('/onboarding', {
          state: {
            newUser: result.user,
            role: result.user?.role || role,
          },
        });
      }, 1000);
    } else {
      setToast({
        type: 'error',
        title: 'Error de autenticación',
        message: result.error || 'No se pudo conectar con Google.',
      });
    }
  };

  const handleGoogleError = () => {
    setToast({
      type: 'error',
      title: 'Error de Google',
      message: 'No se pudo completar la autenticación con Google. Inténtalo de nuevo.',
    });
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

        {/* Google Button */}
        <div className="flex justify-center items-center w-full [&>div]:w-full [&_iframe]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            size="large"
            text="signup_with"
            locale="es"
          />
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
