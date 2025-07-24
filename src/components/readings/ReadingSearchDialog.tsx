'use client';

import * as React from 'react';
import type { Reading } from '@/types';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { sampleReadings } from '@/data/readings';
import { BookText, Loader2 } from 'lucide-react';

const LOCAL_STORAGE_READINGS_KEY = 'graceNotesReadings';

interface ReadingSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ReadingSearchDialog({ open, onOpenChange }: ReadingSearchDialogProps) {
  const [readings, setReadings] = React.useState<Reading[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (open) {
        setIsLoading(true);
        let loadedReadings: Reading[] = [];
        try {
            const storedReadingsString = localStorage.getItem(LOCAL_STORAGE_READINGS_KEY);
            if (storedReadingsString) {
                loadedReadings = JSON.parse(storedReadingsString);
            } else {
                loadedReadings = [...sampleReadings];
            }
        } catch (error) {
            console.error("Error loading readings for search:", error);
            loadedReadings = [...sampleReadings];
        }
        setReadings(loadedReadings);
        setIsLoading(false);
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    onOpenChange(false)
    command()
  }, [onOpenChange]);

  // Enhanced filtering logic
  const filteredReadings = React.useMemo(() => {
    if (!query.trim()) return readings;
    const q = query.trim().toLowerCase();
    return readings.filter(reading => {
      return (
        (reading.title && reading.title.toLowerCase().includes(q)) ||
        (reading.pageNumber && reading.pageNumber.toLowerCase().includes(q)) ||
        (reading.source && reading.source.toLowerCase().includes(q)) ||
        (reading.lyrics && reading.lyrics.toLowerCase().includes(q))
      );
    });
  }, [readings, query]);

  return (
    <CommandDialog 
        open={open}
        onOpenChange={onOpenChange}
        title="Search Readings"
        description="Search for readings by title, page number, or content."
    >
      <CommandInput
        placeholder="Search readings by title, page, or content..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2"/>
                Loading readings...
            </div>
        ) : (
            <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Readings">
                {filteredReadings.map((reading) => (
                    <CommandItem
                        key={reading.id}
                        value={`${reading.title} ${reading.pageNumber || ''} ${reading.source || ''} ${reading.lyrics}`}
                        onSelect={() => {
                            runCommand(() => router.push(`/readings/${reading.id}`))
                        }}
                    >
                        <BookText className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                            <span className="font-medium">
                              {reading.pageNumber && (
                                <span className="text-xs text-muted-foreground mr-2">p. {reading.pageNumber} - </span>
                              )}
                              {reading.title}
                            </span>
                            {reading.source && <span className="text-xs text-muted-foreground">{reading.source}</span>}
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
