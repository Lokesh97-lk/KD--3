import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../api/client';
import { INITIAL_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [role, setRole] = useState<UserRole>('student');

  useEffect(() => {
    const initAuth = async () => {
      const u = await apiClient.getCurrentUser();
      setUser(u);
      setRole(u.role);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await apiClient.login(email, pass);
    setUser(res.user);
    setRole(res.user.role);
    return res.user;
  };

  const register = async (name: string, email: string, pass: string, assignedRole: UserRole = 'student'): Promise<User> => {
    const res = await apiClient.register(name, email, pass, assignedRole);
    setUser(res.user);
    setRole(res.user.role);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('codeintellect_token');
    localStorage.removeItem('codeintellect_user');
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      setRole(newRole);
      localStorage.setItem('codeintellect_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
};
