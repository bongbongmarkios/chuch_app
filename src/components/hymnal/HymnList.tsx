'use client';
import type { Hymn } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Heart, Trash2, Music, BookOpen, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';
const LOCAL_STORAGE_TRASH_KEY = 'graceNotesTrash';

const isValidHymn = (h: Hymn | undefined | null): h is Hymn => {
  return !!(h && h.id && typeof h.id === 'string' && h.id.trim() !== "");
};

interface HymnListProps {
  initialHymns: Hymn[];
  showFavoritesOnly?: boolean;
}

export default function HymnList({ initialHymns, showFavoritesOnly = false }: HymnListProps) {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadAndSetHymns = useCallback(() => {
    setIsLoading(true);
    let finalHymnsToDisplay: Hymn[] = [];
    const validInitialHymnsFromProp = initialHymns.filter(isValidHymn);

    try {
      const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);

      if (storedHymnsString !== null) { 
        finalHymnsToDisplay = JSON.parse(storedHymnsString).filter(isValidHymn);
      } else {
        finalHymnsToDisplay = validInitialHymnsFromProp;
        localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(finalHymnsToDisplay));
      }
    } catch (error) {
      console.error("Error processing hymns from localStorage or props:", error);
      finalHymnsToDisplay = validInitialHymnsFromProp;
      try {
        localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(finalHymnsToDisplay));
      } catch (lsError) {
        console.error("Error priming localStorage after initial error:", lsError);
      }
    }
    
    const sortedHymns = [...finalHymnsToDisplay].sort((a, b) => {
        const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
        const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
        if (isNaN(pageNumA) && isNaN(pageNumB)) return (a.titleEnglish || a.titleHiligaynon || '').localeCompare(b.titleEnglish || b.titleHiligaynon || '');
        if (isNaN(pageNumA)) return 1;
        if (isNaN(pageNumB)) return -1;
        
        if (pageNumA === pageNumB) {
          return (a.titleEnglish || a.titleHiligaynon || '').localeCompare(b.titleEnglish || b.titleHiligaynon || '');
        }
        return pageNumA - pageNumB;
    });

    setHymns(sortedHymns);
    setIsLoading(false);
  }, [initialHymns]);

  useEffect(() => {
    loadAndSetHymns();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_HYMNS_KEY || event.key === null) {
        loadAndSetHymns();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAndSetHymns]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Loading hymns...</p>
        </div>
      </div>
    );
  }

  if (!hymns || hymns.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
          <Music className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">No hymns available.</p>
      </div>
    );
  }

  const displayedHymns = showFavoritesOnly
    ? hymns.filter((hymn) => favoriteIds.has(hymn.id))
    : hymns;

  if (showFavoritesOnly && displayedHymns.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
          <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Favorite Hymns</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-4">Start adding hymns to your favorites to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header Stats - Mobile Optimized */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              {displayedHymns.length} {showFavoritesOnly ? 'Favorites' : 'Hymns'}
            </span>
          </div>
          {showFavoritesOnly && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
              <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Favorites Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Hymns Grid - Mobile Optimized */}
      <div className="grid gap-3 sm:gap-4">
        {displayedHymns.map((hymn) => {
          if (!isValidHymn(hymn) || hymn.id.trim().length === 0) return null;
          return (
            <Link
              key={hymn.id}
              href={`/hymnal/${hymn.id.trim()}`}
              className="block hover:no-underline group"
            >
              <Card className="card-modern hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {hymn.pageNumber && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm relative">
                          {hymn.externalUrl && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                              <Music className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                          {hymn.pageNumber}
                        </div>
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <CardTitle className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 leading-tight">
                        {hymn.titleHiligaynon ? hymn.titleHiligaynon.toUpperCase() : 'Untitled Hymn'}
                      </CardTitle>
                      {hymn.titleEnglish && hymn.titleEnglish.toUpperCase() !== (hymn.titleHiligaynon || '').toUpperCase() && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                          {hymn.titleEnglish}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={favoriteIds.has(hymn.id) ? 'Unfavorite' : 'Favorite'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(hymn.id);
                      }}
                      className="flex-shrink-0 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                      tabIndex={0}
                    >
                      <Heart
                        className={`h-6 w-6 sm:h-7 sm:w-7 transition-all duration-200 ${
                          favoriteIds.has(hymn.id)
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
