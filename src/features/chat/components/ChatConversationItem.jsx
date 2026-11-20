/**
- ChatConversationItem – a single row in the left-panel conversations list.
- Clicking it opens the chat for that conversation.
 */
import React from 'react';
import { MessageCircle } from 'lucide-react';

function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ChatConversationItem({ conversation, isActive, onClick }) {
  const initials = getInitials(conversation.peerName);
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-xl transition-all group cursor-pointer ${
        isActive
          ? 'bg-[#8C2C45]/10 border border-[#8C2C45]/30'
          : 'hover:bg-[#F3EFE6]/80 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {conversation.peerAvatarUrl ? (
            <img
              src={conversation.peerAvatarUrl}
              alt={conversation.peerName}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#C9B8A6]/40"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                isActive
                  ? 'bg-[#8C2C45] text-[#F3EFE6]'
                  : 'bg-[#C68A8F]/30 text-[#5A0F24]'
              }`}
            >
              {initials}
            </div>
          )}
          {/* Online dot */}
          {conversation.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={`text-xs font-bold truncate ${
                isActive ? 'text-[#5A0F24]' : 'text-[#2b1b1e]'
              }`}
            >
              {conversation.peerName}
            </span>
            <span className="text-[10px] text-[#5A0F24]/50 shrink-0 font-medium">
              {formatRelativeTime(conversation.lastMessageTime)}
            </span>
          </div>

          {/* Project tag */}
          {conversation.projectName && conversation.projectName !== 'Conversación directa' && (
            <p className="text-[9px] text-[#8C2C45] font-semibold mb-0.5 truncate">
              {conversation.projectName}
            </p>
          )}

          {/* Last message preview */}
          <div className="flex items-center justify-between gap-1">
            <p
              className={`text-[11px] truncate ${
                hasUnread ? 'font-semibold text-[#2b1b1e]' : 'text-[#5A0F24]/65'
              }`}
            >
              {conversation.lastMessageIsMine && (
                <span className="text-[#8C2C45]/70 mr-1">Tú:</span>
              )}
              {conversation.lastMessage || (
                <span className="italic text-[#5A0F24]/40 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Sin mensajes aún
                </span>
              )}
            </p>
            {hasUnread && (
              <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-[#8C2C45] text-white text-[9px] font-bold flex items-center justify-center px-1">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}