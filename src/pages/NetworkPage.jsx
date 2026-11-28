import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  MessageSquare,
  ArrowLeft,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Filter,
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import { chatApi } from '../api/chat.api.js';
import { projectApi } from '../api/project.api.js';
import { proposalApi } from '../api/proposal.api.js';
import { profileApi } from '../api/profile.api.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useChatStore } from '../stores/chat.store.js';
import { resolveAvatarUrl, getAvatarInitials } from '../utils/avatar.js';

/**
 * Extracts a clean full name from any user, profile or contract object,
 * preventing fallback to a generic placeholder like "Colaborador".
 */
function extractPersonName(source, fallback = 'Colaborador') {
  if (!source) return fallback;
  if (typeof source === 'string' && source.trim()) return source.trim();

  const p = source.profile || source;
  const firstName =
    source.firstName || source.first_name || p.firstName || p.first_name || '';
  const lastName =
    source.lastName || source.last_name || p.lastName || p.last_name || '';
  const combined = `${firstName} ${lastName}`.trim();
  if (combined) return combined;

  if (source.fullName && source.fullName.trim()) return source.fullName.trim();
  if (source.name && source.name.trim()) return source.name.trim();
  if (p.fullName && p.fullName.trim()) return p.fullName.trim();
  if (p.name && p.name.trim()) return p.name.trim();

  if (source.email) {
    const handle = source.email.split('@')[0];
    return handle
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  }

  return fallback;
}

/**
 * Normalizes an array of skills from objects or strings into clean strings.
 */
function normalizeSkillsList(rawSkills) {
  if (!Array.isArray(rawSkills)) return [];
  return rawSkills
    .map((s) => (typeof s === 'string' ? s.trim() : s?.name?.trim() || ''))
    .filter(Boolean);
}

export default function NetworkPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startConversation } = useChatStore();

  const currentUserId = user?.id || user?.sub || '';
  const isClient = user?.role === 'CLIENT';

  // State
  const [activeTab, setActiveTab] = useState('people'); // 'people' | 'projects'
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'CLIENT' | 'FREELANCER' | 'COLLABORATORS'
  const [contacts, setContacts] = useState([]);
  const [networkProjects, setNetworkProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingChatId, setLoadingChatId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      apiClient.get('/v1/contracts').catch(() => ({ data: { data: [] } })),
      chatApi.getContacts().catch(() => []),
      projectApi.getProjects().catch(() => ({ data: [] })),
      proposalApi.getMyProposals().catch(() => []),
      apiClient.get('/v1/skills').catch(() => ({ data: { data: [] } })),
    ])
      .then(async ([contractsRes, contactsRes, projectsRes, proposalsRes, skillsRes]) => {
        if (!isMounted) return;

        // 1. Process contracts for collaboration history
        const rawContracts =
          contractsRes.status === 'fulfilled'
            ? contractsRes.value?.data?.data || contractsRes.value?.data || []
            : [];
        const contractedProjectIds = new Set();
        const uniquePeopleMap = new Map();

        if (Array.isArray(rawContracts)) {
          rawContracts.forEach((c) => {
            const projId = c.project?.id || c.projectId || c.id;
            if (projId) contractedProjectIds.add(String(projId));

            // Identify partner (the collaborator)
            const isFreelancerUser = c.freelancer?.id === currentUserId;
            const partner = isFreelancerUser
              ? c.client
              : c.client?.id === currentUserId
                ? c.freelancer
                : c.client || c.freelancer;

            const partnerId = partner?.id || (isFreelancerUser ? c.clientId : c.freelancerId);
            const isFreelancerPartner = partner?.role === 'FREELANCER' || !isFreelancerUser;

            if (partnerId && partnerId !== currentUserId) {
              const existing = uniquePeopleMap.get(partnerId);

              // Extract avatar from all possible locations (profile, user, contract)
              const rawAvatar =
                partner?.profile?.avatarUrl ||
                partner?.avatarUrl ||
                partner?.avatar ||
                partner?.photoUrl ||
                partner?.image ||
                (isFreelancerPartner
                  ? c.freelancerAvatar || c.freelancerProfile?.avatarUrl
                  : c.clientAvatar || c.clientProfile?.avatarUrl);

              const resolvedAvatar = rawAvatar ? resolveAvatarUrl(rawAvatar) : null;

              // Extract real person name (avoiding generic "Colaborador" placeholder)
              const nameFromPartner = extractPersonName(partner, '');
              const nameFromContract = isFreelancerPartner
                ? c.freelancerName || extractPersonName(c.freelancer, '')
                : c.clientName || extractPersonName(c.client, '');

              const fullName =
                nameFromPartner ||
                nameFromContract ||
                extractPersonName(partner, 'Colaborador');

              const role = (
                partner?.role ||
                partner?.userRole ||
                (isFreelancerPartner ? 'FREELANCER' : 'CLIENT')
              ).toUpperCase();

              // Extract skills and professional title
              const rawPersonSkills =
                partner?.skills ||
                partner?.profile?.skills ||
                (isFreelancerPartner ? c.project?.skills : []);
              const personSkills = normalizeSkillsList(rawPersonSkills);

              const professionalTitle =
                partner?.professionalTitle ||
                partner?.profile?.professionalTitle ||
                (isFreelancerPartner ? c.freelancerRole : null);

              uniquePeopleMap.set(partnerId, {
                id: partnerId,
                fullName,
                email: partner?.email || '',
                role,
                avatarUrl: resolvedAvatar,
                skills: personSkills,
                professionalTitle,
                projectTitle: c.project?.title || c.projectTitle || 'Proyecto en FreelancerHub',
                isPreviousCollaborator: true,
                contractsCount: (existing?.contractsCount || 0) + 1,
              });
            }
          });
        }

        // 2. Process platform directory contacts from chat API
        const rawContacts =
          contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value)
            ? contactsRes.value
            : [];

        rawContacts.forEach((ct) => {
          if (ct.id && ct.id !== currentUserId && !uniquePeopleMap.has(ct.id)) {
            const rawAvatar =
              ct?.profile?.avatarUrl ||
              ct?.avatarUrl ||
              ct?.avatar ||
              ct?.photoUrl ||
              ct?.image;

            const resolvedAvatar = rawAvatar ? resolveAvatarUrl(rawAvatar) : null;
            const fullName = extractPersonName(ct, 'Usuario');
            const personSkills = normalizeSkillsList(ct?.skills || ct?.profile?.skills);
            const professionalTitle =
              ct?.professionalTitle || ct?.profile?.professionalTitle || null;

            uniquePeopleMap.set(ct.id, {
              id: ct.id,
              fullName,
              email: ct.email || '',
              role: (ct.userRole || ct.role || 'FREELANCER').toUpperCase(),
              avatarUrl: resolvedAvatar,
              skills: personSkills,
              professionalTitle,
              projectTitle: null,
              isPreviousCollaborator: false,
              contractsCount: 0,
            });
          }
        });

        // 3. Process proposals to identify projects the freelancer already applied to
        const rawProposals =
          proposalsRes.status === 'fulfilled' && Array.isArray(proposalsRes.value)
            ? proposalsRes.value
            : [];
        const appliedProjectIds = new Set();
        rawProposals.forEach((prop) => {
          if (prop.projectId) appliedProjectIds.add(String(prop.projectId));
        });

        try {
          const localStored = JSON.parse(
            localStorage.getItem('fh_submitted_proposals') || '[]'
          );
          if (Array.isArray(localStored)) {
            localStored.forEach((entry) => {
              if (entry.projectId && (!entry.userId || entry.userId === currentUserId)) {
                appliedProjectIds.add(String(entry.projectId));
              }
            });
          }
        } catch {
          // Ignore parse errors
        }

        // 4. Process projects: Filter for open client projects the freelancer does NOT have
        const rawProjects =
          projectsRes.status === 'fulfilled'
            ? projectsRes.value?.data || []
            : [];
        const openClientProjects = [];

        if (Array.isArray(rawProjects)) {
          rawProjects.forEach((p) => {
            const pId = String(p.id);
            const isAssigned = contractedProjectIds.has(pId);
            const hasApplied = appliedProjectIds.has(pId);
            const isOpen = !p.status || p.status === 'ABIERTO';

            if (isOpen && !isAssigned && !hasApplied) {
              const clientInNetwork =
                p.clientId && uniquePeopleMap.has(p.clientId)
                  ? uniquePeopleMap.get(p.clientId)
                  : null;

              const clientRawAvatar =
                p.clientAvatar ||
                p.client?.profile?.avatarUrl ||
                p.client?.avatarUrl ||
                clientInNetwork?.avatarUrl;

              const resolvedClientName =
                p.clientName ||
                clientInNetwork?.fullName ||
                extractPersonName(p.client, 'Cliente de la Red');

              openClientProjects.push({
                ...p,
                clientInNetwork: Boolean(clientInNetwork),
                isCollaboratorClient: clientInNetwork?.isPreviousCollaborator || false,
                clientResolvedName: resolvedClientName,
                clientAvatar: clientRawAvatar ? resolveAvatarUrl(clientRawAvatar) : null,
              });
            }
          });
        }

        openClientProjects.sort((a, b) => {
          if (a.isCollaboratorClient && !b.isCollaboratorClient) return -1;
          if (!a.isCollaboratorClient && b.isCollaboratorClient) return 1;
          return 0;
        });

        const initialPeopleList = Array.from(uniquePeopleMap.values());
        setContacts(initialPeopleList);
        setNetworkProjects(openClientProjects);

        // 5. Skills catalog
        const rawSkills =
          skillsRes.status === 'fulfilled'
            ? skillsRes.value?.data?.data || skillsRes.value?.data || []
            : [];
        if (Array.isArray(rawSkills)) {
          setSkills(rawSkills.slice(0, 14));
        }

        // 6. Enrich profiles: fetch name, avatar, professional title and skills from API
        const peopleNeedingEnrichment = initialPeopleList.filter(
          (p) =>
            !p.avatarUrl ||
            p.fullName === 'Colaborador' ||
            p.fullName === 'Usuario' ||
            !p.skills ||
            p.skills.length === 0
        );

        if (peopleNeedingEnrichment.length > 0) {
          Promise.allSettled(
            peopleNeedingEnrichment.map((person) =>
              profileApi
                .getProfileById(person.id)
                .then((res) => {
                  const pData = res?.data;
                  const foundAvatar =
                    pData?.avatarUrl ||
                    pData?.profile?.avatarUrl ||
                    pData?.avatar ||
                    pData?.photoUrl;

                  const foundName = extractPersonName(pData, '');
                  const foundSkills = normalizeSkillsList(pData?.skills || pData?.profile?.skills);
                  const foundTitle =
                    pData?.professionalTitle || pData?.profile?.professionalTitle || null;

                  return {
                    id: person.id,
                    avatarUrl: foundAvatar ? resolveAvatarUrl(foundAvatar) : null,
                    fullName: foundName || null,
                    skills: foundSkills.length > 0 ? foundSkills : null,
                    professionalTitle: foundTitle || null,
                  };
                })
                .catch(() => null)
            )
          ).then((results) => {
            if (!isMounted) return;
            const updatesMap = new Map();

            results.forEach((r) => {
              if (r.status === 'fulfilled' && r.value) {
                updatesMap.set(r.value.id, r.value);
              }
            });

            if (updatesMap.size > 0) {
              setContacts((prev) =>
                prev.map((person) => {
                  const update = updatesMap.get(person.id);
                  if (!update) return person;
                  return {
                    ...person,
                    avatarUrl:
                      update.avatarUrl !== undefined ? update.avatarUrl : person.avatarUrl,
                    fullName:
                      update.fullName &&
                      (person.fullName === 'Colaborador' ||
                        person.fullName === 'Usuario' ||
                        !person.fullName)
                        ? update.fullName
                        : person.fullName,
                    skills:
                      update.skills && (!person.skills || person.skills.length === 0)
                        ? update.skills
                        : person.skills,
                    professionalTitle:
                      update.professionalTitle || person.professionalTitle,
                  };
                })
              );
            }
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Direct Message action: initiates or opens chat immediately
  const handleDirectMessage = async (person, projectContext = null) => {
    if (!person?.id) return;
    setLoadingChatId(person.id);
    try {
      const conv = await startConversation({
        peerId: person.id,
        projectId: projectContext?.id || null,
        projectName: projectContext?.title || person.projectTitle || undefined,
      });
      if (conv?.id) {
        navigate(`/messages/${conv.id}`);
      } else {
        navigate('/messages');
      }
    } catch {
      navigate('/messages');
    } finally {
      setLoadingChatId(null);
    }
  };

  // Filtered contacts list
  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      // Role filter
      if (roleFilter === 'CLIENT' && c.role !== 'CLIENT') return false;
      if (roleFilter === 'FREELANCER' && c.role !== 'FREELANCER') return false;
      if (roleFilter === 'COLLABORATORS' && !c.isPreviousCollaborator) return false;

      // Skill filter
      if (selectedSkill) {
        const hasSkill =
          Array.isArray(c.skills) &&
          c.skills.some((sk) => {
            const sName = typeof sk === 'string' ? sk : sk?.name;
            return sName && sName.toLowerCase() === selectedSkill.toLowerCase();
          });
        if (!hasSkill) return false;
      }

      // Search query
      const matchesSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        (c.projectTitle && c.projectTitle.toLowerCase().includes(q)) ||
        (c.professionalTitle && c.professionalTitle.toLowerCase().includes(q)) ||
        (Array.isArray(c.skills) &&
          c.skills.some((sk) =>
            (typeof sk === 'string' ? sk : sk?.name)
              ?.toLowerCase()
              .includes(q)
          )) ||
        (c.email && c.email.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [contacts, roleFilter, search, selectedSkill]);

  // Filtered network projects list
  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return networkProjects.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.clientResolvedName && p.clientResolvedName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchesSkill =
        !selectedSkill ||
        (Array.isArray(p.skills) &&
          p.skills.some((sk) =>
            typeof sk === 'string'
              ? sk.toLowerCase() === selectedSkill.toLowerCase()
              : sk.name?.toLowerCase() === selectedSkill.toLowerCase()
          ));

      return matchesSearch && matchesSkill;
    });
  }, [networkProjects, search, selectedSkill]);

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#2b1b1e]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#C9B8A6]/40 px-4 sm:px-8 h-14 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl hover:bg-[#F3EFE6] text-[#5A0F24] transition cursor-pointer"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8C2C45]" />
            <h1 className="text-base sm:text-lg font-extrabold text-[#5A0F24]">Mi red</h1>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8C2C45]/10 text-[#8C2C45] border border-[#8C2C45]/20">
            {isClient ? 'Modo Cliente' : 'Modo Freelancer'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] flex items-center gap-1.5 transition"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Explorar proyectos</span>
          </Link>
          <button
            onClick={() => navigate('/messages')}
            className="p-2 rounded-xl hover:bg-[#F3EFE6] text-[#5A0F24] transition cursor-pointer"
            title="Bandeja de mensajes"
          >
            <MessageSquare className="w-4 h-4 text-[#8C2C45]" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Main Tab Switcher */}
        <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-1.5 shadow-xs flex gap-1">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'people'
                ? 'bg-[#8C2C45] text-white shadow-xs'
                : 'text-[#5A0F24]/70 hover:text-[#5A0F24] hover:bg-[#F3EFE6]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personas y Conexiones</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'people'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F3EFE6] text-[#5A0F24]'
              }`}
            >
              {contacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#8C2C45] text-white shadow-xs'
                : 'text-[#5A0F24]/70 hover:text-[#5A0F24] hover:bg-[#F3EFE6]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Oportunidades de Clientes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'projects'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F3EFE6] text-[#5A0F24]'
              }`}
            >
              {networkProjects.length}
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#5A0F24]">
                {activeTab === 'people'
                  ? 'Contacta y Conecta Directamente'
                  : 'Proyectos de Clientes que no Tienes'}
              </h2>
              <p className="text-xs text-[#2b1b1e]/60">
                {activeTab === 'people'
                  ? 'Escribe un mensaje directo a clientes o colegas sin intermediarios ni esperas de solicitud.'
                  : 'Proyectos abiertos de clientes en los que aún no participas ni has enviado propuesta.'}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#C9B8A6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === 'people'
                    ? 'Buscar por nombre, título o habilidad...'
                    : 'Buscar en proyectos disponibles...'
                }
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F3EFE6]/60 border border-[#C9B8A6]/40 rounded-xl focus:outline-none focus:border-[#8C2C45]"
              />
            </div>
          </div>

          {/* Sub-filters for People */}
          {activeTab === 'people' && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#C9B8A6]/20">
              <span className="text-[11px] font-bold text-[#5A0F24]/70 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filtrar:
              </span>
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'CLIENT', label: 'Clientes' },
                { id: 'FREELANCER', label: 'Freelancers' },
                { id: 'COLLABORATORS', label: 'Colaboradores previos' },
              ].map((filter) => {
                const active = roleFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setRoleFilter(filter.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-[#8C2C45] text-white shadow-xs'
                        : 'bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#C9B8A6]/30'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Skills Filter Chips (Available for both tabs) */}
          {skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#C9B8A6]/20">
              <span className="text-[11px] font-bold text-[#5A0F24]/70 mr-1">Habilidad:</span>
              <button
                onClick={() => setSelectedSkill('')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                  !selectedSkill
                    ? 'bg-[#8C2C45] text-white shadow-xs'
                    : 'bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#C9B8A6]/30'
                }`}
              >
                Todas
              </button>
              {skills.map((s) => {
                const name = typeof s === 'string' ? s : s.name;
                const active = selectedSkill === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSkill(active ? '' : name)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-[#8C2C45] text-white shadow-xs'
                        : 'bg-[#F3EFE6] text-[#5A0F24] hover:bg-[#C9B8A6]/30'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-12 text-center text-xs text-[#2b1b1e]/60 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#8C2C45] mx-auto" />
            <p>Cargando perfiles y conexiones de tu red...</p>
          </div>
        ) : activeTab === 'people' ? (
          /* TAB 1: PEOPLE & CONNECTIONS */
          filteredContacts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-10 text-center space-y-4">
              <Users className="w-10 h-10 text-[#8C2C45] mx-auto opacity-70" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-extrabold text-[#5A0F24]">
                  No se encontraron contactos con este filtro
                </h3>
                <p className="text-xs text-[#2b1b1e]/60">
                  Prueba cambiando los filtros de rol o habilidad. Puedes escribirle a cualquier persona de la comunidad.
                </p>
              </div>
              <button
                onClick={() => {
                  setRoleFilter('ALL');
                  setSelectedSkill('');
                  setSearch('');
                }}
                className="px-4 py-2 bg-[#F3EFE6] hover:bg-[#C9B8A6]/40 text-[#5A0F24] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Ver todos los contactos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((person) => {
                const isDirectLoading = loadingChatId === person.id;
                const hasCustomPhoto = Boolean(person.avatarUrl);
                const hasSkills = Array.isArray(person.skills) && person.skills.length > 0;

                return (
                  <div
                    key={person.id}
                    className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 sm:p-5 shadow-xs hover:border-[#8C2C45]/40 transition flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Top Person Info */}
                      <div className="flex items-start gap-3">
                        {/* Profile Avatar: Custom Photo or Initials Letter Badge */}
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#C9B8A6]/40 shrink-0 bg-[#F3EFE6] flex items-center justify-center shadow-xs">
                          {hasCustomPhoto ? (
                            <img
                              src={person.avatarUrl}
                              alt={person.fullName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback =
                                  e.currentTarget.parentElement?.querySelector(
                                    '.avatar-letter-fallback'
                                  );
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                          ) : null}

                          <div
                            className={`avatar-letter-fallback w-full h-full flex items-center justify-center font-extrabold text-sm ${
                              person.role === 'CLIENT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#8C2C45] text-white'
                            } ${hasCustomPhoto ? 'hidden' : ''}`}
                          >
                            {getAvatarInitials(person.fullName)}
                          </div>
                        </div>

                        {/* Person Name, Role & Collaborator Badge */}
                        <div className="min-w-0 flex-1">
                          <h4
                            className="text-sm font-bold text-[#5A0F24] truncate"
                            title={person.fullName}
                          >
                            {person.fullName}
                          </h4>

                          {/* Professional Title (if any) */}
                          {person.professionalTitle && (
                            <p className="text-[11px] font-medium text-[#8C2C45] truncate mt-0.5">
                              {person.professionalTitle}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                person.role === 'CLIENT'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {person.role === 'CLIENT' ? 'Cliente' : 'Freelancer'}
                            </span>
                            {person.isPreviousCollaborator && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#8C2C45]/10 text-[#8C2C45] flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Colaborador
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Freelancer Skills Chips (Enriching the card) */}
                      {hasSkills && (
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2b1b1e]/50">
                            Habilidades
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {person.skills.slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 bg-[#F3EFE6] text-[#5A0F24] font-semibold rounded-md border border-[#C9B8A6]/40"
                              >
                                {typeof sk === 'string' ? sk : sk.name}
                              </span>
                            ))}
                            {person.skills.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-[#2b1b1e]/50 font-semibold self-center">
                                +{person.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Shared Project Context */}
                      {person.projectTitle ? (
                        <div className="bg-[#F3EFE6]/60 rounded-xl p-2.5 text-xs text-[#2b1b1e]/80 border border-[#C9B8A6]/30">
                          <p className="text-[10px] font-bold text-[#8C2C45] uppercase tracking-wider mb-0.5">
                            Proyecto compartido
                          </p>
                          <p className="truncate font-medium">{person.projectTitle}</p>
                        </div>
                      ) : !hasSkills ? (
                        <p className="text-xs text-[#2b1b1e]/50 italic">
                          Contacto en FreelancerHub
                        </p>
                      ) : null}
                    </div>

                    {/* Direct Message Action */}
                    <button
                      onClick={() => handleDirectMessage(person)}
                      disabled={isDirectLoading}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isDirectLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Abriendo chat...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Enviar mensaje directo</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* TAB 2: PROJECTS AVAILABLE (NOT YET TAKEN) */
          filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-10 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-extrabold text-[#5A0F24]">
                  No hay proyectos pendientes en este momento
                </h3>
                <p className="text-xs text-[#2b1b1e]/60">
                  Ya estás postulado o contratado en los proyectos disponibles, o no hay convocatorias abiertas que coincidan con la búsqueda.
                </p>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Briefcase className="w-4 h-4" />
                <span>Explorar todo el catálogo de proyectos</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => {
                const isDirectLoading = loadingChatId === project.clientId;
                const hasProjectPhoto = Boolean(project.clientAvatar);

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-5 shadow-xs hover:border-[#8C2C45]/40 transition flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Client Header in Project Card */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Client Avatar: Photo or Initials */}
                          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#C9B8A6] shrink-0 bg-[#F3EFE6] flex items-center justify-center">
                            {hasProjectPhoto ? (
                              <img
                                src={project.clientAvatar}
                                alt={project.clientResolvedName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback =
                                    e.currentTarget.parentElement?.querySelector(
                                      '.project-avatar-fallback'
                                    );
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}

                            <div
                              className={`project-avatar-fallback w-full h-full flex items-center justify-center font-extrabold text-[11px] bg-amber-100 text-amber-800 ${
                                hasProjectPhoto ? 'hidden' : ''
                              }`}
                            >
                              {getAvatarInitials(project.clientResolvedName)}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p
                              className="text-xs font-bold text-[#5A0F24] truncate"
                              title={project.clientResolvedName}
                            >
                              {project.clientResolvedName}
                            </p>
                            <p className="text-[10px] text-[#2b1b1e]/50">
                              Cliente convocante
                            </p>
                          </div>
                        </div>

                        {project.isCollaboratorClient && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Cliente de tu red
                          </span>
                        )}
                      </div>

                      {/* Project Info */}
                      <div>
                        <h4 className="text-sm font-extrabold text-[#5A0F24] leading-snug line-clamp-1">
                          {project.title}
                        </h4>
                        <p className="text-xs text-[#2b1b1e]/70 line-clamp-2 mt-1">
                          {project.description ||
                            'Proyecto abierto para postulación inmediata.'}
                        </p>
                      </div>

                      {/* Budget & Meta */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C9B8A6]/20">
                        <div>
                          <span className="text-[10px] font-bold text-[#2b1b1e]/50 block">
                            Presupuesto
                          </span>
                          <span className="text-xs font-extrabold text-[#8C2C45]">
                            ${project.budget?.toLocaleString() || 'A convenir'}{' '}
                            {project.currency || 'USD'}
                          </span>
                        </div>

                        {project.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#F3EFE6] text-[#5A0F24]">
                            {project.category}
                          </span>
                        )}
                      </div>

                      {/* Skills Tags */}
                      {Array.isArray(project.skills) && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.skills.slice(0, 3).map((sk, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 bg-[#F3EFE6]/80 text-[#5A0F24] rounded-md font-medium"
                            >
                              {typeof sk === 'string' ? sk : sk.name}
                            </span>
                          ))}
                          {project.skills.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-[#2b1b1e]/40">
                              +{project.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Message Client Directly & View Project */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() =>
                          handleDirectMessage(
                            {
                              id: project.clientId || project.client?.id,
                              fullName: project.clientResolvedName,
                              projectTitle: project.title,
                            },
                            project
                          )
                        }
                        disabled={isDirectLoading || !project.clientId}
                        className="py-2 px-3 rounded-xl bg-[#F3EFE6] hover:bg-[#C9B8A6]/40 text-[#5A0F24] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title={
                          project.clientId
                            ? 'Escribir directamente al cliente sobre este proyecto'
                            : 'Mensaje general'
                        }
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#8C2C45]" />
                        <span>Mensaje directo</span>
                      </button>

                      <Link
                        to={`/projects/${project.id}`}
                        className="py-2 px-3 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <span>Ver y postularme</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
}
