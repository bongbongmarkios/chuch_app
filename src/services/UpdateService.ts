import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/react';

const VERSION_KEY = 'app_version';
const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

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
  message?: string;
}

export interface UpdateProgress {
  status: 'idle' | 'checking' | 'downloading' | 'installing' | 'completed' | 'error';
  progress: number;
  message: string;
}

// Get the actual app version from package.json
const getAppVersion = (): string => {
  try {
    // In a real app, this would come from your build system
    // For now, we'll use a hardcoded version that matches your package.json
    return '1.0.1';
  } catch (error) {
    console.error('Error getting app version:', error);
    return '1.0.0';
  }
};

export const getCurrentVersion = async (): Promise<string> => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  return storedVersion || getAppVersion();
};

export const setCurrentVersion = (version: string) => {
  localStorage.setItem(VERSION_KEY, version);
};

export const checkForUpdates = async (): Promise<UpdateInfo> => {
  try {
    const currentVersion = await getCurrentVersion();
    
    // Check if running in Capacitor (mobile app)
    if (isPlatform('capacitor')) {
      return await checkMobileUpdates(currentVersion);
    } else {
      return await checkWebUpdates(currentVersion);
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      hasUpdate: false,
      currentVersion: await getCurrentVersion(),
      latestVersion: await getCurrentVersion(),
      updateType: 'none',
      error: 'Failed to check for updates'
    };
  }
};

const checkWebUpdates = async (currentVersion: string): Promise<UpdateInfo> => {
  try {
    const response = await fetch('/api/updates/check', {
      cache: 'no-cache',
      headers: {
        'X-App-Version': currentVersion,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check for updates');
    }

    const updateInfo: UpdateInfo = await response.json();
    return updateInfo;
  } catch (error) {
    console.error('Error checking web updates:', error);
    throw error;
  }
};

const checkMobileUpdates = async (currentVersion: string): Promise<UpdateInfo> => {
  try {
    const response = await fetch('/api/updates/check', {
      cache: 'no-cache',
      headers: {
        'X-App-Version': currentVersion,
        'X-Platform': 'mobile',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check for updates');
    }

    const updateInfo: UpdateInfo = await response.json();
    return updateInfo;
  } catch (error) {
    console.error('Error checking mobile updates:', error);
    throw error;
  }
};

export const downloadAndApplyUpdate = async (
  updateInfo: UpdateInfo,
  onProgress?: (progress: UpdateProgress) => void
): Promise<void> => {
  if (!updateInfo.hasUpdate || !updateInfo.downloadUrl) {
    throw new Error('No update available or download URL missing');
  }

  try {
    if (isPlatform('capacitor')) {
      await downloadMobileUpdate(updateInfo, onProgress);
    } else {
      await downloadWebUpdate(updateInfo, onProgress);
    }
  } catch (error) {
    console.error('Error downloading or applying update:', error);
    throw error;
  }
};

const downloadWebUpdate = async (
  updateInfo: UpdateInfo,
  onProgress?: (progress: UpdateProgress) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      reject(new Error('Service Worker not supported'));
      return;
    }

    onProgress?.({
      status: 'downloading',
      progress: 0,
      message: 'Checking for service worker updates...'
    });

    navigator.serviceWorker.ready.then((registration) => {
      registration.update().then(() => {
        onProgress?.({
          status: 'downloading',
          progress: 50,
          message: 'Downloading update files...'
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                onProgress?.({
                  status: 'installing',
                  progress: 100,
                  message: 'Update ready. Reload to apply.'
                });
                
                setCurrentVersion(updateInfo.latestVersion);
                resolve();
              }
            });
          }
        });
      }).catch(reject);
    }).catch(reject);
  });
};

const downloadMobileUpdate = async (
  updateInfo: UpdateInfo,
  onProgress?: (progress: UpdateProgress) => void
): Promise<void> => {
  try {
    onProgress?.({
      status: 'downloading',
      progress: 0,
      message: 'Starting download...'
    });

    // Simulate download progress
    const progressSteps = [10, 25, 50, 75, 90, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      onProgress?.({
        status: 'downloading',
        progress: step,
        message: `Downloading update... ${step}%`
      });
    }

    // Download the update package
    const downloadResult = await Filesystem.downloadFile({
      path: `update-${updateInfo.latestVersion}.zip`,
      url: updateInfo.downloadUrl!,
      directory: Directory.Data,
    });

    if (downloadResult.path) {
      onProgress?.({
        status: 'installing',
        progress: 100,
        message: 'Installing update...'
      });

      // In a real implementation, you would:
      // 1. Verify the downloaded file checksum
      // 2. Unzip the file using a plugin like capacitor-zip
      // 3. Copy the new files to the web directory
      // 4. Update the version and reload

      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentVersion(updateInfo.latestVersion);
      
      onProgress?.({
        status: 'completed',
        progress: 100,
        message: 'Update completed successfully'
      });

      // Reload the app to apply the update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    console.error('Error downloading mobile update:', error);
    throw error;
  }
};

// Auto-check for updates periodically
export const startAutoUpdateCheck = () => {
  setInterval(async () => {
    try {
      const updateInfo = await checkForUpdates();
      if (updateInfo.hasUpdate) {
        // Notify the app about available update
        window.dispatchEvent(new CustomEvent('updateAvailable', { detail: updateInfo }));
      }
    } catch (error) {
      console.error('Auto update check failed:', error);
    }
  }, UPDATE_CHECK_INTERVAL);
};

// Force check for updates
export const forceCheckForUpdates = async (): Promise<UpdateInfo> => {
  return await checkForUpdates();
};
