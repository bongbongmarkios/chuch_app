'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function UpdateButton() {
  const { 
    updateInfo, 
    updateProgress, 
    isChecking, 
    checkForUpdates, 
    downloadUpdate 
  } = useAppUpdate();

  const hasUpdate = updateInfo?.hasUpdate;
  const isUpdating = updateProgress.status !== 'idle';

  const getUpdateIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isUpdating) return <Download className="h-4 w-4" />;
    if (hasUpdate) return <RefreshCw className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getUpdateText = () => {
    if (isChecking) return 'Checking...';
    if (isUpdating) return 'Updating...';
    if (hasUpdate) return 'Update Available';
    return 'Up to Date';
  };

  const getProgressColor = () => {
    switch (updateProgress.status) {
      case 'error':
        return 'bg-destructive';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          disabled={isChecking || isUpdating}
        >
          {getUpdateIcon()}
          <span className="ml-2 hidden sm:inline">{getUpdateText()}</span>
          {hasUpdate && !isUpdating && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              !
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>App Updates</DialogTitle>
          <DialogDescription>
            Check for and install app updates
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Version */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Current Version</p>
              <p className="text-sm text-muted-foreground">
                {updateInfo?.currentVersion || '1.0.0'}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>

          {/* Update Status */}
          {updateInfo && (
            <div className="space-y-3">
              {hasUpdate ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Update Available
                      </span>
                    </div>
                    <Badge variant="secondary">
                      v{updateInfo.latestVersion}
                    </Badge>
                  </div>
                  
                  {updateInfo.changelog && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      {updateInfo.changelog}
                    </p>
                  )}
                  
                  {updateInfo.size && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Size: {updateInfo.size}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">
                      App is up to date
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isUpdating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{updateProgress.message}</span>
                <span>{updateProgress.progress}%</span>
              </div>
              <Progress 
                value={updateProgress.progress} 
                className="h-2"
              />
            </div>
          )}

          {/* Error State */}
          {updateProgress.status === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {updateProgress.message}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={checkForUpdates}
              disabled={isChecking || isUpdating}
              variant="outline"
              className="flex-1"
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check for Updates
            </Button>
            
            {hasUpdate && !isUpdating && (
              <Button
                onClick={downloadUpdate}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Update Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 