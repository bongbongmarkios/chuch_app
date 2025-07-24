'use client';

import { useState } from 'react';
import type { Reading } from '@/types';
import { sampleReadings } from '@/data/readings';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface DeleteReadingDialogContentProps {
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export default function DeleteReadingDialogContent({ 
  onOpenChange, 
  onDeleteSuccess 
}: DeleteReadingDialogContentProps) {
  const [selectedReadingIds, setSelectedReadingIds] = useState<string[]>([]);
  const { toast } = useToast();

  const readings: Reading[] = sampleReadings;

  const handleCheckboxChange = (readingId: string, checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
        setSelectedReadingIds((prevSelected) =>
        checked
            ? [...prevSelected, readingId]
            : prevSelected.filter((id) => id !== readingId)
        );
    }
  };

  const handleDeleteSelected = () => {
    if (selectedReadingIds.length === 0) {
      toast({
        title: 'No Readings Selected',
        description: 'Please select at least one reading to delete.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Deleting readings with IDs:', selectedReadingIds);
    // In a real app, you would make an API call here to delete the readings
    // and then potentially update the local state or re-fetch the reading list.

    toast({
      title: 'Readings Deleted (Simulated)',
      description: `${selectedReadingIds.length} reading(s) have been "deleted".`,
    });

    setSelectedReadingIds([]); // Clear selection
    if (onDeleteSuccess) {
      onDeleteSuccess(); 
    } else {
      onOpenChange(false); 
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="space-y-3">
          {readings.length > 0 ? (
            readings.map((reading) => (
              <div key={reading.id} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`reading-${reading.id}`}
                  checked={selectedReadingIds.includes(reading.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(reading.id, checked)}
                  aria-label={`Select ${reading.title}`}
                />
                <Label
                  htmlFor={`reading-${reading.id}`}
                  className="flex-grow cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {reading.pageNumber && <span className="text-xs text-muted-foreground mr-2">#{reading.pageNumber}</span>}
                  {reading.title}
                  {reading.source && <span className="text-xs text-muted-foreground ml-2">({reading.source})</span>}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">No readings available to delete.</p>
          )}
        </div>
      </ScrollArea>
      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteSelected}
          disabled={selectedReadingIds.length === 0}
        >
          Delete Selected ({selectedReadingIds.length})
        </Button>
      </DialogFooter>
    </div>
  );
}
