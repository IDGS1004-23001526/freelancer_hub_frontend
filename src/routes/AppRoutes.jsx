import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import ClientDashboardPage from '../pages/ClientDashboardPage.jsx';
import CreateProjectPage from '../pages/CreateProjectPage.jsx';
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<ClientDashboardPage />} />
      <Route path="/projects" element={<ClientDashboardPage />} />
      <Route path="/feed" element={<ClientDashboardPage />} />
      <Route path="/projects/new" element={<CreateProjectPage />} />
      <Route path="/projects/create" element={<CreateProjectPage />} />
      <Route path="/create-project" element={<CreateProjectPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
