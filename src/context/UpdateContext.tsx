'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkForUpdates } from '@/services/UpdateService';

interface UpdateContextType {
  isUpdateAvailable: boolean;
  checkForUpdates: () => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
};

interface UpdateProviderProps {
  children: ReactNode;
}

export const UpdateProvider: React.FC<UpdateProviderProps> = ({ children }) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const handleCheckForUpdates = async () => {
    // This is a simplified check. In a real app, you'd get the result
    // from the checkForUpdates service.
    await checkForUpdates();
    // For now, we'll just log a message.
    console.log('Checked for updates.');
  };

  useEffect(() => {
    // Automatically check for updates on app start
    handleCheckForUpdates();
  }, []);

  const value = {
    isUpdateAvailable,
    checkForUpdates: handleCheckForUpdates,
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};
