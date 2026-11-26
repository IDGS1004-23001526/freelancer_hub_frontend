import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import KanbanPage from '../pages/KanbanPage.tsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import NetworkPage from '../pages/NetworkPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ClientDashboardPage from '../pages/ClientDashboardPage.jsx';
import CreateProjectPage from '../pages/CreateProjectPage.jsx';
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx';
import PaymentMethodsPage from '../pages/PaymentMethodsPage.jsx';
import CandidateComparisonPage from '../pages/CandidateComparisonPage.jsx';
import ContractKanbanPage from '../pages/ContractKanbanPage.jsx';
import ContractScopePage from '../pages/ContractScopePage.jsx';
import ContractFundingPage from '../pages/ContractFundingPage.jsx';
import MessagesPage from '../pages/MessagesPage.jsx';
import FreelancerProjectsPage from '../pages/FreelancerProjectsPage.jsx';
import { useAuthStore } from '../stores/auth.store.js';

function RequireAuth({ isAuthenticated }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();
  const isClient = user?.role === 'CLIENT' || user?.role === 'CLIENTE';
  const isFreelancer =
    user?.role === 'FREELANCER' || (Boolean(user) && !isClient && user?.role !== 'ADMIN');

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={isClient ? <ClientDashboardPage /> : <DashboardPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route
          path="/client-dashboard"
          element={!isFreelancer ? <ClientDashboardPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/social" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/projects"
          element={isFreelancer ? <FreelancerProjectsPage defaultTab="projects" /> : <ClientDashboardPage />}
        />
        <Route path="/feed" element={<Navigate to="/projects" replace />} />
        <Route
          path="/my-proposals"
          element={isClient ? <Navigate to="/candidates" replace /> : <FreelancerProjectsPage defaultTab="proposals" />}
        />
        <Route path="/postulations" element={<Navigate to="/my-proposals" replace />} />
        <Route
          path="/projects/new"
          element={!isFreelancer ? <CreateProjectPage /> : <Navigate to="/projects" replace />}
        />
        <Route path="/projects/create" element={<Navigate to="/projects/new" replace />} />
        <Route path="/create-project" element={<Navigate to="/projects/new" replace />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route
          path="/projects/:id/candidates"
          element={!isFreelancer ? <CandidateComparisonPage /> : <Navigate to="/projects" replace />}
        />
        <Route
          path="/projects/:id/proposals"
          element={!isFreelancer ? <CandidateComparisonPage /> : <Navigate to="/projects" replace />}
        />
        <Route
          path="/candidates"
          element={!isFreelancer ? <CandidateComparisonPage /> : <Navigate to="/my-proposals" replace />}
        />
        <Route path="/contracts" element={<ContractKanbanPage />} />
        <Route path="/contracts/scope" element={<ContractScopePage />} />
        <Route path="/contracts/:id/scope" element={<ContractScopePage />} />
        <Route path="/contracts/:id" element={<ContractKanbanPage />} />
        <Route
          path="/contracts/:id/fund"
          element={!isFreelancer ? <ContractFundingPage /> : <Navigate to="/contracts" replace />}
        />
        <Route path="/contracts/fund/:id" element={<ContractFundingPage />} />
        <Route path="/contracts/fund" element={<Navigate to="/contracts" replace />} />
        <Route path="/kanban" element={<Navigate to="/contracts" replace />} />
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/payments" element={<Navigate to="/payment-methods" replace />} />
        <Route path="/cards" element={<Navigate to="/payment-methods" replace />} />

        {/* HU-11: Mensajería contextual por proyecto */}
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} />

        {/* Ruta interna / privada de gestión de tareas de equipo (Mini-Jira) */}
        <Route path="/ops/board" element={<KanbanPage />} />
        <Route path="/internal/kanban" element={<Navigate to="/ops/board" replace />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
