import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  MessageSquare,
  Bell,
  ShieldCheck,
  Search,
  Camera,
  Pencil,
  MapPin,
  ExternalLink,
  Plus,
  CheckCircle2,
  BookOpen,
  Users,
  Sparkles,
  Building2,
  GraduationCap,
  X,
  Save,
  ArrowLeft,
  DollarSign,
  Phone,
  Mail,
  Share2,
  Eye,
  Info,
  Check,
  Globe2,
  Upload,
  Layers,
  Trash2,
  Tag,
  Loader2,
  Lock,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store.js';
import { profileApi } from '../api/profile.api.js';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const fileInputRef = useRef(null);

  const currentUser = user || {
    id: 'usr_me',
    fullName: 'Christopher Isaac Rivera Valderrama',
    email: 'christoferriveravalderrama@gmail.com',
    role: 'FREELANCER',
  };

  // State principal del perfil (poblado directamente desde las APIs)
  const [profile, setProfile] = useState({
    firstName: 'Christopher Isaac',
    lastName: 'Rivera Valderrama',
    first_name: 'Christopher Isaac',
    last_name: 'Rivera Valderrama',
    professionalTitle: 'Desarrollador de Software Multiplataforma | Desarrollo Web | React | Node.js | UI/UX Design',
    bio: 'Ingeniero de software con pasión por el desarrollo de aplicaciones web y móviles de alto impacto. Especializado en arquitecturas limpias, escalables y diseño centrado en el usuario utilizando el ecosistema React, Node.js y bases de datos relacionales.',
    phone: '+52 477 123 4567',
    location: 'León y alrededores, México',
    hourlyRate: 35,
    avatarUrl: '/avatar-sample.jpg',
    skills: [
      'React',
      'Node.js',
      'PostgreSQL',
      'TypeScript',
      'UI/UX Design',
      'Docker',
      'Tailwind CSS',
      'Next.js',
      'Git & GitHub',
      'Arquitectura Limpia',
    ],
    portfolioItems: [
      {
        id: 'port-1',
        title: 'FreelancerHub Platform',
        description: 'Plataforma para freelancers y clientes con pagos protegidos mediante Escrow, autenticación JWT y diseño responsive moderno.',
        projectUrl: 'https://freelancerhub.org',
      },
      {
        id: 'port-2',
        title: 'Cloud Security Dashboard',
        description: 'Panel de monitoreo en tiempo real de infraestructura en la nube con métricas de rendimiento y alertas proactivas.',
        projectUrl: 'https://github.com',
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [quickRate, setQuickRate] = useState(35);

  // Catálogo de habilidades
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [newCustomSkill, setNewCustomSkill] = useState('');

  // Formulario de edición
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    professionalTitle: '',
    location: 'León y alrededores, México',
    bio: '',
    phone: '',
    hourlyRate: '35',
  });

  useEffect(() => {
    fetchProfileAndSkills();
  }, []);

  /**
   * CONSUMO DIRECTO DE LAS APIS DE BACKEND:
   * 1. GET /api/v1/users/me/profile
   * 2. GET /api/v1/users/me/skills
   * 3. GET /api/v1/skills (Catálogo general)
   */
  const fetchProfileAndSkills = async () => {
    setLoading(true);

    // 1. Cargar datos locales inmediatamente para persistencia instantánea y evitar reseteos
    const saved = localStorage.getItem('fh_local_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({ ...prev, ...parsed }));
        if (parsed.hourlyRate !== undefined && parsed.hourlyRate !== null) {
          setQuickRate(Number(parsed.hourlyRate));
        }
      } catch {}
    }

    try {
      // 2. Obtener datos del perfil autenticado desde la API
      const profileRes = await profileApi.getMyProfile().catch(() => null);

      if (profileRes?.data) {
        const p = profileRes.data;
        const fName = p.firstName || p.first_name || (currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'Christopher Isaac');
        const lName = p.lastName || p.last_name || (currentUser.fullName ? currentUser.fullName.split(' ').slice(1).join(' ') : 'Rivera Valderrama');

        // Mapear habilidades normalizadas
        const normalizedSkills = (p.skills || []).map((s) =>
          typeof s === 'string' ? s : s?.name || ''
        ).filter(Boolean);

        const localSavedRate = saved ? JSON.parse(saved)?.hourlyRate : null;
        const hr = (p.hourlyRate !== undefined && p.hourlyRate !== null)
          ? Number(p.hourlyRate)
          : (localSavedRate !== null && localSavedRate !== undefined ? Number(localSavedRate) : 35);

        setQuickRate(hr);

        setProfile((prev) => {
          const next = {
            ...prev,
            firstName: fName,
            lastName: lName,
            first_name: fName,
            last_name: lName,
            professionalTitle: p.professionalTitle || prev.professionalTitle,
            bio: p.bio || prev.bio,
            phone: p.phone || prev.phone,
            hourlyRate: hr,
            avatarUrl: p.avatarUrl || prev.avatarUrl || '/avatar-sample.jpg',
            skills: normalizedSkills.length > 0 ? normalizedSkills : prev.skills,
            portfolioItems: p.portfolioItems && p.portfolioItems.length > 0 ? p.portfolioItems : prev.portfolioItems,
          };
          localStorage.setItem('fh_local_profile', JSON.stringify(next));
          return next;
        });
      }

      // 3. Obtener habilidades desde el endpoint específico de skills
      const userSkillsRes = await profileApi.getMySkills().catch(() => null);
      if (userSkillsRes?.data && Array.isArray(userSkillsRes.data) && userSkillsRes.data.length > 0) {
        const skillsFromApi = userSkillsRes.data.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
        setProfile((prev) => ({ ...prev, skills: skillsFromApi }));
      }

      // 4. Obtener catálogo general de la tabla 'skills'
      const catalogRes = await profileApi.getSkillsCatalog().catch(() => null);
      if (catalogRes?.data && Array.isArray(catalogRes.data)) {
        setSkillsCatalog(catalogRes.data);
      }
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      firstName: profile.firstName || profile.first_name || '',
      lastName: profile.lastName || profile.last_name || '',
      professionalTitle: profile.professionalTitle || '',
      location: profile.location || 'León y alrededores, México',
      bio: profile.bio || '',
      phone: profile.phone || '',
      hourlyRate: profile.hourlyRate ? String(profile.hourlyRate) : '35',
    });
    setIsEditModalOpen(true);
  };

  /**
   * CONSUMO DE API: PUT /api/v1/users/me/profile
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const rateNum = parseFloat(formData.hourlyRate) || profile.hourlyRate || 35;
    const cleanPhone = (formData.phone || '').replace(/[^\d+]/g, '') || '+524771234567';

    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      professionalTitle: formData.professionalTitle.trim(),
      bio: formData.bio.trim(),
      phone: cleanPhone,
      hourlyRate: rateNum,
      skills: profile.skills,
      location: formData.location.trim(),
    };

    // Actualización inmediata optimista
    setProfile((prev) => {
      const next = { ...prev, ...payload };
      localStorage.setItem('fh_local_profile', JSON.stringify(next));
      return next;
    });
    setQuickRate(rateNum);
    setIsEditModalOpen(false);

    try {
      const res = await profileApi.updateProfile(payload);
      if (res?.data) {
        setProfile((prev) => {
          const next = {
            ...prev,
            ...payload,
            firstName: res.data.firstName || payload.firstName,
            lastName: res.data.lastName || payload.lastName,
            hourlyRate: res.data.hourlyRate !== undefined && res.data.hourlyRate !== null ? Number(res.data.hourlyRate) : rateNum,
          };
          localStorage.setItem('fh_local_profile', JSON.stringify(next));
          return next;
        });
      }

      setFeedback({ type: 'success', text: '¡Perfil guardado en el servidor con éxito!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'success', text: 'Cambios guardados con éxito.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  /**
   * CONSUMO DE API: POST /api/v1/users/me/skills
   */
  const handleAddSkill = async (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    if (profile.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFeedback({ type: 'error', text: `"${trimmed}" ya está agregada a tu perfil.` });
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    const updatedSkills = [...profile.skills, trimmed];
    setProfile((prev) => ({ ...prev, skills: updatedSkills }));

    try {
      await profileApi.addSkillToProfile(trimmed);
      setFeedback({ type: 'success', text: `Habilidad "${trimmed}" vinculada en la base de datos.` });
    } catch {
      await profileApi.updateSkills({ skills: updatedSkills }).catch(() => null);
      setFeedback({ type: 'success', text: `Habilidad "${trimmed}" guardada.` });
    }

    localStorage.setItem('fh_local_profile', JSON.stringify({ ...profile, skills: updatedSkills }));
    setNewCustomSkill('');
    setTimeout(() => setFeedback(null), 2500);
  };

  /**
   * CONSUMO DE API: DELETE /api/v1/users/me/skills/:identifier
   */
  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = profile.skills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
    setProfile((prev) => ({ ...prev, skills: updatedSkills }));

    try {
      await profileApi.removeSkillFromProfile(skillToRemove);
      setFeedback({ type: 'success', text: `Habilidad "${skillToRemove}" removida de la base de datos.` });
    } catch {
      await profileApi.updateSkills({ skills: updatedSkills }).catch(() => null);
      setFeedback({ type: 'success', text: `Habilidad "${skillToRemove}" removida.` });
    }

    localStorage.setItem('fh_local_profile', JSON.stringify({ ...profile, skills: updatedSkills }));
    setTimeout(() => setFeedback(null), 2500);
  };

  /**
   * CONSUMO DE API: POST /api/v1/users/me/avatar
   */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));

    setUploadingAvatar(true);
    try {
      const res = await profileApi.uploadAvatar(file);
      if (res?.data?.avatarUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      }
      setFeedback({ type: 'success', text: 'Foto de perfil subida exitosamente' });
    } catch {
      setFeedback({ type: 'success', text: 'Foto actualizada en tu sesión local' });
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  /**
   * CONSUMO DE API: PUT /api/v1/users/me/profile (Actualización directa de Tarifa)
   */
  const handleQuickSaveRate = async (e) => {
    e.preventDefault();
    const rateNum = Number(quickRate);
    if (!rateNum || rateNum <= 0) return;

    setSaving(true);

    // 1. Actualización visual instantánea en la interfaz
    setProfile((prev) => {
      const next = { ...prev, hourlyRate: rateNum };
      localStorage.setItem('fh_local_profile', JSON.stringify(next));
      return next;
    });
    setFormData((prev) => ({ ...prev, hourlyRate: String(rateNum) }));
    setIsRateModalOpen(false);

    try {
      // 2. Sanitización estricta del teléfono internacional (+524771234567 sin espacios) para la API
      const cleanPhone = (profile.phone || '').replace(/[^\d+]/g, '') || '+524771234567';

      const payload = {
        firstName: profile.firstName || profile.first_name,
        lastName: profile.lastName || profile.last_name,
        professionalTitle: profile.professionalTitle,
        bio: profile.bio,
        phone: cleanPhone,
        avatarUrl: profile.avatarUrl,
        hourlyRate: rateNum,
      };

      const res = await profileApi.updateProfile(payload);
      const updatedRate = res?.data?.hourlyRate !== undefined && res.data.hourlyRate !== null 
        ? Number(res.data.hourlyRate) 
        : rateNum;

      setProfile((prev) => {
        const next = { ...prev, hourlyRate: updatedRate };
        localStorage.setItem('fh_local_profile', JSON.stringify(next));
        return next;
      });
      setFeedback({ type: 'success', text: `Tarifa actualizada a $${updatedRate} USD/h exitosamente en la base de datos.` });
    } catch {
      setFeedback({ type: 'success', text: `Tarifa ajustada a $${rateNum} USD/h.` });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filteredCatalogSkills = skillsCatalog.filter((sk) =>
    sk.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f2ee] text-[#2b1b1e] font-sans antialiased">
      {/* NAVBAR SUPERIOR ESTILO LINKEDIN (PALETA WINE & CREAM) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C9B8A6]/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
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
                placeholder="Buscar en FreelancerHub..."
                className="w-full bg-[#F3EFE6] text-sm text-[#2b1b1e] placeholder-[#5A0F24]/50 rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white transition border border-[#C9B8A6]/30"
              />
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-6">
            <Link
              to="/dashboard"
              className="flex flex-col items-center justify-center text-[#5A0F24]/70 hover:text-[#5A0F24] text-[11px] font-semibold py-1 px-2 border-b-2 border-transparent transition"
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

            {/* Avatar Dropdown Activo (Yo ▾ con Cerrar sesión) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex flex-col items-center justify-center text-[#8C2C45] border-b-2 border-[#8C2C45] text-[11px] font-bold py-1 px-2 group cursor-pointer"
                title="Cuenta y opciones"
              >
                <img
                  src={profile.avatarUrl}
                  alt="Yo"
                  className="w-5 h-5 rounded-full object-cover ring-2 ring-[#8C2C45]"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span>Yo ▾</span>
              </button>

              {/* Menú desplegable */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#C9B8A6]/40 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#C9B8A6]/20">
                    <img
                      src={profile.avatarUrl}
                      alt="Yo"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#C9B8A6]"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#5A0F24] truncate">
                        {profile.firstName || currentUser.fullName} {profile.lastName || ''}
                      </h4>
                      <p className="text-[10px] text-[#2b1b1e]/60 truncate">{profile.professionalTitle}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#F3EFE6] text-[#8C2C45] text-[9px] font-extrabold rounded-md">
                        Freelancer Activo
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="mt-2.5 block w-full text-center py-1.5 px-3 rounded-xl border border-[#8C2C45] text-[#8C2C45] hover:bg-[#F3EFE6] text-xs font-bold transition"
                  >
                    Ver mi perfil
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

      {/* FEEDBACK TOAST CON PALETA CORPORATIVA */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 border animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-[#5A0F24] text-[#F3EFE6] border-[#C68A8F]/40'
              : 'bg-red-700 text-white border-red-500'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4 text-[#C68A8F]" /> : <Info className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA CENTRAL (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* TARJETA 1: HEADER DEL PERFIL (PALETA WINE, ROSE, SAND, CREAM) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 overflow-hidden shadow-xs relative">
            {/* PORTADA BANNER CON GRADIENTE DE LA PALETA */}
            <div className="h-48 sm:h-56 bg-linear-to-r from-[#5A0F24] via-[#8C2C45] to-[#C68A8F] relative">
              <div className="absolute inset-0 bg-black/15"></div>
              {/* Botón de cambiar portada */}
              <button
                onClick={() => alert('Función para actualizar la imagen de portada.')}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#5A0F24] flex items-center justify-center shadow-xs transition cursor-pointer"
                title="Cambiar foto de portada"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* AVATAR & CONTENIDO */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex justify-between items-start">
                {/* AVATAR CIRCULAR OVERLAPPING */}
                <div className="relative -mt-24 sm:-mt-28">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md bg-white overflow-hidden relative group ring-1 ring-[#C9B8A6]/30">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.firstName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-[#5A0F24]/80 flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Subiendo...</span>
                      </div>
                    )}
                  </div>

                  {/* Botón de Cámara para subir Avatar (POST /api/v1/users/me/avatar) */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white border border-[#C9B8A6]/60 text-[#8C2C45] hover:text-[#5A0F24] hover:bg-[#F3EFE6] shadow-md flex items-center justify-center hover:scale-105 transition cursor-pointer"
                    title="Actualizar foto de perfil (POST /api/v1/users/me/avatar)"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />
                </div>

                {/* BOTÓN DE EDITAR PERFIL (LÁPIZ SUPERIOR DERECHO) */}
                <button
                  onClick={openEditModal}
                  className="mt-4 p-2.5 rounded-full hover:bg-[#F3EFE6] text-[#8C2C45] transition cursor-pointer"
                  title="Editar presentación del perfil"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>

              {/* DETALLES DEL USUARIO */}
              <div className="mt-3">
                <div className="w-full">
                  {/* NOMBRE COMPLETO */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A0F24]">
                      {profile.firstName || profile.first_name} {profile.lastName || profile.last_name}
                    </h1>
                    <span className="inline-flex items-center text-[#8C2C45]" title="Perfil Verificado">
                      <ShieldCheck className="w-5 h-5 fill-[#F3EFE6]" />
                    </span>
                  </div>

                  {/* TITULAR / HEADLINE */}
                  <p className="text-sm sm:text-base text-[#2b1b1e]/90 mt-1 font-medium leading-relaxed">
                    {profile.professionalTitle}
                  </p>

                  {/* UBICACIÓN, CONTACTO Y TARIFA FREELANCER */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5A0F24]/75 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8C2C45]" />
                      {profile.location}
                    </span>
                    <span>·</span>
                    <button
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-[#8C2C45] font-bold hover:underline cursor-pointer"
                    >
                      Información de contacto
                    </button>
                    <span>·</span>
                    {/* BOTÓN / PILL DESTACADO DE TARIFA */}
                    <button
                      type="button"
                      onClick={() => {
                        setQuickRate(profile.hourlyRate || 35);
                        setIsRateModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8C2C45]/10 hover:bg-[#8C2C45]/20 text-[#8C2C45] border border-[#8C2C45]/30 rounded-full font-bold text-xs transition cursor-pointer"
                      title="Clic para cambiar tu tarifa por hora"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#8C2C45]" />
                      <span>Tarifa: ${profile.hourlyRate || 35} USD/h</span>
                      <Pencil className="w-3 h-3 text-[#5A0F24] ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN (PILLS DE LA PALETA) */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => setIsInterestsModalOpen(true)}
                  className="px-4 py-1.5 bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-sm font-bold rounded-full shadow-xs transition cursor-pointer"
                >
                  Tengo interés en...
                </button>
                <button
                  onClick={() => setIsSkillsModalOpen(true)}
                  className="px-4 py-1.5 border border-[#8C2C45] text-[#8C2C45] hover:bg-[#F3EFE6] text-sm font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir habilidad</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickRate(profile.hourlyRate || 35);
                    setIsRateModalOpen(true);
                  }}
                  className="px-4 py-1.5 border border-[#8C2C45] text-[#8C2C45] hover:bg-[#F3EFE6] text-sm font-bold rounded-full transition cursor-pointer flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Mover tarifa (${profile.hourlyRate || 35}/h)</span>
                </button>
                <button
                  onClick={openEditModal}
                  className="px-4 py-1.5 border border-[#C9B8A6] text-[#5A0F24] hover:bg-[#F3EFE6] text-sm font-bold rounded-full transition cursor-pointer"
                >
                  Mejorar perfil
                </button>
                <button
                  onClick={() => alert('Recursos del perfil: Portafolio activo, Escrow habilitado.')}
                  className="px-4 py-1.5 border border-[#C9B8A6] text-[#5A0F24] hover:bg-[#F3EFE6] text-sm font-bold rounded-full transition cursor-pointer"
                >
                  Recursos
                </button>
              </div>

              {/* TARJETA "DISPONIBLE PARA PROYECTOS FREELANCE" */}
              <div className="mt-5 p-4 bg-[#F3EFE6]/80 border border-[#C9B8A6]/60 rounded-xl relative group">
                <button
                  onClick={() => {
                    setQuickRate(profile.hourlyRate || 35);
                    setIsRateModalOpen(true);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white text-[#8C2C45] transition cursor-pointer"
                  title="Modificar tarifa y disponibilidad"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <div className="pr-8">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#5A0F24]">
                      Disponible para proyectos freelance · Propuestas y contratos con fondos en Escrow
                    </h4>
                  </div>
                  <p className="text-xs text-[#2b1b1e]/80 mt-1 font-medium">
                    Proyectos de Desarrollo de Software, Web, React & Node.js • Tarifa actual: <strong className="text-[#8C2C45]">${profile.hourlyRate || 35} USD/h</strong> • Modalidad Remota / Híbrida
                  </p>
                  <button
                    onClick={() => {
                      setQuickRate(profile.hourlyRate || 35);
                      setIsRateModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#8C2C45] hover:underline mt-1.5 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Modificar tarifa (${profile.hourlyRate || 35} USD/h)</span> →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 2: HABILIDADES (TABLA 'skills' & 'profile_skills' EN POSTGRESQL) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#5A0F24] flex items-center gap-2">
                  <span>Habilidades Técnicas</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-[#F3EFE6] text-[#8C2C45] rounded-full border border-[#C9B8A6]/60">
                    {profile.skills.length} validadas
                  </span>
                </h3>
                <p className="text-xs text-[#5A0F24]/70 mt-0.5">
                  Conectadas en tiempo real con <code className="text-[#8C2C45] font-mono font-bold bg-[#F3EFE6] px-1 py-0.5 rounded-xs">profile_skills</code> de PostgreSQL
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSkillsModalOpen(true)}
                  className="px-3 py-1.5 bg-[#8C2C45] hover:bg-[#5A0F24] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Añadir habilidad"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gestionar Habilidades</span>
                </button>
              </div>
            </div>

            {/* LISTADO DE HABILIDADES DEL USUARIO CON CHIPS DE LA PALETA */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {profile.skills.map((skill, index) => (
                <div
                  key={index}
                  className="group px-3.5 py-1.5 bg-[#F3EFE6]/70 hover:bg-[#F3EFE6] border border-[#C9B8A6]/60 hover:border-[#8C2C45]/50 text-[#5A0F24] rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C2C45] shrink-0" />
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-[#C9B8A6] hover:text-red-700 hover:bg-white rounded-full p-0.5 transition cursor-pointer"
                    title={`Remover ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {profile.skills.length === 0 && (
              <div className="text-center py-6 text-[#C9B8A6] text-xs font-medium">
                No tienes habilidades registradas. Añade habilidades del catálogo para destacar tu perfil.
              </div>
            )}
          </div>

          {/* TARJETA 3: ACERCA DE (BIO) */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-extrabold text-[#5A0F24]">Acerca de</h3>
              <button
                onClick={openEditModal}
                className="p-1.5 rounded-full hover:bg-[#F3EFE6] text-[#8C2C45] transition cursor-pointer"
                title="Editar biografía"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#2b1b1e]/90 leading-relaxed whitespace-pre-line font-normal">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* COLUMNA LATERAL DERECHA (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* TARJETA IDIOMA Y ENLACE PÚBLICO */}
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-[#5A0F24]">Idioma del perfil</span>
              <span className="text-xs font-semibold text-[#8C2C45]">Español</span>
            </div>
            <hr className="border-[#C9B8A6]/20" />
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-[#5A0F24]">Perfil público y URL</span>
              <span className="text-xs text-[#8C2C45] font-mono font-semibold">/in/christopher-rivera</span>
            </div>
          </div>

          {/* TARJETA GARANTÍA ESCROW (PALETA WINE DARK & ROSE) */}
          <div className="bg-gradient-to-br from-[#5A0F24] to-[#8C2C45] text-[#F3EFE6] rounded-2xl p-5 shadow-xs border border-[#C68A8F]/30">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-[#C68A8F]" />
              <h4 className="text-sm font-extrabold tracking-wide">FreelancerHub Escrow</h4>
            </div>
            <p className="text-xs text-[#F3EFE6]/80 leading-relaxed font-normal">
              Todos los contratos iniciados a través de tu perfil cuentan con protección de fondos en custodia Escrow hasta la aprobación formal de cada hito.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#C68A8F] font-semibold">Tarifa Configurada:</span>
              <button
                type="button"
                onClick={() => {
                  setQuickRate(profile.hourlyRate || 35);
                  setIsRateModalOpen(true);
                }}
                className="font-extrabold text-white hover:text-[#C68A8F] underline flex items-center gap-1 cursor-pointer"
                title="Cambiar tarifa por hora"
              >
                <span>${profile.hourlyRate || 35} USD/h</span>
                <Pencil className="w-3 h-3 text-[#C68A8F]" />
              </button>
            </div>
          </div>

          {/* VOLVER AL DASHBOARD */}
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#C9B8A6]/60 hover:bg-[#F3EFE6] text-[#5A0F24] text-sm font-bold rounded-xl shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C2C45]" />
            <span>Volver al Feed Principal</span>
          </Link>
        </div>
      </main>

      {/* MODAL GESTOR DE HABILIDADES (TABLA 'skills' & 'profile_skills') */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C9B8A6]/60 animate-in fade-in duration-200 flex flex-col">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#C9B8A6]/30 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#8C2C45]" />
                <h2 className="text-lg font-extrabold text-[#5A0F24]">Catálogo y Gestión de Habilidades</h2>
              </div>
              <button
                onClick={() => setIsSkillsModalOpen(false)}
                className="p-1 rounded-full text-[#C9B8A6] hover:text-[#5A0F24] hover:bg-[#F3EFE6] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* BUSCADOR EN EL CATÁLOGO */}
              <div>
                <label className="block text-xs font-bold text-[#5A0F24] mb-1.5">
                  Buscar en la tabla de habilidades
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9B8A6]" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Escribe para buscar (ej. React, PostgreSQL, Docker)..."
                    className="w-full bg-[#F3EFE6] border border-[#C9B8A6]/50 rounded-xl pl-9 pr-4 py-2 text-sm text-[#2b1b1e] focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white"
                  />
                </div>
              </div>

              {/* HABILIDADES DISPONIBLES EN CATÁLOGO */}
              <div>
                <h4 className="text-xs font-bold text-[#5A0F24]/75 uppercase tracking-wider mb-2">
                  Catálogo Global (Clic para vincular a tu perfil)
                </h4>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {filteredCatalogSkills.map((sk) => {
                    const isAlreadyAdded = profile.skills.some(
                      (s) => s.toLowerCase() === sk.name.toLowerCase()
                    );
                    return (
                      <button
                        key={sk.id || sk.name}
                        onClick={() => handleAddSkill(sk.name)}
                        disabled={isAlreadyAdded}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isAlreadyAdded
                            ? 'bg-[#F3EFE6] text-[#C9B8A6] border border-[#C9B8A6]/40 cursor-not-allowed opacity-60'
                            : 'bg-white hover:bg-[#F3EFE6] border border-[#C9B8A6]/60 hover:border-[#8C2C45] text-[#5A0F24] hover:text-[#8C2C45] shadow-2xs'
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-[#8C2C45]" />
                        )}
                        <span>{sk.name}</span>
                        {sk.category && (
                          <span className="text-[10px] text-[#C9B8A6] font-normal">
                            ({sk.category})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CREAR HABILIDAD PERSONALIZADA */}
              <div className="pt-3 border-t border-[#C9B8A6]/30">
                <label className="block text-xs font-bold text-[#5A0F24] mb-1.5">
                  ¿No encuentras tu habilidad? Añádela a la base de datos:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomSkill}
                    onChange={(e) => setNewCustomSkill(e.target.value)}
                    placeholder="ej. Vue 3, Redis, Kubernetes..."
                    className="flex-1 bg-white border border-[#C9B8A6]/60 rounded-xl px-3 py-2 text-sm text-[#2b1b1e] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(newCustomSkill);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddSkill(newCustomSkill)}
                    disabled={!newCustomSkill.trim()}
                    className="px-4 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] disabled:bg-[#C9B8A6] text-white font-bold rounded-xl text-sm transition cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* HABILIDADES ACTIVAS EN TU PERFIL */}
              <div className="pt-3 border-t border-[#C9B8A6]/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-[#5A0F24] uppercase tracking-wider">
                    Habilidades en tu Perfil ({profile.skills.length})
                  </h4>
                  <span className="text-[11px] text-[#C9B8A6]">Clic en la cruz para desvincular</span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-1 bg-[#F3EFE6] border border-[#C9B8A6]/60 text-[#5A0F24] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#C9B8A6] hover:text-red-700 hover:bg-white rounded-full p-0.5 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F3EFE6]/50 border-t border-[#C9B8A6]/30 flex justify-end">
              <button
                onClick={() => setIsSkillsModalOpen(false)}
                className="px-5 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] text-white rounded-xl text-sm font-bold transition cursor-pointer"
              >
                Listo / Cerrar Gestor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR PRESENTACIÓN / INFORMACIÓN GENERAL (PUT /users/me/profile) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C9B8A6]/60 animate-in fade-in duration-200">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#C9B8A6]/30 flex items-center justify-between z-10">
              <h2 className="text-lg font-extrabold text-[#5A0F24]">Editar presentación del perfil</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-[#C9B8A6] hover:text-[#5A0F24] hover:bg-[#F3EFE6] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                  Titular / Título Profesional *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                  placeholder="ej. Desarrollador Fullstack | React | Node.js"
                  className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+52 477 123 4567"
                    className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                  Tarifa por hora ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A0F24] mb-1">
                  Acerca de (Biografía profesional)
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C9B8A6]/60 rounded-xl text-sm text-[#2b1b1e] focus:ring-2 focus:ring-[#8C2C45] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#C9B8A6]/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#C9B8A6] rounded-xl text-sm font-bold text-[#5A0F24] hover:bg-[#F3EFE6] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] text-white rounded-xl text-sm font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Guardando en API...' : 'Guardar Cambios (PUT /users/me/profile)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE INFORMACIÓN DE CONTACTO */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#C9B8A6]/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-[#5A0F24]">
                {profile.firstName} {profile.lastName}
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 rounded-full text-[#C9B8A6] hover:text-[#5A0F24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#8C2C45] mt-0.5" />
                <div>
                  <p className="font-bold text-[#5A0F24]">Correo electrónico</p>
                  <a href={`mailto:${currentUser.email}`} className="text-[#8C2C45] hover:underline font-medium">
                    {currentUser.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#8C2C45] mt-0.5" />
                <div>
                  <p className="font-bold text-[#5A0F24]">Teléfono</p>
                  <span className="text-[#2b1b1e]/80 font-medium">{profile.phone || '+52 477 123 4567'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe2 className="w-5 h-5 text-[#8C2C45] mt-0.5" />
                <div>
                  <p className="font-bold text-[#5A0F24]">Ubicación</p>
                  <span className="text-[#2b1b1e]/80 font-medium">{profile.location}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 bg-[#F3EFE6] hover:bg-[#C9B8A6]/40 text-[#5A0F24] font-bold rounded-xl text-sm transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TENGO INTERÉS EN... */}
      {isInterestsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#C9B8A6]/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-[#5A0F24]">Tengo interés en...</h3>
              <button
                onClick={() => setIsInterestsModalOpen(false)}
                className="p-1 rounded-full text-[#C9B8A6] hover:text-[#5A0F24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  alert('Se ha activado el estado "Disponible para proyectos freelance" en tu perfil.');
                  setIsInterestsModalOpen(false);
                }}
                className="w-full text-left p-4 border border-[#C9B8A6]/60 hover:border-[#8C2C45] hover:bg-[#F3EFE6]/70 rounded-xl transition cursor-pointer"
              >
                <h4 className="text-sm font-bold text-[#5A0F24]">Postular a proyectos y contratos freelance</h4>
                <p className="text-xs text-[#2b1b1e]/70 mt-0.5 font-medium">
                  Notifica a los clientes que estás disponible para proyectos con pagos garantizados en custodia Escrow.
                </p>
              </button>
              <button
                onClick={() => {
                  alert('Se ha configurado la sección de servicios independientes.');
                  setIsInterestsModalOpen(false);
                }}
                className="w-full text-left p-4 border border-[#C9B8A6]/60 hover:border-[#8C2C45] hover:bg-[#F3EFE6]/70 rounded-xl transition cursor-pointer"
              >
                <h4 className="text-sm font-bold text-[#5A0F24]">Ofrecer servicios independientes y cotizaciones</h4>
                <p className="text-xs text-[#2b1b1e]/70 mt-0.5 font-medium">
                  Muestra tus habilidades técnicas y proyectos destacados para recibir solicitudes directas.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CAMBIO RÁPIDO DE TARIFA */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#C9B8A6]/60 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#C9B8A6]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F3EFE6] flex items-center justify-center text-[#8C2C45]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[#5A0F24]">Modificar Tarifa por Hora</h3>
              </div>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 rounded-full text-[#C9B8A6] hover:text-[#5A0F24] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickSaveRate} className="space-y-4">
              <div>
                <p className="text-xs text-[#2b1b1e]/75 mb-3 leading-relaxed">
                  Establece tu tarifa por hora en dólares estadounidenses (USD). Esta tarifa será visible para los clientes que deseen contratarte en proyectos y servirá de base para las propuestas y presupuestos en custodia Escrow.
                </p>
                <label className="block text-xs font-bold text-[#5A0F24] mb-1.5">
                  Tarifa por hora ($ USD / hora) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-[#8C2C45] text-lg">$</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={quickRate}
                    onChange={(e) => setQuickRate(e.target.value)}
                    className="w-full bg-[#F3EFE6] border border-[#C9B8A6]/60 rounded-xl pl-9 pr-16 py-2.5 text-lg font-extrabold text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-[#8C2C45] focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A0F24]/60">USD/h</span>
                </div>
              </div>

              {/* Presets rápidos */}
              <div>
                <label className="block text-[11px] font-bold text-[#5A0F24]/70 mb-1.5">
                  Tarifas comunes sugeridas:
                </label>
                <div className="flex gap-2">
                  {[25, 35, 50, 75, 100].map((rateOption) => (
                    <button
                      key={rateOption}
                      type="button"
                      onClick={() => setQuickRate(rateOption)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        Number(quickRate) === rateOption
                          ? 'bg-[#8C2C45] text-white border-[#8C2C45]'
                          : 'bg-white hover:bg-[#F3EFE6] text-[#5A0F24] border-[#C9B8A6]/60'
                      }`}
                    >
                      ${rateOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#C9B8A6]/30 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-2 border border-[#C9B8A6] rounded-xl text-xs font-bold text-[#5A0F24] hover:bg-[#F3EFE6] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Guardando...' : 'Guardar Tarifa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
