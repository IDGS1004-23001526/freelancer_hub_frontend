import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import KanbanPage from '../pages/KanbanPage.tsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ClientDashboardPage from '../pages/ClientDashboardPage.jsx';
import CreateProjectPage from '../pages/CreateProjectPage.jsx';
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx';
import PaymentMethodsPage from '../pages/PaymentMethodsPage.jsx';
import CandidateComparisonPage from '../pages/CandidateComparisonPage.jsx';
import ContractKanbanPage from '../pages/ContractKanbanPage.jsx';
import { useAuthStore } from '../stores/auth.store.js';

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const isClient = user?.role === 'CLIENT' || user?.role === 'CLIENTE';

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={isClient ? <ClientDashboardPage /> : <DashboardPage />} />
      <Route path="/client-dashboard" element={<ClientDashboardPage />} />
      <Route path="/social" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/projects" element={<ClientDashboardPage />} />
      <Route path="/feed" element={<ClientDashboardPage />} />
      <Route path="/projects/new" element={<CreateProjectPage />} />
      <Route path="/projects/create" element={<CreateProjectPage />} />
      <Route path="/create-project" element={<CreateProjectPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/projects/:id/candidates" element={<CandidateComparisonPage />} />
      <Route path="/projects/:id/proposals" element={<CandidateComparisonPage />} />
      <Route path="/candidates" element={<CandidateComparisonPage />} />
      <Route path="/contracts" element={<ContractKanbanPage />} />
      <Route path="/contracts/:id" element={<ContractKanbanPage />} />
      <Route path="/kanban" element={<ContractKanbanPage />} />
      <Route path="/payment-methods" element={<PaymentMethodsPage />} />
      <Route path="/payments" element={<PaymentMethodsPage />} />
      <Route path="/cards" element={<PaymentMethodsPage />} />

      {/* Ruta interna / privada de gestión de tareas de equipo (Mini-Jira) */}
      <Route path="/ops/board" element={<KanbanPage />} />
      <Route path="/internal/kanban" element={<Navigate to="/ops/board" replace />} />

      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
