'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  updateType: 'web' | 'mobile' | 'none';
  downloadUrl?: string;
  changelog?: string;
  size?: string;
  mandatory?: boolean;
  error?: string;
}

export interface UpdateProgress {
  status: 'idle' | 'checking' | 'downloading' | 'installing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    setUpdateProgress({
      status: 'checking',
      progress: 0,
      message: 'Checking for updates...',
    });

    try {
      const response = await fetch('/api/updates/check', {
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }

      const data: UpdateInfo = await response.json();
      setUpdateInfo(data);

      if (data.hasUpdate) {
        toast({
          title: 'Update Available',
          description: `Version ${data.latestVersion} is available. ${data.changelog || ''}`,
          action: (
            <button
              onClick={() => downloadUpdate()}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
            >
              Update Now
            </button>
          ),
        });
      }

      setUpdateProgress({
        status: 'idle',
        progress: 0,
        message: data.hasUpdate ? 'Update available' : 'App is up to date',
      });

    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateProgress({
        status: 'error',
        progress: 0,
        message: 'Failed to check for updates',
      });
      toast({
        title: 'Update Check Failed',
        description: 'Unable to check for updates. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  // Download and install update
  const downloadUpdate = useCallback(async () => {
    if (!updateInfo?.hasUpdate) return;

    setUpdateProgress({
      status: 'downloading',
      progress: 0,
      message: 'Downloading update...',
    });

    try {
      // For web apps, trigger service worker update
      if (updateInfo.updateType === 'web') {
        await updateWebApp();
      } else {
        // For mobile apps, download the update package
        await downloadMobileUpdate();
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateProgress({
        status: 'error',
        progress: 0,
        message: 'Failed to download update',
      });
      toast({
        title: 'Update Failed',
        description: 'Failed to download update. Please try again.',
        variant: 'destructive',
      });
    }
  }, [updateInfo, toast]);

  // Update web app (service worker)
  const updateWebApp = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update().then(() => {
            // Listen for service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateProgress({
                      status: 'installing',
                      progress: 100,
                      message: 'Update ready. Reload to apply.',
                    });
                    
                    toast({
                      title: 'Update Ready',
                      description: 'Click to reload and apply the update.',
                      action: (
                        <button
                          onClick={() => window.location.reload()}
                          className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
                        >
                          Reload
                        </button>
                      ),
                    });
                    
                    resolve();
                  }
                });
              }
            });
          }).catch(reject);
        }).catch(reject);
      } else {
        reject(new Error('Service Worker not supported'));
      }
    });
  }, [toast]);

  // Download mobile app update
  const downloadMobileUpdate = useCallback(async () => {
    if (!updateInfo?.downloadUrl) {
      throw new Error('No download URL available');
    }

    try {
      // Request update package
      const response = await fetch('/api/updates/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: updateInfo.latestVersion,
          platform: 'android', // or 'ios'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request update package');
      }

      const data = await response.json();
      
      if (data.success) {
        setUpdateProgress({
          status: 'installing',
          progress: 100,
          message: 'Update downloaded. Installing...',
        });

        // In a real implementation, you would:
        // 1. Download the actual package file
        // 2. Verify checksum
        // 3. Install the update using Capacitor plugins
        
        toast({
          title: 'Update Downloaded',
          description: 'The update has been downloaded and will be installed.',
        });

        // Simulate installation
        setTimeout(() => {
          setUpdateProgress({
            status: 'completed',
            progress: 100,
            message: 'Update completed successfully',
          });
          
          toast({
            title: 'Update Complete',
            description: 'The app has been updated successfully.',
          });
        }, 2000);
      }
    } catch (error) {
      throw error;
    }
  }, [updateInfo, toast]);

  // Listen for service worker messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateInfo(event.data.data);
          toast({
            title: 'Update Available',
            description: 'A new version of the app is available.',
            action: (
              <button
                onClick={() => downloadUpdate()}
                className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
              >
                Update
              </button>
            ),
          });
        }
      });
    }
  }, [downloadUpdate, toast]);

  // Auto-check for updates on app start
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    updateInfo,
    updateProgress,
    isChecking,
    checkForUpdates,
    downloadUpdate,
  };
} 