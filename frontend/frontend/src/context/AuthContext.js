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


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setupAxiosInterceptor(token);


      const fetchUser = async () => {
        try {
          const response = await api.get('/api/user/me/');
          setUser(response.data);
        } catch (error) {
          console.error("Erreur de vérification du token", error);
          localStorage.removeItem('access_token');
        } finally {
          setLoading(false);
          setIsAuthenticated(true);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login/', { email, password });

    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);


    const userResponse = await api.get('/api/user/me/');
    setUser(userResponse.data);

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}