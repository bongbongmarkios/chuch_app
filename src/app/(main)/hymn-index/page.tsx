
import AppHeader from '@/components/layout/AppHeader';
import HymnIndexList from '@/components/hymnal/HymnIndexList';
import { initialSampleHymns } from '@/data/hymns';
import type { Hymn } from '@/types';

export const metadata = {
  title: 'Hymn Page Index | SBC App',
};

export default async function HymnIndexPage() {
  // Server-side sorting and filtering for initial render if desired,
  // but HymnIndexList will also sort/filter from localStorage client-side.
  const hymns: Hymn[] = [...initialSampleHymns].sort((a, b) => {
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

  return (
    <>
      <AppHeader 
        title="Hymn Page Index" 
      />
      <div className="container mx-auto px-4 pb-8">
        <HymnIndexList initialHymns={hymns} />
      </div>
    </>
  );
}
