'use client';

import * as React from 'react';
import type { Program } from '@/types';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { samplePrograms } from '@/data/programs';
import { CalendarDays, Loader2 } from 'lucide-react';

const LOCAL_STORAGE_PROGRAMS_KEY = 'graceNotesPrograms';

interface ProgramSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ProgramSearchDialog({ open, onOpenChange }: ProgramSearchDialogProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (open) {
        setIsLoading(true);
        let loadedPrograms: Program[] = [];
        try {
            const storedProgramsString = localStorage.getItem(LOCAL_STORAGE_PROGRAMS_KEY);
            if (storedProgramsString) {
                loadedPrograms = JSON.parse(storedProgramsString);
            } else {
                loadedPrograms = [...samplePrograms];
            }
        } catch (error) {
            console.error("Error loading programs for search:", error);
            loadedPrograms = [...samplePrograms];
        }
        setPrograms(loadedPrograms);
        setIsLoading(false);
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    onOpenChange(false)
    command()
  }, [onOpenChange]);

  const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      // Dates from localStorage might not be Date objects.
      // UTC timezone is important to prevent off-by-one day errors.
      return new Date(dateString).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
      });
  };

  // Filtering logic: match by title or date (case-insensitive, partial match)
  const filteredPrograms = React.useMemo(() => {
    if (!query.trim()) return programs;
    const q = query.trim().toLowerCase();
    return programs.filter(program => {
      const dateStr = program.date ? formatDate(program.date) : '';
      return (
        (program.title && program.title.toLowerCase().includes(q)) ||
        (dateStr && dateStr.toLowerCase().includes(q))
      );
    });
  }, [programs, query]);

  return (
    <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search Programs"
        description="Search for programs by title or date."
    >
      <CommandInput 
        placeholder="Search programs by title or date..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2"/>
                Loading programs...
            </div>
        ) : (
            <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Programs">
                {filteredPrograms.map((program) => (
                    <CommandItem
                        key={program.id}
                        value={`${program.date ? formatDate(program.date) : ''} - ${program.title}`}
                        onSelect={() => {
                            runCommand(() => router.push(`/program/${program.id}`))
                        }}
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {program.date ? `${formatDate(program.date)} - ` : ''}{program.title}
                          </span>
                        </div>
                    </CommandItem>
                ))}
                </CommandGroup>
            </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
