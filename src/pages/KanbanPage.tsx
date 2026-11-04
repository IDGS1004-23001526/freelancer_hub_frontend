import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  UserCheck,
  AlertCircle,
  KeyRound,
  LogOut,
  User,
  ShieldCheck,
  Lock,
  Key,
  Crown,
} from 'lucide-react';
import { internalTasksApi, InternalTask } from '../api/internal-tasks.api.ts';

const TEAM_NAMES = ['Diego', 'Karla', 'Christian', 'Axel', 'Uriel'];

const COLUMNS: { id: InternalTask['status']; title: string; color: string; badge: string }[] = [
  { id: 'TODO', title: 'Por Hacer', color: 'border-slate-300 bg-slate-50/50', badge: 'bg-slate-200 text-slate-700' },
  { id: 'IN_PROGRESS', title: 'En Progreso', color: 'border-amber-300 bg-amber-50/40', badge: 'bg-amber-200 text-amber-800' },
  { id: 'REVIEW', title: 'En Revisión (PR)', color: 'border-purple-300 bg-purple-50/40', badge: 'bg-purple-200 text-purple-800' },
  { id: 'DONE', title: 'Terminado', color: 'border-emerald-300 bg-emerald-50/40', badge: 'bg-emerald-200 text-emerald-800' },
];

const PRIORITIES: Record<InternalTask['priority'], { label: string; badge: string }> = {
  LOW: { label: 'Baja', badge: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Media', badge: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Alta', badge: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgente', badge: 'bg-rose-100 text-rose-700 font-bold' },
};

export default function KanbanPage() {
  const [tasks, setTasks] = useState<InternalTask[]>([]);
  const [filterMember, setFilterMember] = useState<string>('MY_TASKS');
  const [, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sesión de Identidad en el Tablero
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: 'ADMIN' | 'DEV' } | null>(() => {
    const saved = localStorage.getItem('fh_kanban_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal Login / Setup de Contraseña
  const [selectedName, setSelectedName] = useState<string>('Paulo');
  const [customNameInput, setCustomNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Panel de Claves de Paulo
  const [showPasswordsModal, setShowPasswordsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InternalTask | null>(null);
  const [teamPasswords, setTeamPasswords] = useState<{ name: string; role: string; password?: string }[]>([]);

  // Formulario nueva tarea (Solo Paulo)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<string>('Diego');
  const [priority, setPriority] = useState<InternalTask['priority']>('MEDIUM');

  const isAdmin = currentUser?.name.toLowerCase() === 'paulo' || currentUser?.role === 'ADMIN';

  const fetchTasks = async () => {
    try {
      const res = await internalTasksApi.getTasks();
      if (res.data) {
        setTasks(res.data);
      }
    } catch {
      const local = localStorage.getItem('fh_internal_tasks');
      if (local) {
        setTasks(JSON.parse(local));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLoginOrSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const targetName = selectedName === 'OTHER' ? customNameInput.trim() : selectedName;
    if (!targetName) {
      setAuthError('Escribe tu nombre para identificarte.');
      return;
    }

    try {
      const res = await internalTasksApi.loginMember(targetName, passwordInput);
      if (res.data) {
        setCurrentUser(res.data);
        localStorage.setItem('fh_kanban_session', JSON.stringify(res.data));
        setPasswordInput('');
      }
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (message && message.includes('Contraseña incorrecta')) {
        setAuthError(message);
        return;
      }

      const localCreds = JSON.parse(localStorage.getItem('fh_team_credentials') || '{}');
      if (!localCreds[targetName.toLowerCase()]) {
        localCreds[targetName.toLowerCase()] = passwordInput.trim();
        localStorage.setItem('fh_team_credentials', JSON.stringify(localCreds));
      } else if (localCreds[targetName.toLowerCase()] !== passwordInput.trim()) {
        setAuthError(`Contraseña incorrecta para ${targetName}. Solicítala con Paulo.`);
        return;
      }

      const session = {
        id: `user_${Date.now()}`,
        name: targetName,
        role: targetName.toLowerCase() === 'paulo' ? ('ADMIN' as const) : ('DEV' as const),
      };
      setCurrentUser(session);
      localStorage.setItem('fh_kanban_session', JSON.stringify(session));
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fh_kanban_session');
  };

  const handleOpenPasswordsModal = async () => {
    try {
      const res = await internalTasksApi.getMembersPasswordsForPaulo();
      if (res.data && res.data.length > 0) {
        setTeamPasswords(res.data);
      } else {
        const localCreds = JSON.parse(localStorage.getItem('fh_team_credentials') || '{}');
        const fallback = Object.entries(localCreds).map(([k, v]) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1),
          role: k === 'paulo' ? 'ADMIN' : 'DEV',
          password: String(v),
        }));
        setTeamPasswords(fallback);
      }
    } catch {
      const localCreds = JSON.parse(localStorage.getItem('fh_team_credentials') || '{}');
      const fallback = Object.entries(localCreds).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        role: k === 'paulo' ? 'ADMIN' : 'DEV',
        password: String(v),
      }));
      setTeamPasswords(fallback);
    }
    setShowPasswordsModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !title.trim()) return;

    try {
      const res = await internalTasksApi.createTask({
        title,
        description,
        assignee,
        priority,
        createdBy: 'Paulo',
      });
      if (res.data) {
        const next = [res.data, ...tasks];
        setTasks(next);
        localStorage.setItem('fh_internal_tasks', JSON.stringify(next));
      }
    } catch {
      const fallbackTask: InternalTask = {
        id: `task_${Date.now()}`,
        title,
        description,
        assignee,
        priority,
        status: 'TODO',
        createdBy: 'Paulo',
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = [fallbackTask, ...tasks];
      setTasks(next);
      localStorage.setItem('fh_internal_tasks', JSON.stringify(next));
    }

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const canMoveTask = (task: InternalTask) => {
    if (!currentUser) return false;
    return isAdmin || task.assignee.toLowerCase() === currentUser.name.toLowerCase();
  };

  const handleMove = async (taskId: string, currentStatus: InternalTask['status'], direction: 'next' | 'prev') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !canMoveTask(task)) return;

    const order: InternalTask['status'][] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = order.indexOf(currentStatus);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= order.length) return;
    const newStatus = order[targetIndex];

    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updated);
    localStorage.setItem('fh_internal_tasks', JSON.stringify(updated));

    try {
      await internalTasksApi.updateTask(taskId, { status: newStatus });
    } catch {
      // Optimista
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!isAdmin) return;
    const filtered = tasks.filter((t) => t.id !== taskId);
    setTasks(filtered);
    localStorage.setItem('fh_internal_tasks', JSON.stringify(filtered));

    try {
      await internalTasksApi.deleteTask(taskId);
    } catch {
      // Optimista
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterMember === 'ALL') return true;
    if (filterMember === 'MY_TASKS') {
      return currentUser ? t.assignee.toLowerCase() === currentUser.name.toLowerCase() : true;
    }
    return t.assignee.toLowerCase() === filterMember.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A1420] p-6 lg:p-8 font-sans">
      {/* Modal Login / Auto-registro con Contraseña */}
      {!currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E8DEDA] shadow-2xl p-7 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#5A0F24] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-black text-[#5A0F24]">Identificación de Equipo</h2>
            <p className="text-xs text-[#7A6167] mt-1 mb-5">
              Si es tu primer acceso, la contraseña ingresada será tu clave registrada.
            </p>

            <form onSubmit={handleLoginOrSetup} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-[#5A0F24] uppercase mb-1">
                  Miembro del Equipo
                </label>
                <select
                  value={selectedName}
                  onChange={(e) => {
                    setSelectedName(e.target.value);
                    setAuthError(null);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#C9B8A6] bg-white font-semibold text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                >
                  <option value="Paulo">Paulo (Administrador)</option>
                  <option value="Diego">Diego</option>
                  <option value="Karla">Karla</option>
                  <option value="Christian">Christian</option>
                  <option value="Axel">Axel</option>
                  <option value="Uriel">Uriel</option>
                  <option value="OTHER">Otro (Definir nombre)</option>
                </select>

                {selectedName === 'OTHER' && (
                  <input
                    type="text"
                    required
                    placeholder="Nombre del integrante..."
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 mt-2 rounded-xl border border-[#C9B8A6] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5A0F24] uppercase mb-1">
                  Contraseña de acceso
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Introduce tu contraseña..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(null);
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                    authError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#C9B8A6]'
                  } focus:outline-none focus:ring-2 focus:ring-[#8C2C45]`}
                />
                {authError && (
                  <p className="text-[11px] text-rose-600 mt-1.5 font-semibold leading-tight flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-md transition-colors cursor-pointer"
              >
                Acceder al Tablero
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8DEDA]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-8 h-8 rounded-xl bg-[#5A0F24] text-white flex items-center justify-center font-black text-sm">
              <Kanban className="w-4.5 h-4.5" />
            </span>
            <h1 className="text-xl font-black text-[#5A0F24] tracking-tight">
              FreelancerHub Ops • Tablero de Tareas
            </h1>

            {currentUser && (
              <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isAdmin ? <Crown className="w-3 h-3 text-amber-700" /> : <UserCheck className="w-3 h-3 text-emerald-700" />}
                <span>{currentUser.name} {isAdmin ? '(Admin)' : '(Desarrollador)'}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A6167] mt-1">
            {isAdmin
              ? 'Panel Administrador: Asignación global de tareas y consulta centralizada de claves del equipo.'
              : `Bienvenido ${currentUser?.name}. Tienes permisos para avanzar únicamente tus tareas asignadas.`}
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtro */}
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#C9B8A6] bg-white text-[#5A0F24] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
            >
              <option value="MY_TASKS">Mis Tareas ({tasks.filter(t => t.assignee.toLowerCase() === currentUser.name.toLowerCase()).length})</option>
              <option value="ALL">Todo el equipo ({tasks.length})</option>
              {TEAM_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m} ({tasks.filter((t) => t.assignee.toLowerCase() === m.toLowerCase()).length})
                </option>
              ))}
            </select>

            {/* Ver Contraseñas del Equipo (Exclusivo Paulo Admin) */}
            {isAdmin && (
              <button
                onClick={handleOpenPasswordsModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Gestor de credenciales de equipo"
              >
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span>Credenciales de Equipo</span>
              </button>
            )}

            {/* Asignar Tarea (Exclusivo Paulo Admin) */}
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C2C45] hover:bg-[#5A0F24] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar Tarea</span>
              </button>
            )}

            {/* Cambiar de usuario */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión de tablero"
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </button>
          </div>
        )}
      </div>

      {/* Columnas Kanban */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[500px] transition-colors`}
            >
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-black/5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#5A0F24]">
                  {col.title}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border border-dashed border-[#C9B8A6]/60 rounded-xl text-[11px] text-[#7A6167]/60">
                    Sin tareas
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isMyTask = canMoveTask(task);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`bg-white rounded-xl p-3.5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer hover:border-[#8C2C45] ${
                          isMyTask ? 'border-[#8C2C45]/40 ring-1 ring-[#8C2C45]/20' : 'border-[#E8DEDA]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${
                              isMyTask
                                ? 'bg-[#5A0F24] text-white border-[#5A0F24]'
                                : 'bg-[#F3EFE6] text-[#5A0F24] border-[#C9B8A6]/40'
                            }`}>
                              <User className="w-3 h-3" />
                              {task.assignee} {isMyTask && !isAdmin && '(Tú)'}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                                PRIORITIES[task.priority]?.badge || 'bg-slate-100'
                              }`}
                            >
                              {PRIORITIES[task.priority]?.label || task.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#3A1420] leading-snug mb-1">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-[#7A6167] line-clamp-3 mb-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 mt-2 border-t border-[#F3EFE6] flex items-center justify-between text-[10px] text-[#7A6167]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C9B8A6]" />
                            {new Date(task.createdAt).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>

                          <div className="flex items-center gap-1">
                            {isMyTask ? (
                              <>
                                {col.id !== 'TODO' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMove(task.id, task.status, 'prev'); }}
                                    title="Mover a etapa anterior"
                                    className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {col.id !== 'DONE' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMove(task.id, task.status, 'next'); }}
                                    title="Avanzar etapa"
                                    className="p-1 rounded-md hover:bg-[#8C2C45]/10 text-[#8C2C45] hover:text-[#5A0F24] font-bold transition-colors cursor-pointer"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {isAdmin && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                    title="Eliminar tarea (Solo Admin)"
                                    className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Bloqueado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      
      {/* Modal Detalle Completo de Tarea */}
      {selectedTask && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl border border-[#E8DEDA] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-[#E8DEDA]">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${PRIORITIES[selectedTask.priority]?.badge}`}>
                  {PRIORITIES[selectedTask.priority]?.label || selectedTask.priority}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F3EFE6] text-[#5A0F24]">
                  Estado: {COLUMNS.find(c => c.id === selectedTask.status)?.title}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-black text-[#5A0F24] leading-snug mb-3">
              {selectedTask.title}
            </h3>

            <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8DEDA] mb-4">
              <h4 className="text-[11px] font-bold text-[#8C2C45] uppercase tracking-wider mb-2">
                Descripción & Criterios de Aceptación
              </h4>
              <p className="text-xs text-[#3A1420] whitespace-pre-wrap leading-relaxed">
                {selectedTask.description || 'Sin descripción detallada.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-[#7A6167] bg-white rounded-xl p-3 border border-[#F3EFE6] mb-5">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">Responsable Asignado</span>
                <span className="font-bold text-[#5A0F24] flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5" /> {selectedTask.assignee}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">Asignado por</span>
                <span className="font-medium text-slate-700 mt-0.5 block">{selectedTask.createdBy}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">Fecha de Registro</span>
                <span className="mt-0.5 block">{new Date(selectedTask.createdAt).toLocaleString('es-MX')}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">Última Actualización</span>
                <span className="mt-0.5 block">{new Date(selectedTask.updatedAt).toLocaleString('es-MX')}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-[#5A0F24] hover:bg-[#8C2C45] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Credenciales de Equipo (Exclusivo Paulo Admin) */}
      {showPasswordsModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8DEDA] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8DEDA]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-black text-[#5A0F24]">Registro de Credenciales (Administrador)</h3>
              </div>
              <button onClick={() => setShowPasswordsModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A6167] mb-3">
              Claves registradas por los integrantes para soporte técnico y auditoría:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {teamPasswords.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Ningún miembro ha registrado su clave aún.
                </div>
              ) : (
                teamPasswords.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8DEDA] bg-[#FDFBF7]"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#5A0F24]">{member.name}</span>
                      <span className="text-[9px] ml-2 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                        {member.role}
                      </span>
                    </div>
                    <code className="text-xs font-mono font-bold text-[#8C2C45] bg-[#F3EFE6] px-2 py-1 rounded-md">
                      {member.password || '(No registrada)'}
                    </code>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 mt-3 border-t border-[#E8DEDA]">
              <button
                onClick={() => setShowPasswordsModal(false)}
                className="px-4 py-1.5 text-xs font-bold bg-[#8C2C45] text-white rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Tarea (Exclusivo Paulo Admin) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8DEDA] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8DEDA]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C2C45]" />
                <h3 className="text-sm font-black text-[#5A0F24]">Nueva Tarea de Equipo</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#5A0F24] uppercase mb-1">
                  Título de la tarea / Historia *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Implementar pasarela de pagos en Escrow"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#C9B8A6] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5A0F24] uppercase mb-1">
                  Descripción o Criterios de Aceptación
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles técnicos, endpoints o consideraciones..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#C9B8A6] focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5A0F24] uppercase mb-1">
                    Asignar a *
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#C9B8A6] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                  >
                    {TEAM_NAMES.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5A0F24] uppercase mb-1">
                    Prioridad
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as InternalTask['priority'])}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#C9B8A6] bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#8C2C45]"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DEDA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#8C2C45] hover:bg-[#5A0F24] text-white shadow-sm"
                >
                  Crear y Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
