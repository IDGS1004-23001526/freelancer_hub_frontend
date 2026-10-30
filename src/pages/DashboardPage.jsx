import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  MessageSquare,
  Bell,
  ShieldCheck,
  Search,
  Image as ImageIcon,
  Send,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  Clock,
  DollarSign,
  CheckCircle2,
  Lock,
  Plus,
  LogOut,
  TrendingUp,
  MoreHorizontal,
  User,
  ExternalLink,
  FolderGit2,
  Filter,
  Layers,
  Award,
  ChevronRight,
  Heart,
  Smile,
  Globe2,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';
import { profileApi } from '../api/profile.api.js';
import Button from '../features/ui/Button.jsx';
import ProfileCompletionModal from '../features/profile/components/ProfileCompletionModal.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const currentUser = user || {
    id: 'usr_guest',
    fullName: 'Usuario FreelanceHub',
    email: 'usuario@freelancehub.com',
    role: 'FREELANCER',
  };

  const isClient = currentUser.role === 'CLIENT';

  // Profile modal and status state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileProgress, setProfileProgress] = useState({
    percentage: 0,
    completedSteps: 0,
    totalSteps: 3,
    isFullyCompleted: false,
    professionalTitle: '',
    bio: '',
    hourlyRate: 0,
  });

  // Post Creator State
  const [newPostText, setNewPostText] = useState('');
  const [postCategory, setPostCategory] = useState(isClient ? 'OFERTA_PROYECTO' : 'ACTUALIZACION');
  const [activeFilter, setActiveFilter] = useState('todos');

  // Feed Data State (LinkedIn-style posts)
  const [posts, setPosts] = useState([
    {
      id: 'p1',
      author: {
        name: 'TechNova Solutions',
        headline: 'Estudio de Innovación Digital • Cliente Verificado',
        avatarText: 'TN',
        role: 'CLIENT',
        isVerified: true,
      },
      time: 'Hace 45 min',
      type: 'OFERTA_PROYECTO',
      badge: '💼 Oferta con Escrow 100% Asegurado',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      content:
        '🚀 ¡Buscamos Desarrollador Fullstack Senior (React + Node.js/PostgreSQL) para construir una plataforma fintech de microcréditos con pagos Escrow en tiempo real! Contrato dividido en 3 hitos garantizados. ¿Te interesa sumarte al equipo?',
      projectDetails: {
        budget: '$3,500 USD',
        duration: '6 semanas',
        milestones: '3 Hitos definidos',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      },
      likes: 18,
      liked: false,
      commentsCount: 6,
      comments: [
        {
          name: 'Daniel Soto',
          text: '¡Excelente proyecto! Te acabo de enviar mi portafolio y propuesta técnica por mensaje directo.',
          time: 'Hace 20 min',
        },
      ],
    },
    {
      id: 'p2',
      author: {
        name: 'Camila Vega',
        headline: 'Senior UI/UX & Design Systems Specialist | Ex-MercadoLibre',
        avatarText: 'CV',
        role: 'FREELANCER',
        isVerified: true,
      },
      time: 'Hace 3 horas',
      type: 'PORTAFOLIO',
      badge: '🎨 Muestra de Portafolio & Caso de Éxito',
      badgeColor: 'bg-[#F3EFE6] text-[#8C2C45] border-[#C9B8A6]/60',
      content:
        '✨ Acabo de concluir el rediseño integral de la app móvil para Aurora Health. Aumentamos la tasa de retención un +34% implementando un Design System completamente accesible en Figma y React Native. ¡Disponible para nuevos proyectos a partir del próximo lunes!',
      projectDetails: null,
      imageUrl:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      likes: 42,
      liked: true,
      commentsCount: 11,
      comments: [],
    },
    {
      id: 'p3',
      author: {
        name: 'Sistema de Seguridad Escrow',
        headline: 'Notificación oficial de Garantía • FreelanceHub',
        avatarText: 'FH',
        role: 'SYSTEM',
        isVerified: true,
      },
      time: 'Hace 5 horas',
      type: 'ESCROW_UPDATE',
      badge: '🛡️ Liquidación Exitosa de Hito',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      content:
        'El contratante "Studio Alpha" ha aprobado formalmente el Hito #2 del proyecto "Despliegue de Infraestructura Cloud". Se han liberado $1,400.00 USD con satisfacción mutua del 100%. ¡Felicitaciones a ambas partes!',
      projectDetails: null,
      likes: 29,
      liked: false,
      commentsCount: 2,
      comments: [],
    },
  ]);

  useEffect(() => {
    loadProfileProgress();
  }, []);

  const loadProfileProgress = async () => {
    try {
      const res = await profileApi.getOnboardingStatus().catch(() => null);
      if (res?.data) {
        setProfileProgress(res.data);
      } else {
        const saved = localStorage.getItem('fh_local_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          const s1 = Boolean(parsed.professionalTitle && parsed.bio && parsed.hourlyRate);
          const s2 = Boolean(parsed.portfolioItems && parsed.portfolioItems.length > 0);
          const s3 = Boolean(parsed.skills && parsed.skills.length > 0);
          const count = [s1, s2, s3].filter(Boolean).length;
          setProfileProgress({
            percentage: Math.round((count / 3) * 100),
            completedSteps: count,
            totalSteps: 3,
            isFullyCompleted: count === 3,
            professionalTitle: parsed.professionalTitle || '',
            bio: parsed.bio || '',
            hourlyRate: parsed.hourlyRate || 0,
          });
        }
      }
    } catch {
      // Manejo silencioso
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `p_${Date.now()}`,
      author: {
        name: currentUser.fullName,
        headline:
          profileProgress.professionalTitle ||
          (isClient ? 'Cliente / Contratante Verificado' : 'Freelancer Profesional'),
        avatarText: currentUser.fullName.charAt(0).toUpperCase(),
        role: currentUser.role,
        isVerified: true,
      },
      time: 'Justo ahora',
      type: postCategory,
      badge:
        postCategory === 'OFERTA_PROYECTO'
          ? '💼 Oferta con Escrow'
          : '🚀 Publicación en el Feed',
      badgeColor: 'bg-[#F3EFE6] text-[#8C2C45] border-[#C9B8A6]/60',
      content: newPostText.trim(),
      projectDetails:
        postCategory === 'OFERTA_PROYECTO'
          ? {
              budget: '$1,500 - $3,000 USD',
              duration: 'Por definir',
              milestones: 'Garantizado por Escrow',
              skills: ['Fullstack', 'Remoto'],
            }
          : null,
      likes: 1,
      liked: true,
      commentsCount: 0,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleLikePost = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.liked;
          return {
            ...p,
            liked: !isLiked,
            likes: isLiked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Recommended opportunities on right sidebar
  const recommendedProjects = [
    {
      id: 'rp1',
      title: 'Desarrollo de MVP SaaS con Pagos Stripe',
      company: 'Fintech Aurora',
      budget: '$2,800 USD',
      tags: ['Next.js', 'PostgreSQL', 'Stripe'],
      proposals: '4 postulaciones',
    },
    {
      id: 'rp2',
      title: 'Diseño UX/UI de App Móvil Logística',
      company: 'Logística Express',
      budget: '$1,600 USD',
      tags: ['Figma', 'Mobile UX'],
      proposals: '7 postulaciones',
    },
    {
      id: 'rp3',
      title: 'Integración de Agente Inteligente con LLM',
      company: 'DataFlow AI',
      budget: '$3,200 USD',
      tags: ['Python', 'LangChain', 'FastAPI'],
      proposals: '2 postulaciones',
    },
  ];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'proyectos') return post.type === 'OFERTA_PROYECTO';
    if (activeFilter === 'portafolios') return post.type === 'PORTAFOLIO';
    if (activeFilter === 'escrow') return post.type === 'ESCROW_UPDATE';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#2b1b1e] flex flex-col selection:bg-[#8C2C45]/20 selection:text-[#5A0F24]">
      {/* ========================================================
          1. LINKEDIN-STYLE TOPBAR
      ======================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C9B8A6]/50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline-block text-lg font-extrabold tracking-tight text-[#5A0F24]">
                Freelance<span className="text-[#8C2C45]">Hub</span>
              </span>
            </Link>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-[#8C2C45] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar proyectos, habilidades, colegas..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 rounded-xl text-xs text-[#2b1b1e] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C2C45]/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Navigation Tabs (LinkedIn Style) */}
          <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 text-[#5A0F24]/75">
            {/* Inicio (Active) */}
            <Link
              to="/dashboard"
              className="flex flex-col items-center justify-center px-2 py-1 text-[#8C2C45] border-b-2 border-[#8C2C45] transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold hidden sm:inline-block mt-0.5">Inicio</span>
            </Link>

            {/* Proyectos */}
            <button
              type="button"
              onClick={() => setActiveFilter('proyectos')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:text-[#8C2C45] transition-colors cursor-pointer"
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px] font-medium hidden sm:inline-block mt-0.5">Proyectos</span>
            </button>

            {/* Mensajes */}
            <button
              type="button"
              onClick={() => alert('Bandeja de mensajes en tiempo real disponible en el próximo release.')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:text-[#8C2C45] transition-colors relative cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-[#8C2C45] absolute top-1 right-2 ring-1 ring-white" />
              <span className="text-[10px] font-medium hidden sm:inline-block mt-0.5">Mensajes</span>
            </button>

            {/* Billetera / Escrow */}
            <button
              type="button"
              onClick={() => setActiveFilter('escrow')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:text-[#8C2C45] transition-colors cursor-pointer"
            >
              <Lock className="w-5 h-5 text-emerald-700" />
              <span className="text-[10px] font-medium hidden sm:inline-block mt-0.5">Escrow</span>
            </button>

            {/* Notificaciones */}
            <button
              type="button"
              onClick={() => alert('Tienes 3 notificaciones nuevas de proyectos guardados.')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:text-[#8C2C45] transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-2 ring-1 ring-white" />
              <span className="text-[10px] font-medium hidden sm:inline-block mt-0.5">Avisos</span>
            </button>

            {/* Avatar Dropdown / User Profile */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#C9B8A6]/40">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex flex-col items-center justify-center px-1 py-1 hover:text-[#8C2C45] cursor-pointer group"
                title="Editar Perfil"
              >
                <div className="w-7 h-7 rounded-full bg-[#8C2C45] text-white flex items-center justify-center text-xs font-bold shadow-2xs group-hover:ring-2 group-hover:ring-[#8C2C45]/30">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-[10px] font-bold text-[#5A0F24] hidden sm:inline-block mt-0.5">
                  Yo ▾
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#5A0F24]/60 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ========================================================
          2. MAIN 3-COLUMN LINKEDIN LAYOUT
      ======================================================== */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* ====================================================
              COLUMNA IZQUIERDA: PERFIL & SHORTCUTS (3 cols)
          ==================================================== */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
            {/* Tarjeta de Perfil Resumida */}
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 shadow-xs overflow-hidden">
              {/* Cover Banner con paleta vino */}
              <div className="h-16 bg-gradient-to-r from-[#5A0F24] via-[#8C2C45] to-[#C68A8F] relative">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                  {isClient ? 'Cliente' : 'Freelancer'}
                </div>
              </div>

              {/* Avatar superpuesto */}
              <div className="px-4 pb-4 text-center relative -mt-8">
                <div
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-16 h-16 rounded-full bg-white p-1 mx-auto cursor-pointer group shadow-sm inline-block"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>

                <h3
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-sm font-extrabold text-[#5A0F24] mt-2 hover:underline cursor-pointer"
                >
                  {currentUser.fullName}
                </h3>
                <p className="text-[11px] text-[#5A0F24]/75 mt-0.5 leading-snug line-clamp-2">
                  {profileProgress.professionalTitle ||
                    (isClient
                      ? 'Buscando el mejor talento independiente'
                      : 'Profesional Independiente • Completa tu título')}
                </p>

                {/* Progress bar si no está al 100% */}
                {!isClient && profileProgress.percentage < 100 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F3EFE6] border border-[#C9B8A6]/40 text-left">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#5A0F24] mb-1">
                      <span>Perfil {profileProgress.percentage}% listo</span>
                      <Link to="/onboarding" className="text-[#8C2C45] hover:underline">
                        Completar
                      </Link>
                    </div>
                    <div className="w-full bg-[#E8DEDA] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8C2C45] to-[#5A0F24]"
                        style={{ width: `${profileProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Estadísticas de Perfil */}
              <div className="border-t border-[#C9B8A6]/30 px-4 py-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-[#5A0F24]/80">
                  <span className="text-[11px]">Visualizaciones de perfil</span>
                  <span className="font-bold text-[#8C2C45]">142</span>
                </div>
                <div className="flex items-center justify-between text-[#5A0F24]/80">
                  <span className="text-[11px]">Impresiones de propuestas</span>
                  <span className="font-bold text-[#8C2C45]">89</span>
                </div>
                <div className="flex items-center justify-between text-[#5A0F24]/80 pt-1 border-t border-[#C9B8A6]/20">
                  <span className="text-[11px] flex items-center gap-1 font-semibold text-emerald-800">
                    <Lock className="w-3 h-3 text-emerald-600" /> Saldo en Escrow
                  </span>
                  <span className="font-extrabold text-emerald-700">$2,450 USD</span>
                </div>
              </div>

              {/* Botón para editar perfil */}
              <div className="p-3 bg-[#F3EFE6]/50 border-t border-[#C9B8A6]/30">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full py-1.5 rounded-xl bg-white border border-[#C9B8A6]/50 text-xs font-bold text-[#5A0F24] hover:bg-[#F3EFE6] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-[#8C2C45]" />
                  <span>Editar Mi Perfil & Skills</span>
                </button>
              </div>
            </div>

            {/* Accesos Rápidos y Marcadores */}
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 p-4 shadow-xs space-y-2 text-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5A0F24]/70 mb-2">
                Accesos Directos
              </h4>
              <button
                type="button"
                onClick={() => setActiveFilter('proyectos')}
                className="w-full flex items-center gap-2 text-left py-1.5 px-2 rounded-lg hover:bg-[#F3EFE6] text-[#5A0F24] font-medium transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#8C2C45]" />
                <span>Proyectos Guardados (3)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('escrow')}
                className="w-full flex items-center gap-2 text-left py-1.5 px-2 rounded-lg hover:bg-[#F3EFE6] text-[#5A0F24] font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Contratos con Escrow Activo</span>
              </button>
              <Link
                to="/onboarding"
                className="w-full flex items-center gap-2 text-left py-1.5 px-2 rounded-lg hover:bg-[#F3EFE6] text-[#5A0F24] font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Paso a Paso de Onboarding</span>
              </Link>
            </div>
          </aside>

          {/* ====================================================
              COLUMNA CENTRAL: FEED PRINCIPAL (6 cols)
          ==================================================== */}
          <main className="md:col-span-8 lg:col-span-6 space-y-4">
            {/* Box Crear Publicación (LinkedIn Style) */}
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 p-4 shadow-xs space-y-3">
              <form onSubmit={handleCreatePost}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8C2C45] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder={
                        isClient
                          ? 'Publica un proyecto o requerimiento con pago asegurado por Escrow...'
                          : 'Comparte un avance, muestra de portafolio o disponibilidad para proyectos...'
                      }
                      className="w-full p-3 bg-[#F3EFE6]/50 border border-[#C9B8A6]/40 rounded-xl text-xs sm:text-sm text-[#2b1b1e] placeholder-[#9a868a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C2C45]/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Post Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#C9B8A6]/30 mt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPostCategory(isClient ? 'OFERTA_PROYECTO' : 'PORTAFOLIO')
                      }
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        postCategory === 'OFERTA_PROYECTO' || postCategory === 'PORTAFOLIO'
                          ? 'bg-[#8C2C45] text-white'
                          : 'text-[#5A0F24]/75 hover:bg-[#F3EFE6]'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{isClient ? 'Oferta de Proyecto' : 'Portafolio'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostCategory('ACTUALIZACION')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        postCategory === 'ACTUALIZACION'
                          ? 'bg-[#8C2C45] text-white'
                          : 'text-[#5A0F24]/75 hover:bg-[#F3EFE6]'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Foto / Imagen</span>
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={!newPostText.trim()}
                    className="py-1.5 px-4 bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs disabled:opacity-50"
                  >
                    <span>Publicar</span>
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Feed Filters */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold text-[#5A0F24]/80">
                <button
                  type="button"
                  onClick={() => setActiveFilter('todos')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === 'todos'
                      ? 'bg-[#8C2C45] text-white shadow-2xs'
                      : 'bg-white border border-[#C9B8A6]/40 hover:bg-[#F3EFE6]'
                  }`}
                >
                  Todo el Feed
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('proyectos')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === 'proyectos'
                      ? 'bg-[#8C2C45] text-white shadow-2xs'
                      : 'bg-white border border-[#C9B8A6]/40 hover:bg-[#F3EFE6]'
                  }`}
                >
                  💼 Ofertas de Proyectos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('portafolios')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === 'portafolios'
                      ? 'bg-[#8C2C45] text-white shadow-2xs'
                      : 'bg-white border border-[#C9B8A6]/40 hover:bg-[#F3EFE6]'
                  }`}
                >
                  🎨 Portafolios & Muestras
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('escrow')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === 'escrow'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white border border-[#C9B8A6]/40 hover:bg-[#F3EFE6]'
                  }`}
                >
                  🛡️ Hitos Escrow
                </button>
              </div>
            </div>

            {/* Listado de Posts / Feed */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-[#C9B8A6]/50 shadow-xs overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 pb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {post.author.avatarText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#5A0F24] hover:underline cursor-pointer">
                            {post.author.name}
                          </h4>
                          {post.author.isVerified && (
                            <span title="Usuario Verificado">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                            </span>
                          )}
                          <span className="text-[10px] text-[#9a868a]">• {post.time}</span>
                        </div>
                        <p className="text-[11px] text-[#5A0F24]/70 leading-snug">
                          {post.author.headline}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-[#9a868a] hover:text-[#5A0F24] p-1 rounded-lg hover:bg-[#F3EFE6] transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badge de tipo de publicación */}
                  {post.badge && (
                    <div className="px-4 pb-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${post.badgeColor}`}
                      >
                        {post.badge}
                      </span>
                    </div>
                  )}

                  {/* Post Text Content */}
                  <div className="px-4 pb-3">
                    <p className="text-xs sm:text-sm text-[#2b1b1e] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Optional Project Card Widget inside Post */}
                  {post.projectDetails && (
                    <div className="mx-4 mb-3 p-3.5 rounded-xl bg-[#F3EFE6]/70 border border-[#C9B8A6]/50 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#5A0F24]">
                          Presupuesto Protegido:
                        </span>
                        <span className="font-black text-emerald-800 text-sm">
                          {post.projectDetails.budget}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {post.projectDetails.skills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#C9B8A6]/40 text-[10px] font-semibold text-[#8C2C45]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className="text-[#5A0F24]/70">
                          {post.projectDetails.duration} • {post.projectDetails.milestones}
                        </span>
                        <Button
                          type="button"
                          onClick={() => alert(`Postulación enviada a ${post.author.name}`)}
                          className="py-1 px-3 bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-[11px]"
                        >
                          <span>Enviar Propuesta</span>
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Optional Post Image */}
                  {post.imageUrl && (
                    <div className="w-full bg-[#f6f2ee] overflow-hidden max-h-72 border-y border-[#C9B8A6]/30">
                      <img
                        src={post.imageUrl}
                        alt="Muestra de proyecto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Stats (Likes and Comments Count) */}
                  <div className="px-4 py-2 border-t border-[#C9B8A6]/30 flex items-center justify-between text-[11px] text-[#5A0F24]/70">
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-[#8C2C45] text-white flex items-center justify-center text-[9px]">
                        👍
                      </span>
                      {post.likes} reacciones
                    </span>
                    <span>{post.commentsCount} comentarios</span>
                  </div>

                  {/* Post Actions (Like, Comment, Share, Save) */}
                  <div className="px-2 py-1 border-t border-[#C9B8A6]/30 grid grid-cols-4 text-xs font-semibold text-[#5A0F24]/75">
                    <button
                      type="button"
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors cursor-pointer ${
                        post.liked
                          ? 'text-[#8C2C45] font-bold bg-[#F3EFE6]/60'
                          : 'hover:bg-[#F3EFE6] hover:text-[#8C2C45]'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Me gusta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        alert('Escribe tu comentario en la publicación.')
                      }
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-[#F3EFE6] hover:text-[#8C2C45] transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Comentar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        alert('Enlace copiado al portapapeles para compartir.')
                      }
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-[#F3EFE6] hover:text-[#8C2C45] transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('Proyecto guardado en tus marcadores.')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-[#F3EFE6] hover:text-[#8C2C45] transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* ====================================================
              COLUMNA DERECHA: NOTICIAS & OPORTUNIDADES (3 cols)
          ==================================================== */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Oportunidades Recomendadas para ti */}
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#C9B8A6]/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A0F24]">
                  Oportunidades para ti
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>

              <div className="space-y-3">
                {recommendedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-2.5 rounded-xl border border-[#C9B8A6]/30 bg-[#f6f2ee]/50 hover:bg-[#F3EFE6] transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {proj.budget}
                      </span>
                      <span className="text-[10px] text-[#9a868a]">
                        {proj.proposals}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#5A0F24] leading-snug hover:underline cursor-pointer">
                      {proj.title}
                    </h4>

                    <p className="text-[10px] text-[#5A0F24]/70">
                      {proj.company}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-white border border-[#C9B8A6]/40 text-[#5A0F24]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        alert(`Postulación enviada para "${proj.title}"`)
                      }
                      className="w-full mt-2 py-1 rounded-lg bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Postularme
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tendencias del Hub */}
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/50 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A0F24] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#8C2C45]" />
                Tendencias en el Hub
              </h3>

              <ul className="space-y-2 text-xs">
                <li className="cursor-pointer hover:underline">
                  <div className="font-bold text-[#5A0F24]">#FullstackReact</div>
                  <div className="text-[10px] text-[#9a868a]">1,420 proyectos publicados esta semana</div>
                </li>
                <li className="cursor-pointer hover:underline">
                  <div className="font-bold text-[#5A0F24]">#FigmaDesignSystems</div>
                  <div className="text-[10px] text-[#9a868a]">890 clientes buscando talento</div>
                </li>
                <li className="cursor-pointer hover:underline">
                  <div className="font-bold text-[#5A0F24]">#GarantiaEscrow</div>
                  <div className="text-[10px] text-[#9a868a]">100% de liquidaciones aseguradas</div>
                </li>
              </ul>
            </div>

            {/* Mini Footer */}
            <div className="px-2 text-center text-[10px] text-[#5A0F24]/60 space-y-1">
              <div className="flex flex-wrap justify-center gap-2">
                <a href="#acerca" className="hover:underline">Acerca de</a>
                <a href="#ayuda" className="hover:underline">Centro de Ayuda</a>
                <a href="#privacidad" className="hover:underline">Privacidad & Términos</a>
              </div>
              <p>© 2026 FreelanceHub Corporation</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal para Editar Perfil / Completar Info */}
      <ProfileCompletionModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          loadProfileProgress();
        }}
        initialStep={1}
        onProgressUpdated={(newProgress) => {
          setProfileProgress((prev) => ({ ...prev, ...newProgress }));
        }}
      />
    </div>
  );
}
