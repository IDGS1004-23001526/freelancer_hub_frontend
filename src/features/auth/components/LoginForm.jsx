import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Lock, Eye, EyeOff, ArrowRight, HelpCircle } from 'lucide-react';
import Input from '../../ui/Input.jsx';
import Button from '../../ui/Button.jsx';
import { useAuthStore } from '../../../stores/auth.store.js';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { login, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const result = await login({ email, password });
    if (result.success) {
      setFeedback({ type: 'success', text: `¡Bienvenido de vuelta, ${result.user.fullName}!` });
    } else {
      setFeedback({ type: 'error', text: result.error });
    }
  };

  const handleOAuthLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    window.location.href = `${apiUrl}/v1/auth/${provider}`;
  };

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Correo Electrónico */}
        <Input
          id="email"
          label="Correo electrónico"
          badge="Requerido"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ej. sofia@estudio.com"
          icon={AtSign}
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
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introduce tu contraseña"
          icon={Lock}
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

      {/* Botones de Autenticación Social (Apple y Google) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Botón Apple */}
        <Button
          variant="secondary"
          onClick={() => handleOAuthLogin('apple')}
        >
          <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.96-14.42-7.2-11.08-12.7-23.77-16.5-38.07-3.8-14.3-5.7-27.4-5.7-39.3 0-14.76 3.69-26.86 11.06-36.3 7.37-9.44 16.73-14.28 28.08-14.52 4.35 0 9.38 1.15 15.08 3.46 5.7 2.3 9.4 3.51 11.1 3.62 2.35-.22 6.33-1.5 11.93-3.84 5.6-2.34 10.45-3.41 14.55-3.21 11.7.67 21.32 4.78 28.87 12.33-10.43 6.31-15.54 15.08-15.34 26.3.2 8.7 3.53 16.14 10 22.31 6.47 6.17 14.19 9.87 23.16 11.1-2.47 7.6-5.63 15.38-9.47 23.33zM119.22 31.84c0-7.39 2.66-14.35 7.98-20.89 5.32-6.53 11.89-10.51 19.7-11.95.89 7.39-1.46 14.34-7.05 20.86-5.59 6.52-12.46 10.51-20.63 11.98z"/>
          </svg>
          <span>Apple</span>
        </Button>

        {/* Botón Google */}
        <Button
          variant="secondary"
          onClick={() => handleOAuthLogin('google')}
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
          <span>Google</span>
        </Button>
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
