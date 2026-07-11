"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  tenantId: string | null;
  companyName: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (companyName: string, name: string, email: string, passwordHash: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('orvexa_user');
    const savedToken = localStorage.getItem('orvexa_token');
    const savedTenant = localStorage.getItem('orvexa_tenant_id');
    const savedCompany = localStorage.getItem('orvexa_company_name');

    if (savedUser && savedToken && savedTenant) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
      setTenantId(savedTenant);
      setCompanyName(savedCompany);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Login failed.');
      }

      const { accessToken: token, user: userData } = result.data;
      setUser(userData);
      setAccessToken(token);
      setTenantId(userData.tenantId);

      localStorage.setItem('orvexa_user', JSON.stringify(userData));
      localStorage.setItem('orvexa_token', token);
      localStorage.setItem('orvexa_tenant_id', userData.tenantId);
      
      // Attempt to load tenant meta if needed, fallback to default
      setCompanyName('My Workspace');
      localStorage.setItem('orvexa_company_name', 'My Workspace');

    } catch (err: any) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (companyName: string, name: string, email: string, passwordHash: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          adminName: name,
          adminEmail: email,
          adminPasswordHash: passwordHash,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Registration failed.');
      }

      // Automatically log in after successful signup
      await login(email, passwordHash);

    } catch (err: any) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setTenantId(null);
    setCompanyName(null);
    localStorage.removeItem('orvexa_user');
    localStorage.removeItem('orvexa_token');
    localStorage.removeItem('orvexa_tenant_id');
    localStorage.removeItem('orvexa_company_name');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, tenantId, companyName, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
