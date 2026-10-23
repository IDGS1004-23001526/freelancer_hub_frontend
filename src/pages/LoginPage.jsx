import React from 'react';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AuthShowcase from '../features/auth/components/AuthShowcase.jsx';
import LoginForm from '../features/auth/components/LoginForm.jsx';

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Columna Izquierda: Showcase visual */}
        <div className="lg:col-span-6 flex justify-center">
          <AuthShowcase />
        </div>

        {/* Columna Derecha: Formulario de Login */}
        <div className="lg:col-span-6">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
