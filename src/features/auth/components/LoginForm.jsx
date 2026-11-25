import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AtSign, Lock, Eye, EyeOff, ArrowRight, HelpCircle } from 'lucide-react';
import Input from '../../ui/Input.jsx';
import Button from '../../ui/Button.jsx';
import Toast from '../../ui/Toast.jsx';
import { useAuthStore } from '../../../stores/auth.store.js';
import { profileApi } from '../../../api/profile.api.js';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [toast, setToast] = useState(null);

  const { login, googleLogin, loading } = useAuthStore();

  const validateField = (field, value) => {
    if (field === 'email') {
      const trimmed = value.trim();
      if (!trimmed) return 'El correo electrónico es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Introduce un correo electrónico válido.';
      }
    }
    if (field === 'password') {
      if (!value) return 'La contraseña es obligatoria.';
      if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return '';
  };

  const handleBlur = (field, value) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const nextErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setErrors(nextErrors);
    const errorMessages = Object.values(nextErrors).filter(Boolean);
    if (errorMessages.length > 0) {
      setToast({
        type: 'error',
        title: 'Verifica los campos',
        message: errorMessages.join(' '),
      });
      return;
    }

    const result = await login({ email: email.trim(), password });
    if (result.success) {
      setFeedback({ type: 'success', text: `¡Bienvenido de vuelta, ${result.user?.fullName || ''}!` });
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } else {
      const rawError = result.error || '';
      const errorMsg = /network error|failed to fetch/i.test(rawError)
        ? 'No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.'
        : rawError || 'Correo o contraseña incorrectos.';
      setFeedback({ type: 'error', text: errorMsg });
      setToast({
        type: 'error',
        title: 'Error al iniciar sesión',
        message: errorMsg,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setFeedback(null);
    const token = credentialResponse.credential;
    if (!token) return;

    const result = await googleLogin(token);
    if (result.success) {
      let targetPath = '/dashboard';
      let navState;
      try {
        const status = await profileApi.getOnboardingStatus();
        if (!status?.data?.isFullyCompleted) {
          targetPath = '/onboarding';
          navState = {
            newUser: result.user,
            role: result.user?.role || 'FREELANCER',
          };
        }
      } catch {
        // Si falla la consulta de onboarding, continuamos al dashboard
      }
      setFeedback({ type: 'success', text: `¡Bienvenido, ${result.user.fullName}!` });
      setTimeout(() => {
        navigate(targetPath, navState ? { state: navState } : undefined);
      }, 800);
    } else {
      const rawError = result.error || '';
      const errorMsg = /network error|failed to fetch/i.test(rawError)
        ? 'No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.'
        : rawError || 'Correo o contraseña incorrectos.';
      setFeedback({ type: 'error', text: errorMsg });
      setToast({
        type: 'error',
        title: 'Error al iniciar sesión',
        message: errorMsg,
      });
    }
  };

  const handleGoogleError = () => {
    setFeedback({ type: 'error', text: 'Error al autenticar con Google. Inténtalo de nuevo.' });
  };

  const handleOAuthLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    window.location.href = `${apiUrl}/v1/auth/${provider}`;
  };

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {/* Título Principal */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#3a1420] tracking-tight mb-5">
        Iniciar Sesión
      </h1>

      {/* Banner Destacado / Callout Rosado Suave */}
      <div className="bg-gradient-to-r from-[#fff3f4] to-[#fdedef] border border-[#f7dee2]/80 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="w-5 h-1.5 bg-[#e38596] rounded-full mb-2.5" />
        <h3 className="text-sm font-bold text-[#451825] mb-1">
          Estás a un paso de tu próximo gran proyecto
        </h3>
        <p className="text-xs text-[#7e6067] leading-relaxed">
          Vuelve a conectar con clientes de alto impacto o impulsa tus servicios freelance hacia el siguiente nivel.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Campo Correo Electrónico */}
        <Input
          id="email"
          label="Correo electrónico"
          badge="Requerido"
          type="email"
          required
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            if (errors.email) setErrors((prev) => ({ ...prev, email: validateField('email', val) }));
          }}
          onBlur={() => handleBlur('email', email)}
          placeholder="ej. sofia@estudio.com"
          icon={AtSign}
          error={errors.email}
        />

        {/* Campo Contraseña */}
        <Input
          id="password"
          label="Contraseña"
          rightLink={
            <a
              href="#recuperar"
              className="text-[11px] font-semibold text-[#73293e] hover:text-[#451825] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          }
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(e) => {
            const val = e.target.value;
            setPassword(val);
            if (errors.password) setErrors((prev) => ({ ...prev, password: validateField('password', val) }));
          }}
          onBlur={() => handleBlur('password', password)}
          placeholder="Introduce tu contraseña"
          icon={Lock}
          error={errors.password}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#9a868a] hover:text-[#4a1c29] transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-[#8a6871]" /> : <Eye className="w-4 h-4 text-[#8a6871]" />}
            </button>
          }
        />

        {/* Botón Principal Iniciar Sesión */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 group"
        >
          <span>{loading ? 'Accediendo...' : 'Iniciar sesión'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      {/* Feedback contextual */}
      {feedback && (
        <div
          className={`mt-3 text-center text-xs font-medium py-2 px-3 rounded-lg border ${
            feedback.type === 'success'
              ? 'bg-[#edfcf2] text-[#0f766e] border-[#bbf7d0]'
              : 'bg-[#fdeeee] text-[#73293e] border-[#f5cbd4]'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Separador "O CONTINÚA CON" */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e8deda]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-[#f6f2ee] px-3 text-[#947f84]">
            O continúa con
          </span>
        </div>
      </div>

      {/* Botón Google */}
        <div className="flex justify-center items-center w-full [&>div]:w-full [&_iframe]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            size="large"
            text="signin_with"
            locale="es"
          />
        </div>

      {/* Enlace para registrarse */}
      <div className="mt-6 text-center text-xs text-[#7d686d]">
        ¿Aún no tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-bold text-[#6e2c3e] hover:underline transition-colors"
        >
          Regístrate
        </Link>
      </div>

      {/* Enlaces de soporte y términos */}
      <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[#9a868a]">
        <a href="#soporte" className="hover:text-[#4a1c29] flex items-center gap-1 transition-colors">
          <HelpCircle className="w-3 h-3 text-[#9a868a]" />
          Centro de ayuda
        </a>
        <span>•</span>
        <a href="#privacidad" className="hover:text-[#4a1c29] flex items-center gap-1 transition-colors">
          <Lock className="w-3 h-3 text-[#9a868a]" />
          Privacidad y Términos
        </a>
      </div>
    </div>
  );
}
