import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  CreditCard,
  Wallet,
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';
import { useProjectStore } from '../stores/project.store.js';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { wallet, addFunds } = useProjectStore();

  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayName = user?.fullName || 'Sofía Ramírez';
  const displayEmail = user?.email || 'sofia@estudionexus.com';

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: wallet.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Catálogo de Convocatorias',
      path: '/projects',
      icon: FolderKanban,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f2ee] text-[#2b1b1e] flex flex-col justify-between selection:bg-[#8C2C45]/20 selection:text-[#5A0F24]">
      {/* Top Navbar Principal para Clientes */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#C9B8A6]/50 shadow-[0_4px_20px_-10px_rgba(90,15,36,0.08)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
          {/* Left: Brand + Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 bg-[#5A0F24] rounded-2xl flex items-center justify-center shadow-[0_6px_16px_rgba(90,15,36,0.25)] group-hover:scale-105 transition-transform">
                <span className="font-black text-sm tracking-tighter text-[#F3EFE6]">
                  F<span className="text-[#C68A8F]">H</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-extrabold tracking-tight text-[#5A0F24] leading-none">
                  Freelance
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C2C45] mt-0.5">
                  Portal Clientes
                </span>
              </div>
            </Link>

            {/* Desktop Menu Links */}
            <nav
              aria-label="Menú Principal"
              className="hidden md:flex items-center gap-1.5 pl-4 border-l border-[#C9B8A6]/40"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/projects' &&
                    location.pathname.startsWith('/projects') &&
                    location.pathname !== '/projects/new');

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-[#F3EFE6] text-[#5A0F24] border border-[#C68A8F]/50 shadow-2xs'
                        : 'text-[#5A0F24]/70 hover:text-[#5A0F24] hover:bg-[#F3EFE6]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#8C2C45]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Saldo/Tarjeta + Botón "+ Nueva Convocatoria" + Avatar/Nombre */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Widget de Saldo / Tarjeta Escrow */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowWalletMenu((prev) => !prev);
                  setShowUserMenu(false);
                }}
                data-testid="navbar-wallet-card"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#F3EFE6]/90 hover:bg-[#F3EFE6] border border-[#C9B8A6]/60 transition-all cursor-pointer shadow-2xs"
                title="Saldo y Tarjeta vinculada para Escrow"
              >
                <div className="w-8 h-8 rounded-xl bg-[#8C2C45]/15 text-[#8C2C45] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#5A0F24]">
                      {formatMoney(wallet.balance)}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      •••• {wallet.cardLast4}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-[#5A0F24]/70 leading-tight">
                    Saldo / {wallet.cardBrand}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C2C45] hidden sm:block" />
              </button>

              {/* Popover de Saldo y Tarjeta */}
              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_15px_35px_-10px_rgba(90,15,36,0.2)] border border-[#C9B8A6]/60 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#C9B8A6]/30">
                    <span className="text-xs font-bold text-[#5A0F24] flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#8C2C45]" />
                      Billetera & Tarjeta Escrow
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verificada
                    </span>
                  </div>

                  <div className="py-3 space-y-2.5">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#5A0F24] to-[#8C2C45] text-white">
                      <div className="flex items-center justify-between text-[10px] text-[#F3EFE6]/80 mb-1">
                        <span>{wallet.cardBrand}</span>
                        <span>•••• •••• •••• {wallet.cardLast4}</span>
                      </div>
                      <p className="text-lg font-extrabold tracking-tight">
                        {formatMoney(wallet.balance)}
                      </p>
                      <p className="text-[10px] text-[#F3EFE6]/80 mt-0.5">
                        En custodia (Escrow): {formatMoney(wallet.escrowLocked)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addFunds(1000);
                        setShowWalletMenu(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#F3EFE6] hover:bg-[#e8dfd1] text-[#5A0F24] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#8C2C45]" />
                      <span>Abonar +$1,000 USD de prueba</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Visible: + Nueva Convocatoria */}
            <Link
              to="/projects/new"
              data-testid="btn-nueva-convocatoria"
              className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] active:bg-[#481a27] text-white text-xs sm:text-sm font-bold shadow-[0_6px_20px_-4px_rgba(140,44,69,0.4)] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nueva Convocatoria</span>
            </Link>

            {/* Perfil del Cliente: Avatar + Nombre */}
            <div className="relative pl-1 sm:pl-2 border-l border-[#C9B8A6]/40">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu((prev) => !prev);
                  setShowWalletMenu(false);
                }}
                data-testid="navbar-user-profile"
                className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-[#F3EFE6]/70 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <div
                    data-testid="navbar-user-avatar"
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-[#F3EFE6] font-extrabold text-xs flex items-center justify-center shadow-xs border border-[#C68A8F]/40"
                  >
                    {getInitials(displayName)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="text-left hidden lg:block">
                  <p
                    data-testid="navbar-user-name"
                    className="text-xs font-extrabold text-[#5A0F24] leading-tight truncate max-w-[140px]"
                  >
                    {displayName}
                  </p>
                  <p className="text-[10px] font-semibold text-[#8C2C45] flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Cliente Activo</span>
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#5A0F24]/60 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_15px_35px_-10px_rgba(90,15,36,0.2)] border border-[#C9B8A6]/60 p-3 z-50">
                  <div className="px-3 py-2 border-b border-[#C9B8A6]/30 mb-2">
                    <p className="text-xs font-extrabold text-[#5A0F24] truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#5A0F24]/65 truncate">
                      {displayEmail}
                    </p>
                  </div>

                  <Link
                    to="/onboarding"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#5A0F24] hover:bg-[#F3EFE6] flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#8C2C45]" />
                    <span>Mi Onboarding / Perfil</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C2C45] hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Navigation Bar */}
        <div className="flex md:hidden items-center justify-between px-4 py-2 bg-[#F3EFE6]/60 border-t border-[#C9B8A6]/30 text-xs">
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    isActive
                      ? 'bg-[#8C2C45] text-white'
                      : 'text-[#5A0F24]/80 hover:bg-[#C9B8A6]/20'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#5A0F24]">
            <CreditCard className="w-3.5 h-3.5 text-[#8C2C45]" />
            <span>{formatMoney(wallet.balance)}</span>
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
