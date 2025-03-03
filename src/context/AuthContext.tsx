import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure axios
  //axios.defaults.baseURL = 'http://localhost:5000/api';
  axios.defaults.baseURL='http://54.144.143.24:5000/api'
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Access-Control-Allow-Credentials'] = 'true';

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await axios.post('/auth/login', { email, password });
      setUser(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null);
      const res = await axios.post('/auth/register', { username, email, password });
      setUser(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;