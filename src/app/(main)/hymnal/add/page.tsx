
import AppHeader from '@/components/layout/AppHeader';
import AddHymnForm from '@/components/hymnal/AddHymnForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddHymnPage() {
  const headerTitleContent = (
    <div className="flex items-center gap-3 w-full"> {/* Ensure w-full for proper alignment */}
      <Button asChild variant="outline" size="sm">
        <Link href="/hymnal">
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
        </Link>
      </Button>
      <h1 className="text-2xl font-headline font-semibold text-primary sm:text-3xl ml-4">
        Add Hymn
      </h1>
    </div>
  );

  return (
    <>
      <AppHeader 
        title={headerTitleContent}
        // No actions prop needed here as "Cancel" and title are part of the title block
      />
      <div className="container mx-auto px-4 pb-8">
        <AddHymnForm />
      </div>
    </>
  );
}
