'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import ReadingDetail from '@/components/readings/ReadingDetail';
import { updateSampleReading, sampleReadings } from '@/data/readings';
import type { Reading } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, FilePenLine, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EditReadingForm from '@/components/readings/EditReadingForm';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_READINGS_KEY = 'graceNotesReadings';
const fontSizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

export default function ReadingPageClient({ id }: { id: string }) {
  const [reading, setReading] = useState<Reading | null | undefined>(undefined); // undefined for loading, null for not found
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // Default to 'text-lg'

  const increaseFontSize = () => {
    setFontSizeIndex(prev => Math.min(prev + 1, fontSizes.length - 1));
  };

  const decreaseFontSize = () => {
    setFontSizeIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (!id) return;

    let foundReading: Reading | undefined;
    try {
        const storedReadingsString = localStorage.getItem(LOCAL_STORAGE_READINGS_KEY);
        if (storedReadingsString) {
            const allReadings: Reading[] = JSON.parse(storedReadingsString);
            foundReading = allReadings.find(r => r.id === id);
        }

        // If not found in localStorage, check initial data as a fallback
        if (!foundReading) {
            foundReading = sampleReadings.find(p => p.id === id);
        }

    } catch (error) {
        console.error("Error loading reading from localStorage:", error);
        // Fallback to initial data on error
        foundReading = sampleReadings.find(r => r.id === id);
    }
    
    setReading(foundReading || null); // Set to null if not found anywhere

  }, [id]);

  useEffect(() => {
    if(reading) {
        document.title = `${reading.title} | SBC App`;
    }
  }, [reading]);

  // Set data-page attribute to hide bottom navigation
  useEffect(() => {
    document.body.setAttribute('data-page', 'reading-detail');
    
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  const handleEditSuccess = (updatedReading: Reading) => {
    try {
      // Update local storage
      const storedReadingsString = localStorage.getItem(LOCAL_STORAGE_READINGS_KEY);
      const allReadings = storedReadingsString ? JSON.parse(storedReadingsString) : [...sampleReadings];
      const updatedList = allReadings.map((r: Reading) => r.id === updatedReading.id ? updatedReading : r);
      localStorage.setItem(LOCAL_STORAGE_READINGS_KEY, JSON.stringify(updatedList));

      // Update in-memory fallback
      updateSampleReading(updatedReading.id, updatedReading);

      // Update component state
      setReading(updatedReading);
      setIsEditDialogOpen(false);
    } catch (error) {
        console.error("Error saving updated reading:", error);
        toast({ title: "Storage Error", description: "Failed to save updated reading.", variant: "destructive" });
    }
  };

  if (reading === undefined) {
    // Loading state
    return (
      <>
        <AppHeader 
          title={
            <Button asChild variant="outline" size="sm" disabled>
              <Link href="/readings">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Readings
              </Link>
            </Button>
          }
          hideDefaultActions={true}
        />
        <div className="container mx-auto px-4 pb-8 text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading reading...</p>
        </div>
      </>
    );
  }

  if (reading === null) {
    // Not found state
    return (
      <>
        <AppHeader 
          title={
            <Button asChild variant="outline" size="sm">
              <Link href="/readings">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Readings
              </Link>
            </Button>
          }
          hideDefaultActions={true}
        />
        <div className="container mx-auto px-4 pb-8 text-center py-10">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">Reading Not Found</h2>
          <p className="text-muted-foreground mb-6">The reading with ID "{id}" could not be found.</p>
          <Button asChild>
            <Link href="/readings">Return to Reading List</Link>
          </Button>
        </div>
      </>
    );
  }
  
  const headerActions = (
    <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={decreaseFontSize} aria-label="Decrease font size" disabled={fontSizeIndex === 0}>
            <ZoomOut className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={increaseFontSize} aria-label="Increase font size" disabled={fontSizeIndex === fontSizes.length - 1}>
            <ZoomIn className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} aria-label="Edit reading details">
            <FilePenLine className="h-6 w-6" />
        </Button>
    </div>
  );

  // Reading found, render it
  return (
    <>
      <AppHeader 
        title={
          <Button asChild variant="outline" size="sm">
            <Link href="/readings">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Readings
            </Link>
          </Button>
        }
        actions={headerActions}
        hideDefaultActions={true}
      />
      <div className="container mx-auto px-4 pb-8">
        <ReadingDetail reading={reading} fontSizeClass={fontSizes[fontSizeIndex]} />
      </div>

      {reading && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col sm:rounded-lg">
            <DialogHeader>
              <DialogTitle>Edit Reading: {reading.title}</DialogTitle>
              <DialogDescription>
                Modify the details of the reading below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditReadingForm
              readingToEdit={reading}
              onEditSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
              className="pt-0 flex-1 min-h-0"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 