/**
- ProjectChatDrawer – HU-11 Drawer Lateral de Chat Contextual por Proyecto.
 *
- Layout (matches Figma mockup):
- ┌──────────────────────────────────────────────────────────────┐
- │  Navbar (DashboardLayout)                                    │
- ├──────────────────────────────────────────────────────────────┤
- │ Conversations │       Message area        │  Context panel  │
- │   sidebar     │  ─────────────────────── │  (contract /    │
- │               │  chronological messages  │   rules)        │
- │               │  with day separators     │                 │
- │               │                         │                 │
- │               │  [ChatInput]            │                 │
- └───────────────┴─────────────────────────┴─────────────────┘
 *
- The drawer slides in from the right edge of the page and does NOT block
- navigation in the rest of the app (it's overlaid with pointer-events only
- on its own surface).
 *
- Socket.io connection:
-   - Authenticates via JWT Bearer (from useAuthStore)
-   - Joins/leaves rooms per conversation
-   - Receives 'new_message', 'typing', 'stop_typing', 'message_read'
 *
- REST endpoints consumed:
-   GET  /api/v1/chats              → conversation list
-   GET  /api/v1/chats/:id/messages → message history
-   POST /api/v1/chats/:id/messages → send message
-   PATCH /api/v1/chats/:id/read   → mark read
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  X,
  MessageSquare,
  MessageCircle,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  PenLine,
} from 'lucide-react';
import { useChatStore } from '../../../stores/chat.store.js';
import { useAuthStore } from '../../../stores/auth.store.js';
import { useChatSocket } from '../hooks/useChatSocket.js';
import ChatMessageBubble from './ChatMessageBubble.jsx';
import ChatDaySeparator from './ChatDaySeparator.jsx';
import ChatConversationItem from './ChatConversationItem.jsx';
import ChatInput from './ChatInput.jsx';
import ChatAccessDenied from './ChatAccessDenied.jsx';
import ContractContextPanel from './ContractContextPanel.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProjectChatDrawer({
  initialConversationId = null,
  contractContext = null,
}) {
  const { user, accessToken } = useAuthStore();
  const {
    conversations,
    messages,
    dayGroups,
    drawer,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    error,
    unreadNotificationCount,
    loadConversations,
    openDrawer,
    closeDrawer,
    loadMessages,
    sendMessage,
    handleIncomingMessage,
    handleIncomingNotification,
    markConversationRead,
    clearError,
  } = useChatStore();

  const messagesEndRef = useRef(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const currentUserId = user?.id ?? user?.sub ?? '';

  // ── Socket callbacks ───────────────────────────────────────────────────────

  const handleSocketMessage = useCallback(
    (payload) => {
      handleIncomingMessage(payload, currentUserId);
    },
    [handleIncomingMessage, currentUserId]
  );

  const handleTypingChange = useCallback((isTyping) => {
    setIsPeerTyping(isTyping);
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsPeerTyping(false), 4000);
    }
  }, []);

  const handleMessagesRead = useCallback(
    (convId) => {
      if (convId === drawer.conversationId) {
        markConversationRead(convId, currentUserId);
      }
    },
    [drawer.conversationId, markConversationRead, currentUserId]
  );

  const { isConnected, connectionError, sendTyping, sendStopTyping, emitMarkAsRead } =
    useChatSocket({
      token: accessToken,
      conversationId: drawer.isOpen ? drawer.conversationId : null,
      onNewMessage: handleSocketMessage,
      onTypingChange: handleTypingChange,
      onMessagesRead: handleMessagesRead,
      onNotification: handleIncomingNotification,
    });

  // ── Load conversations on mount ────────────────────────────────────────────

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Open initial conversation if provided ──────────────────────────────────

  useEffect(() => {
    if (initialConversationId && !drawer.isOpen) {
      const found = conversations.find((c) => c.id === initialConversationId);
      if (found) {
        openDrawer({
          conversationId: found.id,
          projectId: found.projectId,
          projectName: found.projectName,
          peerName: found.peerName,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId, conversations]);

  // ── Load messages when active conversation changes ─────────────────────────

  useEffect(() => {
    if (drawer.isOpen && drawer.conversationId && currentUserId) {
      clearError();
      loadMessages(drawer.conversationId, currentUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer.conversationId, drawer.isOpen]);

  // ── Auto-scroll to latest message ─────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // ── Mark as read when user opens a conversation ────────────────────────────

  useEffect(() => {
    if (drawer.isOpen && drawer.conversationId && messages.length > 0) {
      markConversationRead(drawer.conversationId, currentUserId);
      emitMarkAsRead(drawer.conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer.isOpen, drawer.conversationId, messages.length]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelectConversation = (conv) => {
    openDrawer({
      conversationId: conv.id,
      projectId: conv.projectId,
      projectName: conv.projectName,
      peerName: conv.peerName,
    });
  };

  const handleOpenEmptyDrawer = () => {
    openDrawer({
      conversationId: null,
      projectId: null,
      projectName: null,
      peerName: null,
    });
    loadConversations();
  };

  const handleSend = (content) => {
    if (!drawer.conversationId || !currentUserId) return;
    sendMessage(drawer.conversationId, content, currentUserId);
  };

  const handleTypingStart = () => {
    if (drawer.conversationId) sendTyping(drawer.conversationId);
  };

  const handleTypingStop = () => {
    if (drawer.conversationId) sendStopTyping(drawer.conversationId);
  };

  // is403 error?
  const isAccessDenied =
    error?.toLowerCase().includes('403') ||
    error?.toLowerCase().includes('no tienes acceso') ||
    error?.toLowerCase().includes('no tienes permiso');

  const activeConversation = conversations.find((c) => c.id === drawer.conversationId);

  // ── Render: Trigger button (always visible in layout) ─────────────────────

  return (
    <>
      {/* ── Floating trigger button ── */}
      {!drawer.isOpen && (
        <button
          type="button"
          onClick={() => {
            if (conversations.length > 0) {
              handleSelectConversation(conversations[0]);
            } else {
              handleOpenEmptyDrawer();
            }
          }}
          aria-label="Abrir chat de mensajes"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-[0_8px_24px_-4px_rgba(140,44,69,0.5)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-[#5A0F24] text-white text-[9px] font-bold flex items-center justify-center px-1 ring-2 ring-white">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>
      )}

      {/* ── Main Drawer ── */}
      {drawer.isOpen && (
        <>
          {/* Overlay – semi-transparent, clicking outside closes drawer */}
          <div
            className="fixed inset-0 z-40 bg-[#2b1b1e]/10 backdrop-blur-[1px]"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chat de proyecto"
            className="fixed inset-y-0 right-0 z-50 flex shadow-[0_0_60px_-10px_rgba(90,15,36,0.25)] animate-in slide-in-from-right duration-300"
            style={{ width: 'min(96vw, 900px)' }}
          >
            {/* ── LEFT: Conversations sidebar ── */}
            <aside className="w-52 shrink-0 bg-[#F3EFE6] border-r border-[#C9B8A6]/50 flex flex-col overflow-hidden">
              {/* Sidebar header */}
              <div className="px-3 py-4 border-b border-[#C9B8A6]/40">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-[#8C2C45]" />
                  <h2 className="text-xs font-extrabold text-[#5A0F24] uppercase tracking-wider">
                    Conversaciones
                  </h2>
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#8C2C45] animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-[#5A0F24]/50 italic">
                    No tienes conversaciones aún.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <ChatConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === drawer.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                    />
                  ))
                )}
              </div>

              {/* Open external chat link (matches mockup "Abrir chat de proyecto ajeno") */}
              <div className="p-3 border-t border-[#C9B8A6]/40">
                <button
                  type="button"
                  className="w-full text-[10px] font-semibold text-[#8C2C45] hover:text-[#5A0F24] border border-[#C68A8F]/50 hover:border-[#8C2C45] rounded-xl py-2 px-3 transition-all cursor-pointer text-center"
                  onClick={() => loadConversations()}
                >
                  Abrir chat de proyecto ajeno
                </button>
              </div>
            </aside>

            {/* ── CENTER: Message area ── */}
            <main className="flex-1 flex flex-col bg-[#f6f2ee] overflow-hidden min-w-0">
              {/* Chat header */}
              <header className="bg-white/95 border-b border-[#C9B8A6]/40 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  {activeConversation && (
                    <>
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8C2C45] to-[#5A0F24] text-[#F3EFE6] font-extrabold text-xs flex items-center justify-center">
                          {getInitials(activeConversation.peerName)}
                        </div>
                        {activeConversation.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#5A0F24] truncate">
                          {activeConversation.peerName}
                        </p>
                        <p className="text-[9px] text-[#5A0F24]/60 font-medium">
                          {activeConversation.isOnline ? '· en línea' : '· sin conexión'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Contract ID badge */}
                  {drawer.conversationId && (
                    <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider bg-[#8C2C45]/10 text-[#8C2C45] border border-[#8C2C45]/30 px-2 py-0.5 rounded-full">
                      {drawer.conversationId.startsWith('CT-')
                        ? drawer.conversationId
                        : `CT-${drawer.conversationId.slice(0, 8).toUpperCase()}`}
                    </span>
                  )}

                  {/* Connection indicator */}
                  {isConnected ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" title="WebSocket conectado" />
                  ) : (
                    <WifiOff
                      className="w-3.5 h-3.5 text-[#C68A8F]"
                      title="WebSocket desconectado"
                    />
                  )}

                  {/* Close */}
                  <button
                    type="button"
                    onClick={closeDrawer}
                    aria-label="Cerrar chat"
                    className="w-7 h-7 rounded-lg bg-[#F3EFE6] hover:bg-[#C68A8F]/30 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-[#5A0F24]" />
                  </button>
                </div>
              </header>

              {/* Connection error banner */}
              {connectionError && (
                <div className="mx-4 mt-3 py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2 shrink-0">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  {connectionError}
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-[#5A0F24]/50">
                    <Loader2 className="w-6 h-6 animate-spin text-[#8C2C45]" />
                    <p className="text-xs">Cargando mensajes...</p>
                  </div>
                ) : isAccessDenied ? (
                  <ChatAccessDenied onBack={closeDrawer} />
                ) : error && !isAccessDenied ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <p className="text-xs text-[#8C2C45] font-medium text-center max-w-xs">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        drawer.conversationId &&
                        loadMessages(drawer.conversationId, currentUserId)
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-[#8C2C45] hover:text-[#5A0F24] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reintentar
                    </button>
                  </div>
                ) : !drawer.conversationId ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-[#5A0F24]/40">
                    <MessageCircle className="w-10 h-10" />
                    <p className="text-xs font-medium">Sin mensajes</p>
                  </div>
                ) : dayGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-[#5A0F24]/40">
                    <PenLine className="w-8 h-8" />
                    <p className="text-xs font-medium">Sé el primero en escribir</p>
                  </div>
                ) : (
                  <>
                    {dayGroups.map((group) => (
                      <div key={group.dateLabel}>
                        <ChatDaySeparator label={group.dateLabel} />
                        {group.messages.map((msg, idx) => {
                          const prevMsg = group.messages[idx - 1];
                          const showSenderName =
                            !msg.isMine &&
                            (idx === 0 || prevMsg?.senderId !== msg.senderId);
                          return (
                            <ChatMessageBubble
                              key={msg.id}
                              message={msg}
                              showSenderName={showSenderName}
                            />
                          );
                        })}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isPeerTyping && (
                      <div className="flex justify-start mb-2">
                        <div className="bg-white border border-[#C9B8A6]/60 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#8C2C45] animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#8C2C45] animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#8C2C45] animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                          <span className="text-[10px] text-[#5A0F24]/60 ml-1 font-medium">
                            Escribiendo...
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input bar – hidden on 403 */}
              {!isAccessDenied && drawer.conversationId && (
                <ChatInput
                  conversationId={drawer.conversationId}
                  disabled={sendingMessage || loadingMessages}
                  onSend={handleSend}
                  onTypingStart={handleTypingStart}
                  onTypingStop={handleTypingStop}
                />
              )}
            </main>

            {/* ── RIGHT: Contract context panel ── */}
            <aside className="w-52 shrink-0 bg-white border-l border-[#C9B8A6]/50 overflow-y-auto hidden lg:block">
              <ContractContextPanel contractContext={contractContext} />
            </aside>
          </div>
        </>
      )}
    </>
  );
}