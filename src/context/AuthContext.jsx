import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/seguridad/me');
          setUser(res.data);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/seguridad/login', {
      usuarioMail: email,
      usuarioContrasenia: password,
    });
    const { token, usuario } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUser(usuario);
    return usuario;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUser(null);
  };

  const hasAccess = (codigo) => {
    if (!user) return false;
    if (!user.accesos || user.accesos.length === 0) return true;
    return user.accesos.some((acc) => acc.accesoCodigo === codigo);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);