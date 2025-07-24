
'use client';
import type { Hymn } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { initialSampleHymns } from '@/data/hymns'; 
import { BookKey } from 'lucide-react';

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';

interface HymnIndexListProps {
  initialHymns: Hymn[]; 
}

export default function HymnIndexList({ initialHymns }: HymnIndexListProps) {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let loadedHymns: Hymn[] = [];
    try {
      const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
      if (storedHymnsString) {
        const parsedHymns: Hymn[] = JSON.parse(storedHymnsString);
        loadedHymns = parsedHymns.filter(h => h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
      } else {
        const validInitialHymns = initialHymns.filter(h => h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
        localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(validInitialHymns));
        loadedHymns = validInitialHymns;
      }
    } catch (error) {
      console.error("Error loading or parsing hymns from localStorage for index list:", error);
      loadedHymns = initialHymns.filter(h => h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
    }
    
    const pageNumberedHymns = loadedHymns.filter(hymn => hymn.pageNumber && hymn.pageNumber.trim() !== '');

    const sortedHymns = [...pageNumberedHymns].sort((a, b) => {
        const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
        const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
        
        if (isNaN(pageNumA) && isNaN(pageNumB)) return (a.titleEnglish || '').localeCompare(b.titleEnglish || '');
        if (isNaN(pageNumA)) return 1; 
        if (isNaN(pageNumB)) return -1;
        
        if (pageNumA === pageNumB) {
          return (a.titleEnglish || '').localeCompare(b.titleEnglish || '');
        }
        return pageNumA - pageNumB;
    });

    setHymns(sortedHymns);
    setIsLoading(false);
  }, [initialHymns]);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading hymn index...</p>;
  }

  if (!hymns || hymns.length === 0) {
    return <p className="text-muted-foreground">No page-numbered hymns available in the index.</p>;
  }

  return (
    <div className="space-y-4">
      {hymns.map((hymn) => (
        <Link key={hymn.id} href={`/hymnal/${hymn.id}`} className="block hover:no-underline">
          <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full flex-shrink-0">
                  {hymn.pageNumber}
                </span>
                <div className="flex-grow">
                  <CardTitle className="font-headline text-lg group-hover:text-primary">
                    {hymn.titleEnglish || hymn.titleHiligaynon || 'Untitled Hymn'}
                  </CardTitle>
                </div>
                <BookKey className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
