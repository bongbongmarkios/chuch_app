'use client';
import AppHeader from '@/components/layout/AppHeader';
import HymnList from '@/components/hymnal/HymnList';
import { initialSampleHymns } from '@/data/hymns';
import type { Hymn } from '@/types';
import { useState } from 'react';
import { Heart, Bot, BookOpen, Music, Sparkles } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import ChatInterface from '@/components/ai/ChatInterface';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { AddHymnForm } from '@/components/hymnal/AddHymnForm';

export default function HymnalPage() {
  const hymns: Hymn[] = [...initialSampleHymns].sort((a, b) => {
    const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
    const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;

    if (isNaN(pageNumA) && isNaN(pageNumB)) return 0;
    if (isNaN(pageNumA)) return 1;
    if (isNaN(pageNumB)) return -1;

    return pageNumA - pageNumB;
  });

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const headerTitle = (
    <div className="flex items-center space-x-2 sm:space-x-3">
      <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl">
        <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
          SBC App
        </h1>
      </div>
    </div>
  );

  const headerActions = (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        type="button"
        aria-label={showFavoritesOnly ? 'Show all hymns' : 'Show only favorites'}
        onClick={() => setShowFavoritesOnly((prev) => !prev)}
        className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
          showFavoritesOnly 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        tabIndex={0}
      >
        <Heart
          className="h-4 w-4 sm:h-5 sm:w-5"
          strokeWidth={1.5}
          fill={showFavoritesOnly ? 'currentColor' : 'none'}
        />
      </button>
      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogTrigger asChild>
          <button
            className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
            aria-label="AI Assistant"
          >
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          {/* <ChatInterface /> */}
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AppHeader 
        title={headerTitle}
        actions={headerActions}
      />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Music className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 px-2">
              {showFavoritesOnly ? 'Favorite Hymns' : 'SBC Hymnal App'}
            </h2>
            <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto px-4 leading-relaxed">
              {showFavoritesOnly 
                ? 'Your cherished hymns and spiritual songs'
                : 'Discover the hymnals in digital version with English and Hiligaynon versions which includes audio'
              }
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 px-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="text-xs sm:text-sm font-medium">{hymns.length} Hymns</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="text-xs sm:text-sm font-medium">Digital Version</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="relative -mt-4 sm:-mt-8">
        <div className="px-3 sm:px-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-3 sm:p-6">
              <HymnList initialHymns={hymns} showFavoritesOnly={showFavoritesOnly} />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
