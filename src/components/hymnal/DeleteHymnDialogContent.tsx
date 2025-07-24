'use client';

import { useState, useEffect } from 'react';
import type { Hymn, AnyTrashedItem, TrashedHymn } from '@/types';
import { initialSampleHymns } from '@/data/hymns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2, CheckCheck, XSquare } from 'lucide-react';

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';
const LOCAL_STORAGE_TRASH_KEY = 'graceNotesTrash';

export default function DeleteHymnDialogContent({ 
  onOpenChange, 
  onDeleteSuccess 
}: DeleteHymnDialogContentProps) {
  const [selectedHymnIds, setSelectedHymnIds] = useState<string[]>([]);
  const [activeHymnsToDisplay, setActiveHymnsToDisplay] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
      let loadedHymns: Hymn[];
      if (storedHymnsString) {
        loadedHymns = JSON.parse(storedHymnsString);
      } else {
        loadedHymns = [...initialSampleHymns];
        localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(loadedHymns));
      }
      
      const sortedHymns = [...loadedHymns].sort((a, b) => {
          const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
          const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
          if (isNaN(pageNumA) && isNaN(pageNumB)) return 0;
          if (isNaN(pageNumA)) return 1;
          if (isNaN(pageNumB)) return -1;
          return pageNumA - pageNumB;
      });
      setActiveHymnsToDisplay(sortedHymns);
    } catch (error) {
      console.error("Error loading active hymns for deletion dialog:", error);
      const sortedInitial = [...initialSampleHymns].sort((a, b) => {
        const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
        const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
        if (isNaN(pageNumA) && isNaN(pageNumB)) return 0;
        if (isNaN(pageNumA)) return 1;
        if (isNaN(pageNumB)) return -1;
        return pageNumA - pageNumB;
      });
      setActiveHymnsToDisplay(sortedInitial);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCheckboxChange = (hymnId: string, checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
        setSelectedHymnIds((prevSelected) =>
        checked
            ? [...prevSelected, hymnId]
            : prevSelected.filter((id) => id !== hymnId)
        );
    }
  };

  const handleSelectAll = () => {
    setSelectedHymnIds(activeHymnsToDisplay.map(h => h.id));
  };

  const handleDeselectAll = () => {
    setSelectedHymnIds([]);
  };

  const handleMoveToTrashSelected = () => {
    if (selectedHymnIds.length === 0) {
      toast({
        title: 'No Hymns Selected',
        description: 'Please select at least one hymn to move to trash.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
      let currentActiveHymns: Hymn[] = storedHymnsString ? JSON.parse(storedHymnsString) : [...initialSampleHymns];

      const storedTrashString = localStorage.getItem(LOCAL_STORAGE_TRASH_KEY);
      let currentTrash: AnyTrashedItem[] = storedTrashString ? JSON.parse(storedTrashString) : [];

      const hymnsToTrash: TrashedHymn[] = [];
      const remainingActiveHymns = currentActiveHymns.filter(hymn => {
        if (selectedHymnIds.includes(hymn.id)) {
          hymnsToTrash.push({
            originalId: hymn.id,
            itemType: 'hymn',
            data: hymn,
            trashedAt: new Date().toISOString(),
          });
          return false; 
        }
        return true; 
      });

      currentTrash.push(...hymnsToTrash);

      localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(remainingActiveHymns));
      localStorage.setItem(LOCAL_STORAGE_TRASH_KEY, JSON.stringify(currentTrash));
      
      const sortedRemainingHymns = [...remainingActiveHymns].sort((a, b) => {
        const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
        const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
        if (isNaN(pageNumA) && isNaN(pageNumB)) return 0;
        if (isNaN(pageNumA)) return 1;
        if (isNaN(pageNumB)) return -1;
        return pageNumA - pageNumB;
      });
      setActiveHymnsToDisplay(sortedRemainingHymns);

      toast({
        title: 'Hymns Moved to Trash',
        description: `${selectedHymnIds.length} hymn(s) have been moved to trash. They will be permanently deleted after 30 days.`,
      });

      setSelectedHymnIds([]); 
      if (onDeleteSuccess) {
        onDeleteSuccess(); 
      }
      
    } catch (error) {
      console.error("Error moving hymns to trash:", error);
      toast({
        title: 'Error',
        description: 'Could not move hymns to trash.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 h-[388px]"> {/* Adjusted height for select all/deselect all buttons */}
        <div className="flex justify-end gap-2 mb-2">
            <Button variant="outline" size="sm" disabled><CheckCheck className="mr-1.5 h-4 w-4"/>Select All</Button>
            <Button variant="outline" size="sm" disabled><XSquare className="mr-1.5 h-4 w-4"/>Deselect All</Button>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled>
            Close
            </Button>
            <Button variant="destructive" disabled>
            Move to Trash (0)
            </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-end gap-2 mb-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSelectAll} 
          disabled={activeHymnsToDisplay.length === 0 || selectedHymnIds.length === activeHymnsToDisplay.length}
        >
          <CheckCheck className="mr-1.5 h-4 w-4"/>Select All
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDeselectAll}
          disabled={selectedHymnIds.length === 0}
        >
          <XSquare className="mr-1.5 h-4 w-4"/>Deselect All
        </Button>
      </div>

      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="space-y-3">
          {activeHymnsToDisplay.length > 0 ? (
            activeHymnsToDisplay.map((hymn) => (
              <div key={hymn.id} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`hymn-delete-${hymn.id}`}
                  checked={selectedHymnIds.includes(hymn.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(hymn.id, checked)}
                  aria-label={`Select ${hymn.titleEnglish || hymn.titleHiligaynon}`}
                />
                <Label
                  htmlFor={`hymn-delete-${hymn.id}`}
                  className="flex-grow cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {hymn.pageNumber && <span className="text-xs text-muted-foreground mr-2">#{hymn.pageNumber}</span>}
                  {hymn.titleEnglish || hymn.titleHiligaynon}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No active hymns available.</p>
          )}
        </div>
      </ScrollArea>
      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button
          variant="destructive"
          onClick={handleMoveToTrashSelected}
          disabled={selectedHymnIds.length === 0 || activeHymnsToDisplay.length === 0}
        >
          Move to Trash ({selectedHymnIds.length})
        </Button>
      </DialogFooter>
    </div>
  );
}

interface DeleteHymnDialogContentProps {
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}
