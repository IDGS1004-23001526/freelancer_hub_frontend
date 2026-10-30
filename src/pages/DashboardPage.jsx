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
  Video,
  FileText,
  Send,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  Calendar,
  Newspaper,
  MoreHorizontal,
  X,
  Plus,
  Building2,
  Check,
  ChevronDown,
  Info,
  ExternalLink,
  MapPin,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';
import { profileApi } from '../api/profile.api.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const currentUser = user || {
    id: 'usr_me',
    fullName: 'Christopher Isaac Rivera Valderrama',
    email: 'christoferriveravalderrama@gmail.com',
    role: 'FREELANCER',
  };

  // State del perfil para la tarjeta izquierda
  const [profileData, setProfileData] = useState({
    professionalTitle: 'Desarrollador de Software Multiplataforma | Desarrollo Web | React | Node.js',
    location: 'León y alrededores, México',
    avatarUrl: '/avatar-sample.jpg',
  });

  // Modal para crear publicación
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postAttachmentType, setPostAttachmentType] = useState(null);

  // Feed de publicaciones estilo limpio
  const [posts, setPosts] = useState([
    {
      id: 'p1',
      author: {
        name: 'SCCALA – SUPPLY CHAIN CONSULTING & TECH',
        headline: 'Consultoría e Innovación en Cadenas de Suministro • Cliente Verificado',
        avatarText: 'SC',
        verified: true,
      },
      time: '1 día',
      text: '📦 😂 Cuando los costos logísticos se llevan casi todo el presupuesto... y esto fue lo que quedó para la mercancía. ¡Optimizando cadenas de transporte y software en tiempo real con hitos de entrega en FreelancerHub!',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80',
      likes: 42,
      liked: false,
      commentsCount: 9,
      isFollowing: false,
    },
    {
      id: 'p2',
      author: {
        name: 'TechNova Studio',
        headline: 'Estudio de Innovación Digital & Fintech',
        avatarText: 'TN',
        verified: true,
      },
      time: 'hace 3 horas',
      text: '🚀 Buscamos Desarrollador Full Stack (React + Node.js/PostgreSQL) para construir una plataforma con pagos protegidos mediante Escrow. 3 hitos garantizados. ¡Postúlate o envíanos un mensaje directo!',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
      likes: 68,
      liked: true,
      commentsCount: 14,
      isFollowing: true,
    },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await profileApi.getMyProfile().catch(() => null);
      if (res?.data) {
        setProfileData((prev) => ({
          ...prev,
          professionalTitle: res.data.professionalTitle || prev.professionalTitle,
          location: res.data.location || prev.location,
          avatarUrl: res.data.avatarUrl || prev.avatarUrl,
        }));
      }
    } catch {
      // Manejo silencioso
    }
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newLiked = !post.liked;
          return {
            ...post,
            liked: newLiked,
            likes: newLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: `p-${Date.now()}`,
      author: {
        name: currentUser.fullName,
        headline: profileData.professionalTitle,
        avatarText: currentUser.fullName.charAt(0),
        verified: true,
      },
      time: 'Ahora mismo',
      text: newPostContent.trim(),
      imageUrl: null,
      likes: 1,
      liked: true,
      commentsCount: 0,
      isFollowing: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsCreatePostModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f2ee] text-[#2b1b1e] font-sans antialiased">
      {/* NAVBAR SUPERIOR ESTILO LINKEDIN (PALETA WINE & CREAM) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C9B8A6]/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo y Buscador */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#8C2C45] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-[#5A0F24] transition">
                FH
              </div>
            </Link>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9B8A6]" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-[#F3EFE6] text-sm text-[#2b1b1e] placeholder-[#5A0F24]/50 rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white transition border border-[#C9B8A6]/30"
              />
            </div>
          </div>

          {/* Menú de Navegación Limpio */}
          <nav className="flex items-center gap-1 sm:gap-6">
            <Link
              to="/dashboard"
              className="flex flex-col items-center justify-center text-[#8C2C45] border-b-2 border-[#8C2C45] text-[11px] font-bold py-1 px-2"
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Inicio</span>
            </Link>
            <Link
              to="/onboarding"
              className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition"
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span>Mi red</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition"
            >
              <Briefcase className="w-5 h-5 mb-0.5" />
              <span>Proyectos</span>
            </Link>
            <button className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition cursor-pointer">
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span>Mensajes</span>
            </button>
            <button className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition cursor-pointer">
              <Bell className="w-5 h-5 mb-0.5" />
              <span>Avisos</span>
            </button>

            {/* Avatar Dropdown (Yo ▾ con Cerrar sesión) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#8C2C45] text-[11px] font-semibold py-1 px-2 group cursor-pointer"
                title="Cuenta y opciones"
              >
                <img
                  src={profileData.avatarUrl}
                  alt="Yo"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#C9B8A6] group-hover:ring-[#8C2C45]"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span>Yo ▾</span>
              </button>

              {/* Menú desplegable */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#C9B8A6]/40 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#C9B8A6]/20">
                    <img
                      src={profileData.avatarUrl}
                      alt="Yo"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#C9B8A6]"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#5A0F24] truncate">{currentUser.fullName}</h4>
                      <p className="text-[10px] text-[#2b1b1e]/60 truncate">{profileData.professionalTitle}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="mt-2.5 block w-full text-center py-1.5 px-3 rounded-xl border border-[#8C2C45] text-[#8C2C45] hover:bg-[#F3EFE6] text-xs font-bold transition"
                  >
                    Ver perfil
                  </Link>

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

      {/* CONTENIDO PRINCIPAL EN 3 COLUMNAS LIMPIAS */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: PERFIL RESUMIDO & SHORTCUTS (3 COLS) */}
        {/* ========================================================= */}
        <aside className="md:col-span-3 space-y-3">
          {/* TARJETA 1: PERFIL RESUMIDO (IDENTICA A LA CAPTURA) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 overflow-hidden shadow-xs">
            {/* Banner superior suave */}
            <div className="h-16 bg-linear-to-r from-[#5A0F24] via-[#8C2C45] to-[#C68A8F] relative" />

            {/* Contenido con avatar superpuesto */}
            <div className="px-4 pb-4 text-center relative -mt-9">
              <Link to="/profile" className="inline-block group">
                <div className="w-18 h-18 rounded-full border-2 border-white shadow-sm bg-white overflow-hidden mx-auto">
                  <img
                    src={profileData.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              </Link>

              {/* Nombre y titular */}
              <Link to="/profile" className="block mt-2 group">
                <h3 className="text-sm font-extrabold text-[#5A0F24] group-hover:underline flex items-center justify-center gap-1">
                  <span>{currentUser.fullName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C2C45] fill-[#F3EFE6]" />
                </h3>
              </Link>
              <p className="text-[11px] text-[#2b1b1e]/80 mt-1 line-clamp-2 leading-snug font-normal">
                {profileData.professionalTitle}
              </p>
              <p className="text-[10px] text-[#C9B8A6] mt-0.5 flex items-center justify-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#8C2C45]" />
                {profileData.location}
              </p>
            </div>

            {/* Sección Promoción / Escrow */}
            <div className="border-t border-[#C9B8A6]/25 p-3 text-[11px] bg-[#F3EFE6]/40 text-left">
              <p className="text-[#2b1b1e]/75 leading-tight">
                Consigue contratos más rápido con protección Escrow en cada hito
              </p>
              <Link
                to="/profile"
                className="font-bold text-[#8C2C45] hover:underline mt-1 inline-flex items-center gap-1"
              >
                <span>🛡️ Saldo Asegurado en Escrow</span>
              </Link>
            </div>
          </div>

          {/* TARJETA 2: ACCESOS DIRECTOS LIMPIOS (GUARDADOS, GRUPOS, EVENTOS) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-3 shadow-xs space-y-1 text-xs font-semibold text-[#5A0F24]">
            <button
              onClick={() => alert('Elementos guardados')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F3EFE6] transition text-left cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-[#8C2C45]" />
              <span>Elementos guardados</span>
            </button>
            <button
              onClick={() => alert('Grupos')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F3EFE6] transition text-left cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#8C2C45]" />
              <span>Grupos de desarrollo</span>
            </button>
            <button
              onClick={() => alert('Newsletters')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F3EFE6] transition text-left cursor-pointer"
            >
              <Newspaper className="w-4 h-4 text-[#8C2C45]" />
              <span>Newsletters técnicas</span>
            </button>
            <button
              onClick={() => alert('Eventos')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F3EFE6] transition text-left cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#8C2C45]" />
              <span>Eventos & Charlas</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* COLUMNA CENTRAL: FEED & PUBLICADOR LIMPIO (6 COLS) */}
        {/* ========================================================= */}
        <section className="md:col-span-6 space-y-4">
          {/* CAJA CREADORA DE PUBLICACIÓN (IDÉNTICA A LA CAPTURA) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={profileData.avatarUrl}
                alt="Yo"
                className="w-11 h-11 rounded-full object-cover ring-1 ring-[#C9B8A6]"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex-1 text-left px-5 py-2.5 bg-white border border-[#C9B8A6]/60 hover:bg-[#F3EFE6] rounded-full text-xs sm:text-sm font-medium text-[#2b1b1e]/60 transition cursor-pointer"
              >
                Crear publicación
              </button>
            </div>

            {/* BOTONES LIMPIOS: VÍDEO, FOTO, ESCRIBIR ARTÍCULO */}
            <div className="flex items-center justify-around mt-3 pt-2.5 border-t border-[#C9B8A6]/20">
              <button
                type="button"
                onClick={() => {
                  setPostAttachmentType('video');
                  setIsCreatePostModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F3EFE6] text-xs font-semibold text-[#5A0F24] transition cursor-pointer"
              >
                <Video className="w-5 h-5 text-emerald-600" />
                <span>Vídeo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostAttachmentType('foto');
                  setIsCreatePostModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F3EFE6] text-xs font-semibold text-[#5A0F24] transition cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 text-[#8C2C45]" />
                <span>Foto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostAttachmentType('articulo');
                  setIsCreatePostModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F3EFE6] text-xs font-semibold text-[#5A0F24] transition cursor-pointer"
              >
                <FileText className="w-5 h-5 text-amber-700" />
                <span>Escribir artículo</span>
              </button>
            </div>
          </div>

          {/* LÍNEA SEPARADORA DE ORDENAR */}
          <div className="flex items-center justify-between text-xs text-[#2b1b1e]/60 px-1">
            <hr className="flex-1 border-[#C9B8A6]/30 mr-3" />
            <button className="flex items-center gap-1 font-semibold hover:text-[#8C2C45] transition cursor-pointer">
              <span>Ordenar por: <strong className="text-[#5A0F24]">Principales</strong></span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LISTA DE PUBLICACIONES DEL FEED */}
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-[#C9B8A6]/40 overflow-hidden shadow-xs"
            >
              {/* Cabecera del autor */}
              <div className="p-4 pb-2 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8C2C45] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {post.author.avatarText}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[#5A0F24] leading-tight">
                        {post.author.name}
                      </h4>
                      {post.author.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C2C45] fill-[#F3EFE6]" />
                      )}
                      <button
                        onClick={() => {
                          setPosts((prev) =>
                            prev.map((p) =>
                              p.id === post.id ? { ...p, isFollowing: !p.isFollowing } : p
                            )
                          );
                        }}
                        className="text-xs font-bold text-[#8C2C45] hover:underline cursor-pointer ml-1"
                      >
                        {post.isFollowing ? '• Siguiendo' : '+ Seguir'}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#2b1b1e]/60 line-clamp-1">
                      {post.author.headline}
                    </p>
                    <span className="text-[10px] text-[#C9B8A6]">{post.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#C9B8A6]">
                  <button className="p-1 hover:text-[#5A0F24] rounded-full transition cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Texto de la publicación */}
              <div className="px-4 py-2 text-xs sm:text-sm text-[#2b1b1e] leading-relaxed">
                <p>{post.text}</p>
              </div>

              {/* Imagen o Contenedor multimedia si existe */}
              {post.imageUrl && (
                <div className="mt-2 bg-[#F3EFE6]/50 overflow-hidden max-h-96 flex items-center justify-center">
                  <img
                    src={post.imageUrl}
                    alt="Publicación"
                    className="w-full h-auto object-cover max-h-96"
                  />
                </div>
              )}

              {/* Conteo de reacciones */}
              <div className="px-4 py-2 border-b border-[#C9B8A6]/20 flex items-center justify-between text-[11px] text-[#2b1b1e]/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#8C2C45] text-white flex items-center justify-center text-[9px]">
                    👍
                  </span>
                  <span className="font-semibold text-[#5A0F24]">{post.likes}</span>
                </div>
                <span>{post.commentsCount} comentarios</span>
              </div>

              {/* Barra de Interacciones (Recomendar, Comentar, Compartir, Enviar) */}
              <div className="px-2 py-1 flex items-center justify-around text-xs font-bold text-[#5A0F24]/80">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-[#F3EFE6] transition cursor-pointer ${
                    post.liked ? 'text-[#8C2C45]' : ''
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${post.liked ? 'fill-[#8C2C45]' : ''}`} />
                  <span>Recomendar</span>
                </button>

                <button
                  type="button"
                  className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-[#F3EFE6] transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Comentar</span>
                </button>

                <button
                  type="button"
                  className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-[#F3EFE6] transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>

                <button
                  type="button"
                  className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-[#F3EFE6] transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: NOTICIAS & FOOTER LINKEDIN (3 COLS) */}
        {/* ========================================================= */}
        <aside className="md:col-span-3 space-y-3">
          {/* TARJETA 1: NOTICIAS (IDENTICA A LA CAPTURA) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-[#5A0F24]">FreelancerHub Noticias</h3>
              <Info className="w-3.5 h-3.5 text-[#C9B8A6]" />
            </div>
            <p className="text-[11px] font-semibold text-[#2b1b1e]/60 mb-3">Historias destacadas</p>

            <ul className="space-y-3 text-xs">
              <li>
                <a href="#noticias" className="group block">
                  <p className="font-bold text-[#5A0F24] group-hover:text-[#8C2C45] line-clamp-1 leading-snug">
                    Chile supera el millón de personas sin ...
                  </p>
                  <span className="text-[10px] text-[#C9B8A6]">Hace 1 día • 298 lectores</span>
                </a>
              </li>
              <li>
                <a href="#noticias" className="group block">
                  <p className="font-bold text-[#5A0F24] group-hover:text-[#8C2C45] line-clamp-1 leading-snug">
                    Las marcas más valiosas del mundo en ...
                  </p>
                  <span className="text-[10px] text-[#C9B8A6]">Hace 1 día • 267 lectores</span>
                </a>
              </li>
              <li>
                <a href="#noticias" className="group block">
                  <p className="font-bold text-[#5A0F24] group-hover:text-[#8C2C45] line-clamp-1 leading-snug">
                    Anthropic se alista para salir a bolsa en ...
                  </p>
                  <span className="text-[10px] text-[#C9B8A6]">Hace 3 días • 548 lectores</span>
                </a>
              </li>
              <li>
                <a href="#noticias" className="group block">
                  <p className="font-bold text-[#5A0F24] group-hover:text-[#8C2C45] line-clamp-1 leading-snug">
                    Los superricos agravan la crisis climática: ...
                  </p>
                  <span className="text-[10px] text-[#C9B8A6]">Hace 3 días • 519 lectores</span>
                </a>
              </li>
              <li>
                <a href="#noticias" className="group block">
                  <p className="font-bold text-[#5A0F24] group-hover:text-[#8C2C45] line-clamp-1 leading-snug">
                    La IA está desgastando las habilidades de...
                  </p>
                  <span className="text-[10px] text-[#C9B8A6]">Hace 4 días • 451 lectores</span>
                </a>
              </li>
            </ul>

            <button
              onClick={() => alert('Cargando más noticias')}
              className="mt-3 text-xs font-bold text-[#8C2C45] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Mostrar más noticias</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FOOTER DISCRETO Y ELEGANTE */}
          <footer className="text-[11px] text-[#C9B8A6] text-center space-y-2 px-2">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <a href="#acerca" className="hover:text-[#8C2C45]">Acerca de</a>
              <a href="#accesibilidad" className="hover:text-[#8C2C45]">Accesibilidad</a>
              <a href="#ayuda" className="hover:text-[#8C2C45]">Centro de ayuda</a>
              <a href="#privacidad" className="hover:text-[#8C2C45]">Privacidad y condiciones</a>
              <a href="#publicidad" className="hover:text-[#8C2C45]">Publicidad</a>
            </div>
            <div className="flex items-center justify-center gap-1 text-[#5A0F24] font-bold text-xs pt-1">
              <div className="w-4 h-4 rounded-xs bg-[#8C2C45] text-white flex items-center justify-center text-[9px] font-black">
                FH
              </div>
              <span>FreelancerHub Corporation © 2026</span>
            </div>
          </footer>
        </aside>
      </main>

      {/* MODAL LIMPIO PARA CREAR PUBLICACIÓN */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#C9B8A6]/50 overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#C9B8A6]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={profileData.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#C9B8A6]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#5A0F24]">{currentUser.fullName}</h4>
                  <span className="text-[11px] text-[#C9B8A6]">Publicar para cualquiera</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                className="p-1 rounded-full text-[#C9B8A6] hover:text-[#5A0F24] hover:bg-[#F3EFE6] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-5 space-y-4">
              <textarea
                rows={5}
                required
                autoFocus
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="¿De qué quieres hablar?"
                className="w-full resize-none border-none text-sm text-[#2b1b1e] placeholder-[#C9B8A6] focus:outline-none"
              />

              <div className="pt-3 border-t border-[#C9B8A6]/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8C2C45]">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-[#F3EFE6] transition cursor-pointer"
                    title="Añadir foto"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-[#F3EFE6] transition cursor-pointer"
                    title="Añadir vídeo"
                  >
                    <Video className="w-5 h-5 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-[#F3EFE6] transition cursor-pointer"
                    title="Escribir artículo"
                  >
                    <FileText className="w-5 h-5 text-amber-700" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="px-5 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] disabled:bg-[#C9B8A6]/50 text-white rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
