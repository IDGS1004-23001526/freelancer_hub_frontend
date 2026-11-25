import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  Users,
  FileCheck2,
  CheckCircle2,
  CreditCard,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';
import { useChatStore } from '../stores/chat.store.js';
import { profileApi } from '../api/profile.api.js';
import ProjectChatDrawer from '../features/chat/components/ProjectChatDrawer.jsx';

export default function DashboardLayout({
  children,
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { conversations, openDrawer, loadConversations } = useChatStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [profileMeta, setProfileMeta] = useState({
    professionalTitle: '',
    avatarUrl: '/avatar-sample.jpg',
  });

  const isClient = user?.role === 'CLIENT' || user?.role === 'CLIENTE';
  const currentUser = user || {
    id: 'usr_me',
    fullName: isClient ? 'Cliente' : 'Freelancer',
    email: '',
    role: isClient ? 'CLIENT' : 'FREELANCER',
  };

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    let cancelled = false;
    profileApi
      .getMyProfile()
      .then((res) => {
        if (cancelled || !res?.data) return;
        const p = res.data;
        setProfileMeta((prev) => ({
          professionalTitle: p.professionalTitle || prev.professionalTitle,
          avatarUrl: p.avatarUrl || prev.avatarUrl,
        }));
      })
      .catch(() => {
        // Mantiene valores por defecto si aún no hay perfil cargado
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && !onSearchChange && localSearch.trim()) {
      navigate(`/projects?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const handleOpenChatDrawer = () => {
    loadConversations();
    if (conversations.length > 0) {
      const firstConv = conversations[0];
      openDrawer({
        conversationId: firstConv.id,
        projectId: firstConv.projectId ?? null,
        projectName: firstConv.projectName ?? null,
        peerName: firstConv.peerName ?? null,
      });
    } else {
      openDrawer({
        conversationId: null,
        projectId: null,
        projectName: null,
        peerName: null,
      });
    }
  };

  const navLinkClass = (active) =>
    `flex flex-col items-center justify-center text-[11px] py-1 px-2 border-b-2 transition shrink-0 ${
      active
        ? 'text-[#8C2C45] border-[#8C2C45] font-bold'
        : 'text-[#5A0F24]/70 hover:text-[#5A0F24] border-transparent font-semibold'
    }`;

  const isDashboard =
    location.pathname === '/dashboard' ||
    location.pathname === '/social' ||
    location.pathname === '/client-dashboard';
  const isNetwork =
    location.pathname === '/network' || location.pathname === '/onboarding';
  const isProjects =
    location.pathname === '/projects' ||
    location.pathname === '/feed' ||
    location.pathname.startsWith('/projects/');
  const isMyProposals =
    location.pathname === '/my-proposals' ||
    location.pathname === '/postulations';
  const isCandidates =
    location.pathname === '/candidates' ||
    location.pathname.includes('/candidates');
  const isContracts =
    location.pathname === '/contracts' ||
    location.pathname.startsWith('/contracts/') ||
    location.pathname === '/kanban';
  const isPayments =
    location.pathname === '/payment-methods' ||
    location.pathname === '/payments' ||
    location.pathname === '/cards';
  const isMessages =
    location.pathname === '/messages' ||
    location.pathname.startsWith('/messages/');

  const defaultPlaceholder = isClient
    ? 'Buscar convocatorias o candidatos...'
    : 'Buscar...';

  return (
    <div className="min-h-screen bg-[#f6f2ee] text-[#2b1b1e] font-sans antialiased">
      {/* NAVBAR SUPERIOR UNIFICADO (ESTILO FREELANCER WINE & CREAM) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C9B8A6]/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo y Buscador */}
          <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
            <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#8C2C45] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-[#5A0F24] transition">
                FH
              </div>
            </Link>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9B8A6]" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchInput}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder || defaultPlaceholder}
                className="w-full bg-[#F3EFE6] text-sm text-[#2b1b1e] placeholder-[#5A0F24]/50 rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white transition border border-[#C9B8A6]/30"
              />
            </div>
          </div>

          {/* Menú de Navegación estático según rol */}
          <nav aria-label="Menú Principal" className="flex items-center gap-1 sm:gap-5 shrink-0">
            {isClient ? (
              <>
                <Link to="/dashboard" className={navLinkClass(isDashboard)}>
                  <Home className="w-5 h-5 mb-0.5" />
                  <span>Inicio</span>
                </Link>
                <Link to="/projects" className={navLinkClass(isProjects)}>
                  <Briefcase className="w-5 h-5 mb-0.5" />
                  <span>Convocatorias</span>
                </Link>
                <Link to="/candidates" className={navLinkClass(isCandidates)}>
                  <Users className="w-5 h-5 mb-0.5" />
                  <span className="hidden sm:inline">Candidatos</span>
                </Link>
                <Link to="/contracts" className={navLinkClass(isContracts)}>
                  <CheckCircle2 className="w-5 h-5 mb-0.5" />
                  <span className="hidden sm:inline">Hitos</span>
                </Link>
                <Link to="/payment-methods" className={navLinkClass(isPayments)}>
                  <CreditCard className="w-5 h-5 mb-0.5" />
                  <span className="hidden md:inline">Pagos</span>
                </Link>
                <Link to="/messages" className={navLinkClass(isMessages)}>
                  <MessageSquare className="w-5 h-5 mb-0.5" />
                  <span className="hidden md:inline">Mensajes</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={navLinkClass(isDashboard)}>
                  <Home className="w-5 h-5 mb-0.5" />
                  <span>Inicio</span>
                </Link>
                <Link to="/network" className={navLinkClass(isNetwork)}>
                  <Users className="w-5 h-5 mb-0.5" />
                  <span className="hidden sm:inline">Mi red</span>
                </Link>
                <Link to="/projects" className={navLinkClass(isProjects)}>
                  <Briefcase className="w-5 h-5 mb-0.5" />
                  <span>Proyectos</span>
                </Link>
                <Link
                  to="/my-proposals"
                  data-testid="nav-mis-postulaciones"
                  className={navLinkClass(isMyProposals)}
                >
                  <FileCheck2 className="w-5 h-5 mb-0.5" />
                  <span className="hidden sm:inline">Postulaciones</span>
                </Link>
                <button
                  type="button"
                  onClick={handleOpenChatDrawer}
                  className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-5 h-5 mb-0.5" />
                  <span className="hidden md:inline">Mensajes</span>
                </button>
                <button
                  type="button"
                  className="hidden sm:flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition cursor-pointer shrink-0"
                >
                  <Bell className="w-5 h-5 mb-0.5" />
                  <span className="hidden md:inline">Avisos</span>
                </button>
              </>
            )}

            {/* Avatar Dropdown (Yo ▾) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                data-testid="navbar-user-profile"
                className={`flex flex-col items-center justify-center text-[11px] py-1 px-2 border-b-2 group cursor-pointer transition ${
                  location.pathname === '/profile'
                    ? 'text-[#8C2C45] border-[#8C2C45] font-bold'
                    : 'text-[#5A0F24]/70 hover:text-[#8C2C45] border-transparent font-semibold'
                }`}
                title="Cuenta y opciones"
              >
                <img
                  src={profileMeta.avatarUrl}
                  alt="Yo"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#C9B8A6] group-hover:ring-[#8C2C45]"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span>Yo ▾</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#C9B8A6]/40 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#C9B8A6]/20">
                    <img
                      src={profileMeta.avatarUrl}
                      alt="Yo"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#C9B8A6]"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#5A0F24] truncate">
                        {currentUser.fullName}
                      </h4>
                      <p className="text-[10px] text-[#2b1b1e]/60 truncate">
                        {profileMeta.professionalTitle ||
                          (isClient ? 'Cuenta Cliente' : 'Freelancer')}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="mt-2.5 block w-full text-center py-1.5 px-3 rounded-xl border border-[#8C2C45] text-[#8C2C45] hover:bg-[#F3EFE6] text-xs font-bold transition"
                  >
                    Ver perfil
                  </Link>

                  {isClient ? (
                    <Link
                      to="/projects/new"
                      onClick={() => setIsUserMenuOpen(false)}
                      data-testid="btn-nueva-convocatoria"
                      className="mt-2 w-full py-1.5 px-3 rounded-xl bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#C68A8F]/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#8C2C45]" />
                      <span>Nueva convocatoria</span>
                    </Link>
                  ) : (
                    <Link
                      to="/my-proposals"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="mt-2 block w-full text-center py-1.5 px-3 rounded-xl bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#C68A8F]/20 text-xs font-bold transition"
                    >
                      Mis postulaciones
                    </Link>
                  )}

                  <div className="pt-2 mt-2 border-t border-[#C9B8A6]/20">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-red-700 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

      <ProjectChatDrawer />
    </div>
  );
}
