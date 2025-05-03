// zenit-frontend/src/contexts/AuthContext.tsx
import { 
    createContext, useContext, useState, useEffect, ReactNode 
  } from 'react';
  import { authApi } from '../services/api';
  
  interface AuthContextData {
    token: string | null;
    user: {
      userId: number;
      name?: string;
      role: string;
      companyIds: number[];
    } | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthContextData>({} as AuthContextData);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthContextData['user']>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    // Tenta carregar o token e o usuário do localStorage no início
    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
  
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
  
      setIsLoading(false);
    }, []);
  
    // Função para login
    async function login(email: string, password: string) {
      try {
        const response = await authApi.post('/auth/login', { email, password });
        const newToken = response.data.token;
  
        // Decodificar o token JWT para obter informações do usuário
        const payload = parseJwt(newToken);
        const userData = {
          userId: payload.userId,
          role: payload.role,
          companyIds: payload.companyIds || [],
        };
  
        // Salvar no estado e no localStorage
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
  
        // Também salvar em cookie para SSR
        document.cookie = `token=${newToken}; path=/`;
      } catch (error) {
        console.error('Erro no login:', error);
        throw error;
      }
    }
  
    // Função para logout
    function logout() {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; Max-Age=0; path=/';
      window.location.href = '/login';
    }
  
    // Helper para decodificar token JWT
    function parseJwt(token: string) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(
          decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        );
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        return {};
      }
    }
  
    return (
      <AuthContext.Provider
        value={{
          token,
          user,
          isLoading,
          isAuthenticated: !!token,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    return useContext(AuthContext);
  }