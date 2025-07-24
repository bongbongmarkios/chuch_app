'use client';

import AppHeader from '@/components/layout/AppHeader';
import ProgramList from '@/components/program/ProgramList';
import { samplePrograms as initialSamplePrograms } from '@/data/programs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Sparkles, Bot, Calendar, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddProgramForm from '@/components/program/AddProgramForm';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Program } from '@/types';
// import ChatInterface from '@/components/ai/ChatInterface';
// import FloatingAiButton from '@/components/ai/FloatingAiButton';

const LOCAL_STORAGE_PROGRAMS_KEY = 'graceNotesPrograms';

export default function ProgramListPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [showHeaderAi, setShowHeaderAi] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const FAB_FLOAT_KEY = 'aiFabFloating';
  const FAB_POS_KEY = 'aiFabPosition';

  const fetchPrograms = useCallback(() => {
    setIsLoading(true);
    let loadedPrograms: Program[] = [];
    try {
      const storedProgramsString = localStorage.getItem(LOCAL_STORAGE_PROGRAMS_KEY);
      if (storedProgramsString) {
        loadedPrograms = JSON.parse(storedProgramsString);
      } else {
        // Prime localStorage with initial programs if it's empty
        loadedPrograms = [...initialSamplePrograms];
        localStorage.setItem(LOCAL_STORAGE_PROGRAMS_KEY, JSON.stringify(loadedPrograms));
      }
    } catch (error) {
      console.error("Error loading programs from localStorage:", error);
      // Fallback to initialSamplePrograms on error
      loadedPrograms = [...initialSamplePrograms];
    }

    setPrograms(loadedPrograms);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleProgramDataChanged = () => {
    fetchPrograms(); 
  };

  const handleProgramAddedSuccess = () => {
    // This now only refreshes the data in the background.
    // The form itself controls when the dialog closes.
    handleProgramDataChanged();
  };

  const closeAddProgramDialog = () => {
    setIsAddProgramDialogOpen(false);
  };

  useEffect(() => {
    const storedFloating = localStorage.getItem(FAB_FLOAT_KEY);
    setShowHeaderAi(storedFloating !== 'true');

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAB_FLOAT_KEY) {
        setShowHeaderAi(e.newValue !== 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleHeaderAiMouseDown = () => {
    longPressTimeout.current = setTimeout(() => {
      setShowHeaderAi(false);
      localStorage.setItem(FAB_FLOAT_KEY, 'true');
      localStorage.setItem(FAB_POS_KEY, JSON.stringify({ left: 24, top: null, bottom: 96 }));
      window.dispatchEvent(new StorageEvent('storage', { key: FAB_FLOAT_KEY, newValue: 'true' }));
    }, 500);
  };
  
  const handleHeaderAiMouseUp = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };
  
  const headerTitle = (
    <div className="flex items-center space-x-2 sm:space-x-3">
      <div className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg sm:rounded-xl">
        <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
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
        aria-label={showFavoritesOnly ? 'Show all programs' : 'Show only favorites'}
        onClick={() => setShowFavoritesOnly((prev) => !prev)}
        className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
          showFavoritesOnly 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        tabIndex={0}
      >
        <Sparkles
          className="h-4 w-4 sm:h-5 sm:w-5"
          strokeWidth={1.5}
          fill={showFavoritesOnly ? 'currentColor' : 'none'}
        />
      </button>
      {showHeaderAi && (
        <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all duration-200"
              aria-label="AI Assistant"
              onMouseDown={handleHeaderAiMouseDown}
              onMouseUp={handleHeaderAiMouseUp}
              onMouseLeave={handleHeaderAiMouseUp}
              onTouchStart={handleHeaderAiMouseDown}
              onTouchEnd={handleHeaderAiMouseUp}
            >
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] p-0">
            {/* <ChatInterface /> */}
            <div className="p-6 text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">AI Assistant temporarily unavailable</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader title={headerTitle} actions={headerActions} />
        <div className="container mx-auto px-4 pb-8 text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader title={headerTitle} actions={headerActions} />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-orange-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 px-2">
              {showFavoritesOnly ? 'Favorite Programs' : 'SBC Programs App'}
            </h2>
            <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto px-4 leading-relaxed">
              {showFavoritesOnly 
                ? 'Your cherished worship programs and services'
                : 'Create and manage worship programs with hymns, readings, and special elements for your services'
              }
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 px-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="text-xs sm:text-sm font-medium">{programs.length} Programs</span>
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
              <ProgramList programs={programs} onProgramDeleted={handleProgramDataChanged} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <Dialog open={isAddProgramDialogOpen} onOpenChange={setIsAddProgramDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-6 z-50 print:hidden rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            aria-label="Add new program"
          >
            <Plus className="h-7 w-7" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl h-[80vh] sm:h-[75vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Program</DialogTitle>
            <DialogDescription>
              Enter details and select items for the new program.
            </DialogDescription>
          </DialogHeader>
          <AddProgramForm
            onFormSubmitSuccess={handleProgramAddedSuccess}
            onCancel={closeAddProgramDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
