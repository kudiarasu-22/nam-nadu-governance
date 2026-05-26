/**
 * Nam Nadu — App Root
 * Wraps the entire app with providers and the router
 */
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider, SocketProvider } from '@/context';
import { ErrorBoundary } from '@/components/feedback';
import ToastContainer from '@/components/feedback/Toast';
import { router } from '@/routes/AppRouter';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <RouterProvider router={router} />
              <ToastContainer />
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
