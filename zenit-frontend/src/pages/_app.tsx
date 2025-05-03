// zenit-frontend/src/pages/_app.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

// Rotas públicas que não requerem autenticação
const publicRoutes = ['/login'];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}

// Componente para verificar autenticação
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Verificar se a rota requer autenticação
    const pathIsPublic = publicRoutes.includes(router.pathname);
    
    if (!isLoading) {
      if (!isAuthenticated && !pathIsPublic) {
        // Redirecionar para login se não autenticado em rota protegida
        router.push({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        });
      } else {
        // Se autenticado e tentando acessar login, redireciona para dashboard
        if (isAuthenticated && pathIsPublic) {
          router.push('/');
        } else {
          setAuthorized(true);
        }
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar spinner durante a verificação
  if (isLoading || !authorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default MyApp;