'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { 
  checkForUpdates, 
  downloadAndApplyUpdate, 
  startAutoUpdateCheck,
  forceCheckForUpdates,
  type UpdateInfo,
  type UpdateProgress 
} from '@/services/UpdateService';

interface UpdateManagerProps {
  className?: string;
  showAutoCheck?: boolean;
}

export function UpdateManager({ className, showAutoCheck = true }: UpdateManagerProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for update events
  useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent<UpdateInfo>) => {
      setUpdateInfo(event.detail);
      toast({
        title: 'Update Available',
        description: `Version ${event.detail.latestVersion} is available. ${event.detail.changelog || ''}`,
        action: (
          <Button
            onClick={() => handleDownloadUpdate()}
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            Update Now
          </Button>
        ),
      });
    };

    window.addEventListener('updateAvailable', handleUpdateAvailable as EventListener);
    
    return () => {
      window.removeEventListener('updateAvailable', handleUpdateAvailable as EventListener);
    };
  }, [toast]);

  // Start auto update checking
  useEffect(() => {
    if (showAutoCheck && isOnline) {
      startAutoUpdateCheck();
    }
  }, [showAutoCheck, isOnline]);

  // Initial check on mount
  useEffect(() => {
    if (isOnline) {
      handleCheckForUpdates();
    }
  }, [isOnline]);

  const handleCheckForUpdates = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Cannot check for updates while offline.',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setUpdateProgress({
      status: 'checking',
      progress: 0,
      message: 'Checking for updates...',
    });

    try {
      const info = await forceCheckForUpdates();
      setUpdateInfo(info);
      setLastChecked(new Date());

      if (info.hasUpdate) {
        toast({
          title: 'Update Available',
          description: `Version ${info.latestVersion} is available. ${info.changelog || ''}`,
          action: (
            <Button
              onClick={() => handleDownloadUpdate()}
              size="sm"
              className="bg-primary text-primary-foreground"
            >
              Update Now
            </Button>
          ),
        });
      } else {
        toast({
          title: 'Up to Date',
          description: info.message || 'Your app is running the latest version.',
        });
      }

      setUpdateProgress({
        status: 'idle',
        progress: 0,
        message: info.hasUpdate ? 'Update available' : (info.message || 'App is up to date'),
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
  }, [isOnline, toast]);

  const handleDownloadUpdate = useCallback(async () => {
    if (!updateInfo?.hasUpdate) return;

    try {
      await downloadAndApplyUpdate(updateInfo, (progress) => {
        setUpdateProgress(progress);
        
        if (progress.status === 'completed') {
          toast({
            title: 'Update Complete',
            description: 'The app has been updated successfully.',
          });
        } else if (progress.status === 'error') {
          toast({
            title: 'Update Failed',
            description: 'Failed to download update. Please try again.',
            variant: 'destructive',
          });
        }
      });
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

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (updateProgress.status === 'downloading' || updateProgress.status === 'installing') {
      return <Download className="h-4 w-4 text-blue-500" />;
    }
    if (updateProgress.status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (updateProgress.status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (updateInfo?.hasUpdate) return <Download className="h-4 w-4 text-blue-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isChecking) return 'Checking for updates...';
    if (updateProgress.status === 'downloading') return 'Downloading update...';
    if (updateProgress.status === 'installing') return 'Installing update...';
    if (updateProgress.status === 'completed') return 'Update completed';
    if (updateProgress.status === 'error') return 'Update failed';
    if (updateInfo?.hasUpdate) return 'Update available';
    return 'Up to date';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          App Updates
        </CardTitle>
        <CardDescription>
          Keep your app up to date with the latest features and improvements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network Status</span>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Current Version */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Version</span>
          <Badge variant="outline">
            {updateInfo?.currentVersion || '1.0.1'}
          </Badge>
        </div>

        {/* Update Status */}
        {updateInfo?.hasUpdate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Latest Version</span>
            <Badge variant="default">
              {updateInfo.latestVersion}
            </Badge>
          </div>
        )}

        {/* Progress Bar */}
        {(updateProgress.status === 'downloading' || updateProgress.status === 'installing') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{updateProgress.message}</span>
              <span>{updateProgress.progress}%</span>
            </div>
            <Progress value={updateProgress.progress} className="w-full" />
          </div>
        )}

        {/* Update Info */}
        {updateInfo?.hasUpdate && updateInfo.changelog && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>What's new:</strong> {updateInfo.changelog}
            </AlertDescription>
          </Alert>
        )}

        {/* No Update Message */}
        {updateInfo && !updateInfo.hasUpdate && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {updateInfo.message || 'You are running the latest version of the app.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {updateProgress.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{updateProgress.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCheckForUpdates}
            disabled={isChecking || !isOnline}
            variant="outline"
            className="flex-1"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Updates
              </>
            )}
          </Button>

          {updateInfo?.hasUpdate && (
            <Button
              onClick={handleDownloadUpdate}
              disabled={!isOnline || updateProgress.status === 'downloading' || updateProgress.status === 'installing'}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          )}
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last checked: {lastChecked.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 