'use client';

import * as React from 'react';
import type { Hymn } from '@/types';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { initialSampleHymns } from '@/data/hymns';
import { FileMusic, Loader2 } from 'lucide-react';

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';

interface HymnSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function HymnSearchDialog({ open, onOpenChange }: HymnSearchDialogProps) {
  const [hymns, setHymns] = React.useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (open) {
        setIsLoading(true);
        let loadedHymns: Hymn[] = [];
        try {
            const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
            if (storedHymnsString) {
                loadedHymns = JSON.parse(storedHymnsString);
            } else {
                loadedHymns = [...initialSampleHymns];
            }
        } catch (error) {
            console.error("Error loading hymns for search:", error);
            loadedHymns = [...initialSampleHymns];
        }
        setHymns(loadedHymns);
        setIsLoading(false);
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    onOpenChange(false)
    command()
  }, [onOpenChange]);

  // Filtering logic: match by page number, any title, or any lyrics (case-insensitive, partial match)
  const filteredHymns = React.useMemo(() => {
    if (!query.trim()) return hymns;
    const q = query.trim().toLowerCase();
    return hymns.filter(hymn => {
      return (
        (hymn.pageNumber && hymn.pageNumber.toLowerCase().includes(q)) ||
        (hymn.titleHiligaynon && hymn.titleHiligaynon.toLowerCase().includes(q)) ||
        (hymn.titleEnglish && hymn.titleEnglish.toLowerCase().includes(q)) ||
        (hymn.titleFilipino && hymn.titleFilipino.toLowerCase().includes(q)) ||
        (hymn.lyricsHiligaynon && hymn.lyricsHiligaynon.toLowerCase().includes(q)) ||
        (hymn.lyricsEnglish && hymn.lyricsEnglish.toLowerCase().includes(q)) ||
        (hymn.lyricsFilipino && hymn.lyricsFilipino.toLowerCase().includes(q))
      );
    });
  }, [hymns, query]);

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Search Hymns"
      description="Search for hymns by title, page number, or lyrics."
    >
      <CommandInput 
        placeholder="Search hymns by title, page number, or lyrics..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2"/>
                Loading hymns...
            </div>
        ) : (
            <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Hymns">
                {filteredHymns.map((hymn) => (
                    <CommandItem
                        key={hymn.id}
                        value={`p. ${hymn.pageNumber || ''} - ${hymn.titleHiligaynon || hymn.titleEnglish || hymn.titleFilipino || ''} ${hymn.titleEnglish || ''} ${hymn.titleFilipino || ''} ${hymn.pageNumber || ''} ${hymn.lyricsHiligaynon || ''} ${hymn.lyricsEnglish || ''} ${hymn.lyricsFilipino || ''}`}
                        onSelect={() => {
                            runCommand(() => router.push(`/hymnal/${hymn.id}`))
                        }}
                    >
                        <FileMusic className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {hymn.pageNumber ? `p. ${hymn.pageNumber} - ` : ''}
                            {hymn.titleHiligaynon || hymn.titleEnglish || hymn.titleFilipino || 'Untitled Hymn'}
                          </span>
                          {hymn.titleEnglish && hymn.titleEnglish !== hymn.titleHiligaynon && (
                            <span className="text-xs text-muted-foreground">{hymn.titleEnglish}</span>
                          )}
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
