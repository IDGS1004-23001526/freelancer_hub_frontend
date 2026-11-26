import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Users,
  UserCheck,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Plus,
  Search,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const isClient = user?.role === 'CLIENT' || user?.role === 'CLIENTE';
  const displayName = user?.fullName || (isClient ? 'Sofía Ramírez' : 'Freelancer');
  const displayEmail = user?.email || (isClient ? 'sofia@estudionexus.com' : 'usuario@freelancerhub.com');
  const portalBadge = isClient ? 'Portal Clientes' : 'Portal Freelancer';
  const roleStatusText = isClient ? 'Cliente Activo' : 'Freelancer Activo';

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const clientNavItems = [
    {
      label: 'Inicio',
      fullLabel: 'Dashboard General / Feed',
      path: '/dashboard',
      icon: Home,
      exact: true,
    },
    {
      label: 'Mi red',
      fullLabel: 'Mi red de contactos',
      path: '/network',
      icon: Users,
    },
    {
      label: 'Convocatorias',
      fullLabel: 'Catálogo de Convocatorias',
      path: '/projects',
      icon: Briefcase,
    },
    {
      label: 'Candidatos',
      fullLabel: 'Candidatos Postulados',
      path: '/candidates',
      icon: UserCheck,
    },
    {
      label: 'Hitos',
      fullLabel: 'Tablero de Hitos y Pagos',
      path: '/contracts',
      icon: CheckCircle2,
    },
    {
      label: 'Pagos',
      fullLabel: 'Métodos de Pago y Billetera',
      path: '/payment-methods',
      icon: CreditCard,
    },
    {
      label: 'Mensajes',
      fullLabel: 'Mensajes y Chat',
      path: '/messages',
      icon: MessageSquare,
    },
  ];

  const freelancerNavItems = [
    {
      label: 'Inicio',
      fullLabel: 'Feed de Inicio y Comunidad',
      path: '/dashboard',
      icon: Home,
      exact: true,
    },
    {
      label: 'Mi red',
      fullLabel: 'Mi red de colaboradores',
      path: '/network',
      icon: Users,
    },
    {
      label: 'Convocatorias',
      fullLabel: 'Explorar Convocatorias Abiertas',
      path: '/projects',
      icon: Briefcase,
    },
    {
      label: 'Mis Hitos',
      fullLabel: 'Tablero de Entregables e Hitos',
      path: '/contracts',
      icon: CheckCircle2,
    },
    {
      label: 'Billetera',
      fullLabel: 'Billetera y Fondos en Custodia',
      path: '/payment-methods',
      icon: CreditCard,
    },
    {
      label: 'Mensajes',
      fullLabel: 'Mensajes y Negociación',
      path: '/messages',
      icon: MessageSquare,
    },
  ];

  const navItems = isClient ? clientNavItems : freelancerNavItems;

  return (
    <div className="min-h-screen bg-[#f6f2ee] text-[#2b1b1e] flex flex-col justify-between selection:bg-[#8C2C45]/20 selection:text-[#5A0F24] overflow-x-hidden">
      {/* Top Navbar Principal Armonizado (Estilo Wine & Cream) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#C9B8A6]/40 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Lado Izquierdo: Logo Completo + Buscador Rápido */}
          <div className="flex items-center gap-3 xl:gap-5 min-w-0">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#5A0F24] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(90,15,36,0.25)] group-hover:scale-105 transition-transform shrink-0">
                <span className="font-black text-sm tracking-tighter text-[#F3EFE6]">
                  F<span className="text-[#C68A8F]">H</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-[#5A0F24] leading-none">
                  Freelance
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8C2C45] mt-0.5">
                  {portalBadge}
                </span>
              </div>
            </Link>

            {/* Buscador de escritorio integrado */}
            <div className="hidden xl:flex items-center relative w-48 2xl:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9B8A6]" />
              <input
                type="text"
                placeholder="Buscar..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(
                      `/projects?search=${encodeURIComponent(
                        e.target.value.trim()
                      )}`
                    );
                  }
                }}
                className="w-full bg-[#F3EFE6] text-xs text-[#2b1b1e] placeholder-[#5A0F24]/50 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white transition border border-[#C9B8A6]/30"
              />
            </div>
          </div>

          {/* Menú de Navegación Vertical Limpio (Estilo Dashboard / LinkedIn) */}
          <nav
            aria-label="Menú Principal"
            className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path ||
                  (item.path === '/projects' &&
                    location.pathname.startsWith('/projects') &&
                    location.pathname !== '/projects/new') ||
                  (item.path !== '/dashboard' &&
                    location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.fullLabel}
                  className={`flex flex-col items-center justify-center py-1 px-1.5 lg:px-2.5 text-[11px] border-b-2 transition group ${
                    isActive
                      ? 'text-[#8C2C45] border-[#8C2C45] font-bold'
                      : 'text-[#5A0F24]/70 hover:text-[#5A0F24] border-transparent font-semibold'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Lado Derecho: Botón de Acción según Rol + Dropdown "Yo ▾" */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isClient ? (
              <Link
                to="/projects/new"
                data-testid="btn-nueva-convocatoria"
                className="py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] active:bg-[#481a27] text-white text-xs font-bold shadow-[0_4px_14px_rgba(140,44,69,0.35)] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Nueva Convocatoria</span>
                <span className="sm:hidden">Nueva</span>
              </Link>
            ) : (
              <Link
                to="/projects"
                className="py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] active:bg-[#481a27] text-white text-xs font-bold shadow-[0_4px_14px_rgba(140,44,69,0.35)] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Explorar Convocatorias</span>
                <span className="sm:hidden">Explorar</span>
              </Link>
            )}

            {/* Menú de Usuario Yo ▾ con Avatar */}
            <div className="relative pl-1 sm:pl-2 border-l border-[#C9B8A6]/40 shrink-0">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                data-testid="navbar-user-profile"
                className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#8C2C45] text-[11px] font-semibold py-1 px-1.5 sm:px-2 group cursor-pointer border-b-2 border-transparent transition"
                title="Cuenta y opciones"
              >
                <div className="relative shrink-0 mb-0.5">
                  <div
                    data-testid="navbar-user-avatar"
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-[#F3EFE6] font-extrabold text-[10px] flex items-center justify-center shadow-xs ring-1 ring-[#C9B8A6] group-hover:ring-[#8C2C45]"
                  >
                    {getInitials(displayName)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] leading-tight">
                  <span>Yo</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#C9B8A6]/40 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#C9B8A6]/20">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-[#F3EFE6] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {getInitials(displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        data-testid="navbar-user-name"
                        className="text-xs font-bold text-[#5A0F24] truncate"
                      >
                        {displayName}
                      </h4>
                      <p className="text-[11px] text-[#2b1b1e]/60 truncate">
                        {displayEmail}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8C2C45] mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{roleStatusText}</span>
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#5A0F24] hover:bg-[#F3EFE6] flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#8C2C45]" />
                      <span>Ver perfil</span>
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#5A0F24] hover:bg-[#F3EFE6] flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8C2C45]" />
                      <span>Mi Onboarding</span>
                    </Link>
                  </div>

                  <div className="pt-2 mt-1 border-t border-[#C9B8A6]/20">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-red-700 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Navigation Bar con scroll horizontal limpio sin desborde */}
        <div className="flex md:hidden items-center px-3 sm:px-4 py-2 bg-[#F3EFE6]/90 backdrop-blur-md border-t border-[#C9B8A6]/30 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-full min-w-0">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path ||
                  (item.path === '/projects' &&
                    location.pathname.startsWith('/projects') &&
                    location.pathname !== '/projects/new') ||
                  (item.path !== '/dashboard' &&
                    location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#8C2C45] text-white shadow-2xs'
                      : 'text-[#5A0F24]/80 hover:bg-[#C9B8A6]/20'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer consistente con AuthLayout */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-[#ece3de]/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9a868a]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8C2C45]" />
          <span>© 2026 Freelance Hub • Pagos protegidos con custodia Escrow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#C68A8F]" />
          <span>Talento independiente. Grandes posibilidades.</span>
        </div>
      </footer>
    </div>
  );
}