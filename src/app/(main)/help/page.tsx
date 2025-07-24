
import AppHeader from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Help | SBC Church App',
};

export default function HelpPage() {
  return (
    <>
      <AppHeader title="Help & Support" />
      <div className="container mx-auto px-4 pb-8">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-6 w-6 text-primary" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Help documentation and support information will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
