'use client';

import type { Program, TrashedProgram, AnyTrashedItem } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface ProgramListProps {
  programs: Program[];
  onProgramDeleted?: () => void; // Optional callback to refresh list
}

const LOCAL_STORAGE_TRASH_KEY = 'graceNotesTrash';
const LOCAL_STORAGE_PROGRAMS_KEY = 'graceNotesPrograms'; // Key for active programs

export default function ProgramList({ programs, onProgramDeleted }: ProgramListProps) {
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [programToConfirmDelete, setProgramToConfirmDelete] = useState<Program | null>(null);

  const handleDeleteInitiate = (program: Program, event: React.MouseEvent) => {
    event.preventDefault(); 
    event.stopPropagation(); 
    setProgramToConfirmDelete(program);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!programToConfirmDelete) return;
    const programToDelete = programToConfirmDelete;

    try {
        const activeProgramsString = localStorage.getItem(LOCAL_STORAGE_PROGRAMS_KEY);
        let activePrograms: Program[] = activeProgramsString ? JSON.parse(activeProgramsString) : [];

        const programIndex = activePrograms.findIndex(p => p.id === programToDelete.id);
        if (programIndex === -1) {
            toast({ title: "Error", description: "Program to delete was not found in local storage.", variant: "destructive" });
            return;
        }

        const [deletedProgramData] = activePrograms.splice(programIndex, 1);
        localStorage.setItem(LOCAL_STORAGE_PROGRAMS_KEY, JSON.stringify(activePrograms));

        const storedTrashString = localStorage.getItem(LOCAL_STORAGE_TRASH_KEY);
        let currentTrash: AnyTrashedItem[] = storedTrashString ? JSON.parse(storedTrashString) : [];
        const trashedProgramEntry: TrashedProgram = {
          originalId: deletedProgramData.id,
          itemType: 'program',
          data: deletedProgramData,
          trashedAt: new Date().toISOString(),
        };
        currentTrash.push(trashedProgramEntry);
        localStorage.setItem(LOCAL_STORAGE_TRASH_KEY, JSON.stringify(currentTrash));

        toast({
          title: "Program Moved to Trash",
          description: `"${deletedProgramData.title}" has been moved to trash.`,
        });
        
        if (onProgramDeleted) {
          onProgramDeleted(); 
        }
    } catch (e) {
        console.error("Error managing program in localStorage:", e);
        toast({
            title: "Storage Error",
            description: `Could not move program to trash due to a storage issue.`,
            variant: "destructive"
        });
    } finally {
        setIsConfirmDeleteDialogOpen(false);
        setProgramToConfirmDelete(null);
    }
  };

  if (!programs || programs.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No programs available.</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {programs.map((program) => (
          <Card key={program.id} className="hover:shadow-md transition-shadow duration-200 relative">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive transition-opacity rounded-full"
                onClick={(e) => handleDeleteInitiate(program, e)}
                aria-label={`Delete program ${program.title}`}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            
            <Link href={`/program/${program.id}`} className="block hover:no-underline p-0" aria-label={`View program ${program.title}`}>
              <CardHeader className="pr-12 pt-4 pb-4 pl-4"> 
                <CardTitle className="font-headline text-xl group-hover:text-primary">{program.title}</CardTitle>
                {program.date && (
                  <CardDescription className="text-sm text-muted-foreground pt-1 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {new Date(program.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                  </CardDescription>
                )}
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {programToConfirmDelete && (
        <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}> 
            <AlertDialogHeader>
              <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to move the program &quot;{programToConfirmDelete.title}&quot; to the trash? It can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsConfirmDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Move to Trash
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
