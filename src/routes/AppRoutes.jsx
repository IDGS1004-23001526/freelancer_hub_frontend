import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import KanbanPage from '../pages/KanbanPage.tsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      {/* Ruta interna / privada de gestión de tareas de equipo (Mini-Jira) */}
      <Route path="/ops/board" element={<KanbanPage />} />
      <Route path="/internal/kanban" element={<Navigate to="/ops/board" replace />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Rutas futuras: /dashboard, /projects, /escrow */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
