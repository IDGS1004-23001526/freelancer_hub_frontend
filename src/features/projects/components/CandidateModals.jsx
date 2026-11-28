import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chatApi } from '../../../api/chat.api.js';
import { apiClient } from '../../../api/client.js';
import { useAuthStore } from '../../../stores/auth.store.js';
import {
  X,
  ExternalLink,
  Briefcase,
  Send,
  MessageSquare,
  Star,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export function PortfolioModal({ candidate, onClose, onStartChat }) {
  if (!candidate) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="portfolio-modal"
      className="fixed inset-0 z-50 bg-[#2b1b1e]/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#C9B8A6]/60 shadow-[0_25px_60px_-15px_rgba(90,15,36,0.3)] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#5A0F24] to-[#8C2C45] text-[#F3EFE6] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EFE6] text-[#5A0F24] font-extrabold text-base flex items-center justify-center shrink-0">
              {candidate.avatarInitials}
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                Portafolio de {candidate.freelancerName || [candidate.freelancer?.firstName, candidate.freelancer?.lastName].filter(Boolean).join(' ') || 'Freelancer'}
              </h3>
              <p className="text-xs text-[#F3EFE6]/85">{candidate.freelancerRole || candidate.freelancer?.professionalTitle || 'Profesional Independiente'}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-[#F3EFE6]/75">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {(Number(candidate.reputation) || 5.0).toFixed(1)} ({candidate.reviewsCount || 0} reseñas)
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {candidate.freelancerLocation || 'Remoto'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar portafolio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]/70 mb-2">
              Mensaje de presentación
            </h4>
            <p className="text-xs md:text-sm text-[#5A0F24]/85 leading-relaxed bg-[#F3EFE6]/60 p-4 rounded-2xl border border-[#C9B8A6]/40">
              “{candidate.coverLetter}”
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5A0F24]/70 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#8C2C45]" />
              <span>Proyectos destacados ({candidate.portfolio?.length || 0})</span>
            </h4>

            <div className="grid grid-cols-1 gap-3.5">
              {(candidate.portfolio || []).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#f6f2ee]/80 border border-[#C9B8A6]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#5A0F24]">
                        {item.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F3EFE6] border border-[#C68A8F]/40 text-[10px] font-bold text-[#8C2C45]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A0F24]/75 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#C9B8A6]/50 text-[10px] font-semibold text-[#5A0F24]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#5A0F24] text-[#5A0F24] hover:text-white border border-[#C9B8A6] text-xs font-bold transition-colors shrink-0 self-start sm:self-center"
                  >
                    <span>Ver proyecto</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F3EFE6]/70 border-t border-[#C9B8A6]/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A0F24] hover:bg-[#C9B8A6]/25 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartChat(candidate);
            }}
            className="px-4 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              Escribir a {(candidate.freelancerName || candidate.freelancer?.firstName || 'Freelancer').split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuickChatModal({ candidate, projectTitle, onClose }) {
  const { user } = useAuthStore();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const peerId = candidate?.freelancerId || candidate?.freelancer?.id;
    if (!peerId) return;
    let active = true;
    (async () => {
      try {
        const conv = await chatApi.createOrFindConversation({
          peerId,
          projectId: candidate.projectId || null,
          projectName: projectTitle || undefined,
        });
        if (!active || !conv?.id) return;
        setConversationId(conv.id);
        const history = await chatApi.getMessages(conv.id);
        if (!active) return;
        setMessages(
          history.map((m) => ({
            id: m.id,
            sender: m.senderId === user?.id ? 'client' : 'freelancer',
            text: m.content,
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Ahora',
          }))
        );
      } catch {
        // Keep empty if chat fails to load
      }
    })();
    return () => {
      active = false;
    };
  }, [candidate?.freelancerId, candidate?.freelancer?.id, candidate?.projectId, projectTitle, user?.id]);

  if (!candidate) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const tempId = `msg_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender: 'client', text, time: 'Ahora' },
    ]);
    setDraft('');

    try {
      let convId = conversationId;
      if (!convId) {
        const peerId = candidate?.freelancerId || candidate?.freelancer?.id;
        if (peerId) {
          const conv = await chatApi.createOrFindConversation({
            peerId,
            projectId: candidate.projectId || null,
            projectName: projectTitle || undefined,
          });
          convId = conv?.id;
          if (convId) setConversationId(convId);
        }
      }
      if (convId) {
        await apiClient.post(`/v1/chats/${convId}/messages`, { content: text });
      }
    } catch {
      // Ignore transient error; message shown optimistically
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="chat-modal"
      className="fixed inset-0 z-50 bg-[#2b1b1e]/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#C9B8A6]/60 shadow-[0_25px_60px_-15px_rgba(90,15,36,0.3)] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 bg-[#5A0F24] text-[#F3EFE6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C2C45] text-white font-extrabold text-sm flex items-center justify-center">
              {candidate.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold">
                  Conversación con {candidate.freelancerName}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-[#F3EFE6]/75">
                {candidate.freelancerRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-5 space-y-3 bg-[#f6f2ee] max-h-80 overflow-y-auto">
          {messages.map((m) => {
            const isClient = m.sender === 'client';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  isClient ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isClient
                      ? 'bg-[#8C2C45] text-white rounded-br-xs'
                      : 'bg-white text-[#5A0F24] border border-[#C9B8A6]/50 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[#5A0F24]/50 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white border-t border-[#C9B8A6]/40 flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Escribe un mensaje para ${(candidate.freelancerName || candidate.freelancer?.firstName || 'Freelancer').split(' ')[0]}...`}
            data-testid="input-chat-message"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F3EFE6]/60 border border-[#C9B8A6]/60 text-xs text-[#5A0F24] placeholder-[#5A0F24]/45 focus:outline-none focus:border-[#8C2C45]"
          />
          <button
            type="submit"
            data-testid="btn-send-chat"
            className="px-4 py-2.5 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function ContractCreatedBanner({ contract, formatMoney }) {
  if (!contract) return null;

  return (
    <div
      role="status"
      data-testid="contract-created-banner"
      className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-fade-in"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-extrabold text-emerald-950">
              Propuesta aceptada y contrato generado ({contract.id})
            </h4>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
              Listo para depósito en garantía
            </span>
          </div>
          <p className="text-xs text-emerald-900/85 mt-1">
            Seleccionaste a <strong>{contract.freelancerName}</strong> por un total de{' '}
            <strong>{formatMoney(contract.totalAmount, contract.currency)}</strong>. Las entregas quedaron vinculadas a tu contrato.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          to={`/contracts/${contract.id}/fund`}
          data-testid="btn-go-to-funding"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shrink-0 text-center transition-colors shadow-xs"
        >
          Depositar en Garantía Escrow →
        </Link>
        <Link
          to="/contracts"
          className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-950 text-xs font-bold shrink-0 text-center transition-colors"
        >
          Ver en Tablero
        </Link>
      </div>
    </div>
  );
}
