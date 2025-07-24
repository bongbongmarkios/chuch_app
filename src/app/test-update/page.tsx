'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdateManager } from '@/components/UpdateManager';
import { forceCheckForUpdates } from '@/services/UpdateService';

export default function TestUpdatePage() {
  const [testResult, setTestResult] = useState<string>('');

  const testUpdateSystem = async () => {
    try {
      setTestResult('Testing update system...');
      
      // Test 1: Check for updates
      const updateInfo = await forceCheckForUpdates();
      setTestResult(`✅ Update check successful!\nHas update: ${updateInfo.hasUpdate}\nCurrent version: ${updateInfo.currentVersion}\nLatest version: ${updateInfo.latestVersion}`);
      
      // Test 2: Check service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setTestResult(prev => prev + '\n✅ Service Worker is registered');
        } else {
          setTestResult(prev => prev + '\n❌ Service Worker not registered');
        }
      } else {
        setTestResult(prev => prev + '\n❌ Service Worker not supported');
      }
      
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Update System Test</h1>
        <p className="text-muted-foreground">Test the update functionality</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Update System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testUpdateSystem}>
              Run Update System Test
            </Button>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <UpdateManager showAutoCheck={false} />
      </div>
    </div>
  );
} 