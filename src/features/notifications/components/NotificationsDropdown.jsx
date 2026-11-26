import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { useNotificationStore } from '../../../stores/notification.store';

function formatTimeAgo(isoString) {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHour < 24) return `Hace ${diffHour} h`;
    if (diffDay === 1) return 'Ayer';
    if (diffDay < 7) return `Hace ${diffDay} d`;
    return new Date(isoString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return 'Reciente';
  }
}

function getNotificationVisuals(type) {
  switch (type) {
    case 'message':
      return {
        icon: MessageSquare,
        iconClass: 'text-blue-600 bg-blue-50 border-blue-200',
        badge: 'Mensaje',
      };
    case 'milestone':
      return {
        icon: CheckCircle2,
        iconClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'Hito',
      };
    case 'escrow':
      return {
        icon: Lock,
        iconClass: 'text-amber-700 bg-amber-50 border-amber-200',
        badge: 'Escrow',
      };
    case 'contract':
      return {
        icon: ShieldCheck,
        iconClass: 'text-[#8C2C45] bg-[#8C2C45]/10 border-[#8C2C45]/30',
        badge: 'Contrato',
      };
    case 'proposal':
      return {
        icon: Briefcase,
        iconClass: 'text-purple-700 bg-purple-50 border-purple-200',
        badge: 'Propuesta',
      };
    default:
      return {
        icon: Bell,
        iconClass: 'text-stone-700 bg-stone-100 border-stone-200',
        badge: 'Aviso',
      };
  }
}

export default function NotificationsDropdown({ align = 'right' }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const {
    notifications,
    isOpen,
    filter,
    toggleOpen,
    setIsOpen,
    setFilter,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleItemClick = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón en el Navbar */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Avisos y notificaciones"
        aria-expanded={isOpen}
        data-testid="navbar-notifications-btn"
        className={`relative flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 text-[11px] font-semibold border-b-2 transition group cursor-pointer ${
          isOpen
            ? 'text-[#8C2C45] border-[#8C2C45]'
            : 'text-[#5A0F24]/70 hover:text-[#5A0F24] border-transparent'
        }`}
      >
        <div className="relative">
          <Bell className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
          {unreadCount > 0 && (
            <span
              data-testid="notifications-unread-badge"
              className="absolute -top-1 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#8C2C45] text-[10px] font-extrabold text-white shadow-xs animate-in zoom-in-50"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span>Avisos</span>
      </button>

      {/* Popover / Panel de Notificaciones */}
      {isOpen && (
        <div
          data-testid="notifications-dropdown-panel"
          className={`absolute top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-[#C9B8A6]/40 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#F3EFE6] to-[#FAF8F5] border-b border-[#C9B8A6]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#5A0F24] text-[#F3EFE6] flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold text-[#5A0F24]">
                    Avisos y Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#8C2C45] text-white px-1.5 py-0.2 rounded-full">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#2b1b1e]/60">
                  Actualizaciones en tiempo real de tu cuenta
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title="Marcar todas como leídas"
                className="text-[11px] font-bold text-[#8C2C45] hover:text-[#5A0F24] hover:underline flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-white/60 transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marcar leídas</span>
              </button>
            )}
          </div>

          {/* Filtros: Todas / No leídas */}
          <div className="flex items-center border-b border-[#C9B8A6]/20 px-3 bg-white text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                filter === 'all'
                  ? 'border-[#8C2C45] text-[#8C2C45] font-bold'
                  : 'border-transparent text-[#2b1b1e]/60 hover:text-[#5A0F24]'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                filter === 'unread'
                  ? 'border-[#8C2C45] text-[#8C2C45] font-bold'
                  : 'border-transparent text-[#2b1b1e]/60 hover:text-[#5A0F24]'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-[#C9B8A6]/15">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F3EFE6] text-[#5A0F24]/40 flex items-center justify-center mb-2.5">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#5A0F24]">
                  {filter === 'unread'
                    ? 'No tienes notificaciones sin leer'
                    : 'Sin avisos por el momento'}
                </h4>
                <p className="text-[11px] text-[#2b1b1e]/60 mt-1 max-w-[200px]">
                  {filter === 'unread'
                    ? 'Todas tus notificaciones han sido leídas.'
                    : 'Te avisaremos cuando haya novedades en tus proyectos y contratos.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((item) => {
                const visuals = getNotificationVisuals(item.type);
                const Icon = visuals.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleItemClick(item);
                      }
                    }}
                    className={`relative p-3 flex items-start gap-3 transition-colors cursor-pointer group ${
                      !item.read
                        ? 'bg-[#FDF8F5] hover:bg-[#F8EFEA]'
                        : 'bg-white hover:bg-[#F3EFE6]/50'
                    }`}
                  >
                    {/* Indicador no leído */}
                    {!item.read && (
                      <span className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-[#8C2C45]" />
                    )}

                    {/* Icono temático */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${visuals.iconClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C2C45]">
                          {visuals.badge}
                        </span>
                        <span className="text-[10px] text-[#2b1b1e]/50 shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <h4
                        className={`text-xs leading-snug line-clamp-1 ${
                          !item.read
                            ? 'font-bold text-[#5A0F24]'
                            : 'font-semibold text-[#2b1b1e]/90'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#2b1b1e]/70 leading-relaxed line-clamp-2 mt-0.5">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-[#8C2C45] group-hover:underline">
                          <span>Ver detalle</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Botón eliminar aviso */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(item.id);
                      }}
                      title="Eliminar aviso"
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#2b1b1e]/40 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-[#FAF8F5] border-t border-[#C9B8A6]/20 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-[#2b1b1e]/60 hover:text-red-700 flex items-center gap-1 font-semibold transition px-2 py-1 rounded-md hover:bg-white cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar historial</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-[#5A0F24] hover:text-[#8C2C45] px-2 py-1 rounded-md hover:bg-white transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
