import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Rutas futuras: /register, /dashboard, /projects, /escrow */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
