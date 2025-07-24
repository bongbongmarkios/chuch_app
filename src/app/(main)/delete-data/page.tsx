'use client';

import AppHeader from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eraser, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useActivity } from '@/hooks/useActivityTracker';

export default function ResetApplicationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { clearActivity } = useActivity();

  const handleResetApp = () => {
    // Clear the hook-based state first
    clearActivity();

    // Define all known localStorage keys used by the app
    const keysToRemove = [
      'graceNotesHymns',
      'graceNotesPrograms',
      'graceNotesTrash',
      'graceNotesReadings',
      'userActivity',
      'app-theme',
      'app-primary-color'
    ];

    // Remove all keys from localStorage
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove key ${key} from localStorage`, error);
      }
    });

    toast({
      title: "Application Reset",
      description: "All local data has been cleared. The app will now reload with its default state.",
      duration: 3000,
    });

    // Use a short delay before reloading to allow the user to see the toast
    setTimeout(() => {
        window.location.reload();
    }, 1500);
  };
  
  const headerTitleContent = (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-headline font-semibold text-primary sm:text-3xl">
        Reset Application
      </h1>
    </div>
  );

  return (
    <>
      <AppHeader title={headerTitleContent} hideDefaultActions={true} />
      <div className="container mx-auto px-4 pb-8">
        <Card className="mt-6 border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Reset All Application Data
            </CardTitle>
            <CardDescription className="text-destructive/90">
              This action will permanently delete all locally stored data, including custom hymns, programs, trash, settings, and activity history. This action is useful for clearing corrupt data or starting fresh. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              After resetting, the application will reload and all data will be restored to its original, default state. Any hymns you have added or edited will be lost.
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Eraser className="mr-2 h-4 w-4" />
                  Reset Application Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your hymns, programs, trash, and settings stored in this browser. The application will reload with its original default data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetApp} className={"bg-destructive hover:bg-destructive/90"}>
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
