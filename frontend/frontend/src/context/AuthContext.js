import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const setupAxiosInterceptor = (token) => {
    api.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  };

// Fonction pour récupérer les infos de l'utilisateur
  const fetchUser = async () => {
    try {
      const response = await api.get('/api/user/me/');
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("Erreur de vérification du token", error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setupAxiosInterceptor(token);

      const initializeAuth = async () => {
        try {
          await fetchUser();
        } catch (error) {
          console.error("Erreur d'initialisation de l'authentification", error);
        } finally {
          setLoading(false);
        }
      };

      initializeAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login/', { email, password });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      setupAxiosInterceptor(response.data.access);

      // Récupérer les infos utilisateur après login
      const userData = await fetchUser();

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Fonction pour vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return user && (user.is_staff || user.is_superuser);
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    try {
      await fetchUser();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données utilisateur", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin: isAdmin(),
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}