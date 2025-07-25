'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkForUpdates, downloadAndApplyUpdate, UpdateInfo, UpdateProgress } from '@/services/UpdateService';

interface UpdateContextType {
  updateInfo: UpdateInfo | null;
  updateProgress: UpdateProgress | null;
  checkForUpdates: () => Promise<void>;
  downloadAndApplyUpdate: (onProgress?: (progress: UpdateProgress) => void) => Promise<void>;
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
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress | null>(null);

  const handleCheckForUpdates = async () => {
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleDownloadAndApplyUpdate = async (onProgress?: (progress: UpdateProgress) => void) => {
    if (!updateInfo || !updateInfo.hasUpdate) {
      console.warn('No update available to download');
      return;
    }
    try {
      await downloadAndApplyUpdate(updateInfo, (progress) => {
        setUpdateProgress(progress);
        if (onProgress) {
          onProgress(progress);
        }
      });
    } catch (error) {
      console.error('Failed to download and apply update:', error);
      setUpdateProgress({
        status: 'error',
        progress: 0,
        message: (error as Error).message || 'Unknown error',
      });
    }
  };

  useEffect(() => {
    // Automatically check for updates on app start
    handleCheckForUpdates();

    // Listen for updateAvailable event
    const onUpdateAvailable = (event: CustomEvent) => {
      setUpdateInfo(event.detail);
    };
    window.addEventListener('updateAvailable', onUpdateAvailable as EventListener);

    return () => {
      window.removeEventListener('updateAvailable', onUpdateAvailable as EventListener);
    };
  }, []);

  const value = {
    updateInfo,
    updateProgress,
    checkForUpdates: handleCheckForUpdates,
    downloadAndApplyUpdate: handleDownloadAndApplyUpdate,
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};
