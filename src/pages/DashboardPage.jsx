import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
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
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';
import { profileApi } from '../api/profile.api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

import { resolveAvatarUrl } from '../utils/avatar.js';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const currentUser = user || {
    id: '',
    fullName: '',
    email: '',
    role: 'FREELANCER',
  };

  // State del perfil para la tarjeta izquierda
  const [profileData, setProfileData] = useState({
    professionalTitle: '',
    location: '',
    avatarUrl: '/avatar-sample.jpg',
  });
  const [devNews, setDevNews] = useState([]);
  const [showAllNews, setShowAllNews] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('https://dev.to/api/articles?tag=spanish&per_page=15').then((r) => (r.ok ? r.json() : [])),
      fetch('https://dev.to/api/articles?tag=espanol&per_page=10').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([spanish, espanol]) => {
        const merged = [...(Array.isArray(spanish) ? spanish : []), ...(Array.isArray(espanol) ? espanol : [])];
        const uniqueMap = new Map();
        merged.forEach((a) => {
          if (a?.id && !uniqueMap.has(a.id)) uniqueMap.set(a.id, a);
        });
        const data = Array.from(uniqueMap.values());
        if (data.length > 0) {
          setDevNews(data);
          const feedArticles = data.map((article) => ({
            id: `devto-${article.id}`,
            author: {
              name: article.user?.name || 'Dev.to',
              avatarText: (article.user?.name || 'DV').slice(0, 2).toUpperCase(),
              headline:
                Array.isArray(article.tag_list) && article.tag_list.length > 0
                  ? article.tag_list.slice(0, 3).map((t) => `#${t}`).join(' ')
                  : 'Desarrollo de Software',
              verified: true,
            },
            time: article.readable_publish_date || 'Reciente',
            text: `${article.title}${article.description ? ` — ${article.description}` : ''}`,
            imageUrl: article.cover_image || article.social_image || null,
            likes: article.public_reactions_count || 0,
            comments: article.comments_count || 0,
            isFollowing: false,
            isLiked: false,
          }));
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            return [...feedArticles.filter((a) => !existingIds.has(a.id)), ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);

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
          avatarUrl: resolveAvatarUrl(res.data.avatarUrl || prev.avatarUrl),
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
    <DashboardLayout>
      {/* CONTENIDO PRINCIPAL EN 3 COLUMNAS LIMPIAS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
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
            <Link
              to="/my-proposals"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F3EFE6] transition text-left"
            >
              <FileText className="w-4 h-4 text-[#8C2C45]" />
              <span>Mis postulaciones</span>
            </Link>
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
              {devNews.length === 0 ? (
                <li className="text-[#2b1b1e]/50 text-[11px]">Cargando noticias de desarrollo...</li>
              ) : (
                devNews.slice(0, showAllNews ? 8 : 5).map((article) => (
                  <li key={article.id}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <p className="font-bold text-[#5A0F24] group-hover:text-[#8C2C45] line-clamp-1 leading-snug">
                        {article.title}
                      </p>
                      <span className="text-[10px] text-[#C9B8A6]">
                        {article.readable_publish_date} • {article.public_reactions_count} reacciones
                      </span>
                    </a>
                  </li>
                ))
              )}
            </ul>

            {devNews.length > 5 && (
              <button
                onClick={() => setShowAllNews((prev) => !prev)}
                className="mt-3 text-xs font-bold text-[#8C2C45] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllNews ? 'Mostrar menos' : 'Mostrar más noticias'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllNews ? 'rotate-180' : ''}`} />
              </button>
            )}
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
      </div>

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
    </DashboardLayout>
  );
}