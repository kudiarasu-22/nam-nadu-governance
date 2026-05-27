import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider, SocketProvider } from '@/context';
import { ErrorBoundary } from '@/components/feedback';
import ToastContainer from '@/components/feedback/Toast';
import AppRouter from '@/routes/AppRouter';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <BrowserRouter>
                <AppRouter />
                <ToastContainer />
              </BrowserRouter>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
