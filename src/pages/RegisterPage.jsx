import React from 'react';
import AuthLayout from '../layouts/AuthLayout.jsx';
import RegisterShowcase from '../features/auth/components/RegisterShowcase.jsx';
import RegisterForm from '../features/auth/components/RegisterForm.jsx';

/**
 * RegisterPage view matching the architectural layout and responsive grid
 */
export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Register Visual Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <RegisterShowcase />
        </div>

        {/* Right Column: Register Form */}
        <div className="lg:col-span-7">
          <RegisterForm />
        </div>
      </div>
    </AuthLayout>
  );
}
