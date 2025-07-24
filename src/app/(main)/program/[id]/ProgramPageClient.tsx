'use client';

import AppHeader from '@/components/layout/AppHeader';
import ProgramPresenter from '@/components/program/ProgramPresenter';
import type { Program } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Bot, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import ChatInterface from '@/components/ai/ChatInterface';
import { samplePrograms } from '@/data/programs';

const LOCAL_STORAGE_PROGRAMS_KEY = 'graceNotesPrograms';

export default function ProgramPageClient({ id }: { id: string }) {
  const [program, setProgram] = useState<Program | null | undefined>(undefined); // undefined for loading, null for not found
  const [presenterKey, setPresenterKey] = useState(Date.now());
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    let foundProgram: Program | undefined;
    try {
        const storedProgramsString = localStorage.getItem(LOCAL_STORAGE_PROGRAMS_KEY);
        if (storedProgramsString) {
            const allPrograms: Program[] = JSON.parse(storedProgramsString);
            foundProgram = allPrograms.find(p => p.id === id);
        }

        // If not found in localStorage, check initial data as a fallback
        if (!foundProgram) {
            foundProgram = samplePrograms.find(p => p.id === id);
        }

    } catch (error) {
        console.error("Error loading program from localStorage:", error);
        // Fallback to initial data on error
        foundProgram = samplePrograms.find(p => p.id === id);
    }
    
    setProgram(foundProgram || null); // Set to null if not found anywhere

  }, [id]);

  const handleRestartProgram = () => {
    setPresenterKey(Date.now());
  };

  const handleAIClick = () => {
    setIsChatOpen(true);
  };

  if (program === undefined) {
    // Loading state
    return (
        <>
            <AppHeader 
                title={
                <Button asChild variant="outline" size="sm" disabled>
                    <Link href="/program">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
                    </Link>
                </Button>
                }
            />
            <div className="container mx-auto px-4 pb-8 text-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Loading program...</p>
            </div>
        </>
    );
  }

  if (program === null) {
    // Not found state
    return (
        <>
            <AppHeader 
                title={
                <Button asChild variant="outline" size="sm">
                    <Link href="/program">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
                    </Link>
                </Button>
                }
            />
            <div className="container mx-auto px-4 pb-8 text-center py-10">
                <h2 className="text-2xl font-semibold mb-4 text-destructive">Program Not Found</h2>
                <p className="text-muted-foreground mb-6">The program with ID "{id}" could not be found.</p>
                <Button asChild>
                    <Link href="/program">Return to Program List</Link>
                </Button>
            </div>
        </>
    );
  }

  // Program found, render it
  return (
    <>
      <AppHeader 
        title={
          <Button asChild variant="outline" size="sm">
            <Link href="/program">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
            </Link>
          </Button>
        }
        onRestart={handleRestartProgram}
        actions={
          <div className="flex items-center gap-2">
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Open AI Chat"
                  className="flex items-center justify-center focus:outline-none"
                  tabIndex={0}
                >
                  <Bot className="h-6 w-6" />
                </button>
              </DialogTrigger>
              <DialogContent className="w-screen h-screen max-w-none top-0 left-0 sm:top-0 translate-x-0 translate-y-0 rounded-none border-0 flex flex-col p-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>AI Chat</DialogTitle>
                  <DialogDescription>
                    An interactive chat window to ask questions or get help with this program.
                  </DialogDescription>
                </DialogHeader>
                {/* <ChatInterface /> */}
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center my-4 md:my-6">
          <h1 className="text-xl md:text-2xl font-headline font-bold text-primary break-words">
            {program.title}
          </h1>
          {program.date && (
            <p className="text-md md:text-lg text-muted-foreground mt-2">
              {new Date(program.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          )}
        </div>
        <ProgramPresenter key={presenterKey} program={program} />
      </div>
    </>
  );
} 