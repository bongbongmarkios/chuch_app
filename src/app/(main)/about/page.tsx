'use client';

import AppHeader from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, UserCircle, Target, BookOpenCheck, ListChecks, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Client components cannot export metadata directly.
// The title in AppHeader will be set. For browser tab, consider parent layout or useEffect.

export default function AboutPage() {
  const router = useRouter();

  const headerTitleContent = (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-headline font-semibold text-primary sm:text-3xl">
        About App
      </h1>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        nav.fixed.bottom-0 {
          display: none !important;
        }
      `}</style>
      <AppHeader title={headerTitleContent} />
      <div className="px-4 pb-8">
        <Card className="mt-6 shadow-lg max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center font-headline text-2xl">
              <Info className="mr-3 h-7 w-7 text-primary" />
              About This Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-accent" />
                Developer
              </h3>
              <p className="text-muted-foreground">
                This application, SBC App, was developed by John Mark Solomon.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Target className="mr-2 h-5 w-5 text-accent" />
                Purpose
              </h3>
              <p className="text-muted-foreground">
                SBC App aims to make hymnals more accessible, providing an intuitive platform for:
              </p>
              <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-1">
                <li className="flex items-start">
                  <BookOpenCheck className="mr-2 h-4 w-4 mt-1 flex-shrink-0 text-green-600" />
                  <span>Easy navigation of hymnals and responsive readings.</span>
                </li>
                <li className="flex items-start">
                  <ListChecks className="mr-2 h-4 w-4 mt-1 flex-shrink-0 text-green-600" />
                  <span>Facilitating a smooth and organized flow for Sunday programs.</span>
                </li>
              </ul>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">
              Version: 1.0.0 (Placeholder)
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
