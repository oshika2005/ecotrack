import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecotrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getProfile()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('ecotrack_token');
          localStorage.removeItem('ecotrack_user');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('ecotrack_token', access_token);
    localStorage.setItem('ecotrack_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, username, password, fullName) => {
    const res = await authAPI.register({ email, username, password, full_name: fullName });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('ecotrack_token', access_token);
    localStorage.setItem('ecotrack_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await authAPI.getProfile();
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
