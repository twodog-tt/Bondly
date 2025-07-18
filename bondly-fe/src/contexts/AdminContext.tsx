import React, { createContext, useContext, ReactNode } from 'react';
import { useAdminPermissions } from '../hooks/useAdminPermissions';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  checkPermissions: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const adminPermissions = useAdminPermissions();

  return (
    <AdminContext.Provider value={adminPermissions}>
      {children}
    </AdminContext.Provider>
  );
}; 