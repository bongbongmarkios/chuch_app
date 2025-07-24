'use client';

import { UpdateManager } from '@/components/UpdateManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and updates</p>
      </div>

      <div className="grid gap-6">
        {/* App Updates Section */}
        <UpdateManager showAutoCheck={true} />

        <Separator />

        {/* Other Settings Sections */}
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
            <CardDescription>Details about your current app installation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">App Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Build Date</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Platform</span>
              <span className="text-sm text-muted-foreground">
                {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Web' : 'Mobile'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your app data and storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">Calculating...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Size</span>
              <span className="text-sm text-muted-foreground">Calculating...</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Information about this application</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is an offline-capable app that allows you to access content even when you're not connected to the internet. 
              The app automatically checks for updates and notifies you when new versions are available.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
