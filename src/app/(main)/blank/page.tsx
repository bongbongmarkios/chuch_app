
'use client';

import AppHeader from '@/components/layout/AppHeader';
import { useEffect, useState } from 'react';
import type { Hymn } from '@/types';
import { initialSampleHymns } from '@/data/hymns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import StaticHymnListDisplay from '@/components/hymnal/StaticHymnListDisplay';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';

export default function BlankPageTurnedHymnOverview() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hymnsVersion, setHymnsVersion] = useState(0); // For triggering re-fetch

  const handleUrlUpdated = () => {
    setHymnsVersion(v => v + 1); // Increment version to trigger useEffect
  };

  useEffect(() => {
    setIsLoading(true);
    let loadedHymns: Hymn[] = [];
    try {
      const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
      if (storedHymnsString) {
        const parsedHymns: Hymn[] = JSON.parse(storedHymnsString);
        loadedHymns = parsedHymns.filter(h => h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
      } else {
        const validInitialHymns = initialSampleHymns.filter(h => h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
        localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(validInitialHymns));
        loadedHymns = validInitialHymns;
      }
    } catch (error) {
      console.error("Error loading or parsing hymns from localStorage:", error);
      loadedHymns = initialSampleHymns.filter(h => h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
    }
    
    const sortedHymns = [...loadedHymns].sort((a, b) => {
        const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
        const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
        if (isNaN(pageNumA) && isNaN(pageNumB)) return 0;
        if (isNaN(pageNumA)) return 1;
        if (isNaN(pageNumB)) return -1;
        return pageNumA - pageNumB;
    });

    setHymns(sortedHymns);
    setIsLoading(false);
  }, [hymnsVersion]); // Re-run when hymnsVersion changes

  return (
    <>
      <AppHeader title="Hymn Overview" />
      <div className="container mx-auto px-4 pb-8">
        <div className="my-6 text-center">
          {/* This button now leads to a placeholder page. Inline editing is preferred. */}
          <Button asChild size="lg">
            <Link href="/hymn-url-editor">Manage Hymn URLs (Placeholder)</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading hymns...</p>
          </div>
        ) : hymns.length > 0 ? (
          <StaticHymnListDisplay hymns={hymns} onUrlUpdated={handleUrlUpdated} />
        ) : (
          <p className="text-center text-muted-foreground mt-10">No hymns available to display.</p>
        )}
      </div>
    </>
  );
}
