import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, MessageSquare, ArrowLeft, Briefcase, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { resolveAvatarUrl } from '../utils/avatar.js';

export default function NetworkPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/v1/contracts').catch(() => ({ data: { data: [] } })),
      apiClient.get('/v1/skills').catch(() => ({ data: { data: [] } })),
    ])
      .then(([contractsRes, skillsRes]) => {
        const rawContracts = contractsRes?.data?.data || [];
        const uniqueUsers = new Map();

        if (Array.isArray(rawContracts)) {
          rawContracts.forEach((c) => {
            const partner = c.freelancer || c.client;
            if (partner?.id && !uniqueUsers.has(partner.id)) {
              uniqueUsers.set(partner.id, {
                id: partner.id,
                fullName: partner.fullName || 'Colaborador',
                role: partner.role || 'FREELANCER',
                avatarUrl: resolveAvatarUrl(partner.avatarUrl),
                projectTitle: c.project?.title || 'Proyecto en FreelancerHub',
              });
            }
          });
        }

        setContacts(Array.from(uniqueUsers.values()));
        const rawSkills = skillsRes?.data?.data || [];
        if (Array.isArray(rawSkills)) {
          setSkills(rawSkills.slice(0, 12));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.projectTitle.toLowerCase().includes(q);
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#2b1b1e]">
      <header className="sticky top-0 z-30 bg-white border-b border-[#C9B8A6]/40 px-4 sm:px-8 h-14 flex items-center justify-between">
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
        </div>
        <Link
          to="/projects"
          className="text-xs font-bold text-[#8C2C45] hover:underline flex items-center gap-1"
        >
          <Briefcase className="w-4 h-4" />
          <span>Explorar proyectos</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#5A0F24]">
                Colaboradores y Conexiones
              </h2>
              <p className="text-xs text-[#2b1b1e]/60">
                Personas con las que has colaborado en contratos de FreelancerHub
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#C9B8A6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o proyecto..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F3EFE6]/60 border border-[#C9B8A6]/40 rounded-xl focus:outline-none focus:border-[#8C2C45]"
              />
            </div>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((s) => {
                const name = typeof s === 'string' ? s : s.name;
                const active = selectedSkill === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSkill(active ? '' : name)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-[#8C2C45] text-white'
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

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-8 text-center text-xs text-[#2b1b1e]/60">
            Cargando tu red de colaboradores...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-8 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#8C2C45] mx-auto" />
            <h3 className="text-sm font-extrabold text-[#5A0F24]">
              Aún no tienes conexiones registradas
            </h3>
            <p className="text-xs text-[#2b1b1e]/60 max-w-md mx-auto">
              Cuando inicies un contrato con un cliente o freelancer, aparecerá aquí para que puedas volver a contactarlo rápido.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C2C45] hover:bg-[#5A0F24] text-white rounded-xl text-xs font-bold transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>Ir a Proyectos</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-2xl border border-[#C9B8A6]/40 p-4 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={person.avatarUrl}
                    alt={person.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-[#C9B8A6]"
                    onError={(e) => {
                      e.currentTarget.src = '/avatar-sample.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#5A0F24] truncate">
                      {person.fullName}
                    </h4>
                    <p className="text-[11px] text-[#8C2C45] font-semibold">
                      {person.role === 'CLIENT' ? 'Cliente' : 'Freelancer'}
                    </p>
                    <p className="text-[11px] text-[#2b1b1e]/60 truncate">
                      {person.projectTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/messages')}
                  className="w-full py-2 px-3 rounded-xl bg-[#F3EFE6] hover:bg-[#8C2C45] text-[#5A0F24] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar mensaje</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
