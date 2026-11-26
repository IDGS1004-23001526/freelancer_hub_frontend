import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import { useNotificationListener } from './features/notifications/hooks/useNotificationListener';
import { useNotificationStore } from './stores/notification.store';
import Toast from './features/ui/Toast.jsx';

function GlobalNotificationProvider({ children }) {
  useNotificationListener();
  const { latestToastNotification, dismissToast } = useNotificationStore();

  return (
    <>
      {children}
      {latestToastNotification && (
        <Toast
          title={latestToastNotification.title}
          message={latestToastNotification.message}
          type={
            latestToastNotification.type === 'milestone' ||
            latestToastNotification.type === 'escrow'
              ? 'success'
              : 'info'
          }
          duration={5000}
          onClose={dismissToast}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalNotificationProvider>
        <AppRoutes />
      </GlobalNotificationProvider>
    </BrowserRouter>
  );
}
