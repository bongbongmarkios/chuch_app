'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, X, RefreshCw } from 'lucide-react';
import { 
  checkForUpdates, 
  downloadAndApplyUpdate,
  type UpdateInfo,
  type UpdateProgress 
} from '@/services/UpdateService';

interface UpdateNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function UpdateNotification({ 
  position = 'top-right', 
  autoHide = true, 
  autoHideDelay = 10000 
}: UpdateNotificationProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const { toast } = useToast();

  // Listen for update events
  useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent<UpdateInfo>) => {
      // Only show notification if there's actually an update
      if (event.detail.hasUpdate) {
        setUpdateInfo(event.detail);
        setIsVisible(true);
      }
    };

    window.addEventListener('updateAvailable', handleUpdateAvailable as EventListener);
    
    return () => {
      window.removeEventListener('updateAvailable', handleUpdateAvailable as EventListener);
    };
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (isVisible && autoHide && !isUpdating) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, autoHideDelay, isUpdating]);

  const handleUpdate = async () => {
    if (!updateInfo?.hasUpdate) return;

    setIsUpdating(true);
    try {
      await downloadAndApplyUpdate(updateInfo, (updateProgress) => {
        setProgress(updateProgress);
        
        if (updateProgress.status === 'completed') {
          toast({
            title: 'Update Complete',
            description: 'The app has been updated successfully.',
          });
          setIsVisible(false);
        } else if (updateProgress.status === 'error') {
          toast({
            title: 'Update Failed',
            description: 'Failed to download update. Please try again.',
            variant: 'destructive',
          });
        }
      });
    } catch (error) {
      console.error('Error updating:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to download update. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleCheckNow = async () => {
    try {
      const info = await checkForUpdates();
      if (info.hasUpdate) {
        setUpdateInfo(info);
        setIsVisible(true);
      } else {
        toast({
          title: 'Up to Date',
          description: info.message || 'Your app is running the latest version.',
        });
      }
    } catch (error) {
      toast({
        title: 'Update Check Failed',
        description: 'Unable to check for updates.',
        variant: 'destructive',
      });
    }
  };

  if (!isVisible || !updateInfo?.hasUpdate) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full`}>
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Update Available</span>
                <Badge variant="default" className="text-xs">
                  v{updateInfo.latestVersion}
                </Badge>
              </div>
              
              {updateInfo.changelog && (
                <p className="text-sm text-muted-foreground mb-3">
                  {updateInfo.changelog}
                </p>
              )}

              {/* Progress Bar */}
              {(progress.status === 'downloading' || progress.status === 'installing') && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span>{progress.message}</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  size="sm"
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      Update Now
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 