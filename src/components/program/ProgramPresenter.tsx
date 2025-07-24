
'use client';
import type { Program, ProgramItem, Hymn, Reading } from '@/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2, NotebookText, Eraser, User, Award, Mic, BookMarked } from 'lucide-react';
import { useActivity } from '@/hooks/useActivityTracker';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { initialSampleHymns } from '@/data/hymns'; // For linking hymns
import { sampleReadings } from '@/data/readings'; // For linking readings
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import HymnMultiLanguageView from '@/components/hymnal/HymnMultiLanguageView';


interface ProgramPresenterProps {
  program: Program;
}

const getNotesKey = (programId: string, itemId: string) => `programNotes-${programId}-${itemId}`;

export default function ProgramPresenter({ program }: ProgramPresenterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addProgramItemView } = useActivity();
  const { toast } = useToast();

  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [currentItemHasNote, setCurrentItemHasNote] = useState(false);
  const [hasPersonalNote, setHasPersonalNote] = useState(false);
  const [displayedNote, setDisplayedNote] = useState<string | null>(null);

  const [previewHymn, setPreviewHymn] = useState<Hymn | null>(null);
  const [previewReading, setPreviewReading] = useState<Reading | null>(null);


  const currentItem = program.items[currentIndex];

  const loadNoteForCurrentItem = useCallback(() => {
    if (typeof window !== 'undefined' && currentItem) {
      const notesKey = getNotesKey(program.id, currentItem.id);
      const savedNote = localStorage.getItem(notesKey);
      
      setHasPersonalNote(savedNote !== null);

      if (savedNote !== null) { // A local note exists (even an empty one)
        setCurrentItemHasNote(savedNote.trim().length > 0);
        setDisplayedNote(savedNote);
      } else { // No local note, fall back to the note from program data
        const programNote = currentItem.notes;
        setCurrentItemHasNote(!!programNote && programNote.trim().length > 0);
        setDisplayedNote(programNote || null);
      }
    }
  }, [currentItem, program.id]);

  useEffect(() => {
    if (currentItem) {
      addProgramItemView(currentItem.title);
      loadNoteForCurrentItem();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, program]); // Depend on program and index to reload notes

  const linkedHymn = useMemo(() => {
    if (currentItem?.hymnId) {
      // Load hymns from localStorage for most up-to-date data
      if (typeof window !== 'undefined') {
        const storedHymnsString = localStorage.getItem('graceNotesHymns');
        if (storedHymnsString) {
            const allHymns = JSON.parse(storedHymnsString);
            return allHymns.find((h: Hymn) => h.id === currentItem.hymnId);
        }
      }
      // Fallback to initial data if localStorage isn't available/populated
      return initialSampleHymns.find(h => h.id === currentItem.hymnId);
    }
    return null;
  }, [currentItem]);

  const linkedReading = useMemo(() => {
    if (currentItem?.readingId) {
      // Load readings from localStorage for the most up-to-date data.
      if (typeof window !== 'undefined') {
        const storedReadingsString = localStorage.getItem('graceNotesReadings');
        if (storedReadingsString) {
          const allReadings = JSON.parse(storedReadingsString);
          return allReadings.find((r: Reading) => r.id === currentItem.readingId);
        }
      }
      return sampleReadings.find(r => r.id === currentItem.readingId);
    }
    return null;
  }, [currentItem]);


  const goToNext = () => {
    if (currentIndex < program.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleOpenNotesDialog = () => {
    if (typeof window !== 'undefined' && currentItem) {
      const notesKey = getNotesKey(program.id, currentItem.id);
      const savedNote = localStorage.getItem(notesKey);
      // If a local note exists, edit that. Otherwise, start with program's note.
      setNotesContent(savedNote !== null ? savedNote : (currentItem.notes || ''));
      setIsNotesDialogOpen(true);
    }
  };

  const handleSaveNote = () => {
    if (typeof window !== 'undefined' && currentItem) {
        const notesKey = getNotesKey(program.id, currentItem.id);
        localStorage.setItem(notesKey, notesContent);
        loadNoteForCurrentItem(); // Reload notes to show the new saved one
        toast({ title: 'Note Saved' });
        setIsNotesDialogOpen(false);
    }
  };
  
  const handleDeleteNote = () => {
    if (typeof window !== 'undefined' && currentItem) {
        const notesKey = getNotesKey(program.id, currentItem.id);
        localStorage.removeItem(notesKey);
        loadNoteForCurrentItem(); // Reload to fall back to program note or nothing
        toast({ title: 'Personal Note Deleted', description: `Your personal note for "${currentItem.title}" has been deleted.` });
    }
  };

  if (!currentItem) {
    return (
      <Card className="w-full shadow-xl flex flex-col min-h-[60vh]">
        <CardHeader className="text-center pt-6 pb-2">
          <CardTitle className="font-headline text-2xl md:text-3xl text-destructive">
            Program Item Error
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center text-center p-6">
          <p>Could not load the current program item. The program might be empty or the data is corrupted.</p>
        </CardContent>
        <CardFooter className="flex justify-center pt-4 border-t">
          <Button asChild variant="outline" onClick={goToPrevious}>
            <p>Back to Previous</p>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const progressPercentage = ((currentIndex + 1) / program.items.length) * 100;
  const isOffertoryItem = currentItem.title === 'Giving of tithes or pledges and offering to the lord';
  const hasPrimaryContent = !!currentItem.content || !!linkedHymn || !!linkedReading || !!currentItem.usher || isOffertoryItem;

  return (
    <>
      <div className="relative max-w-2xl mx-auto mt-6">
        <div className="absolute top-0 right-0 z-10 flex -translate-y-1/2 translate-x-2 items-center gap-2">
            {hasPersonalNote && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive bg-card rounded-full shadow-lg border hover:bg-destructive/10"
                    aria-label="Erase personal note for this item"
                  >
                    <Eraser className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Personal Note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete your personal note for &quot;{currentItem.title}&quot;. If a default note was part of the program, it will reappear. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenNotesDialog}
              aria-label="Add or edit note for this item"
              className={`${currentItemHasNote ? "text-primary" : "text-muted-foreground"} bg-card rounded-full shadow-lg border hover:bg-accent/10`}
            >
              <NotebookText className="h-5 w-5" />
            </Button>
        </div>
        <Card className="w-full shadow-xl flex flex-col min-h-[60vh]">
            <CardHeader className="text-center pt-4 pb-2">
            <CardTitle className="font-headline text-2xl md:text-3xl text-primary">
                {currentItem.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
                Item {currentIndex + 1} of {program.items.length}
            </p>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center text-center p-6">
            <div className="w-full">
                {currentItem.content ? (
                    currentItem.title === 'Message' ? (
                        <div className="my-4 p-4 border rounded-md bg-secondary/30 w-full">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center"><Mic className="mr-2 h-4 w-4"/>Message by:</p>
                            <p className="text-lg font-semibold text-foreground">{currentItem.content}</p>
                        </div>
                    ) : currentItem.title === 'Scripture Reading' ? (
                        <div className="my-4 p-4 border rounded-md bg-secondary/30 w-full">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center"><BookMarked className="mr-2 h-4 w-4"/>Scripture Reading by:</p>
                            <p className="text-lg font-semibold text-foreground">{currentItem.content}</p>
                        </div>
                    ) : (
                        <p className="text-lg md:text-xl text-foreground mb-4">{currentItem.content}</p>
                    )
                ) : null}
                {linkedHymn && (
                    <div className="my-4 p-4 border rounded-md bg-secondary/30 w-full">
                        <p className="text-sm text-muted-foreground mb-1">Featured Hymn:</p>
                        <Button variant="link" className="text-lg font-semibold text-accent hover:underline h-auto p-0 text-left" onClick={() => setPreviewHymn(linkedHymn)}>
                        {linkedHymn.titleHiligaynon || linkedHymn.titleEnglish} {linkedHymn.pageNumber ? `(#${linkedHymn.pageNumber})` : ''}
                        </Button>
                    </div>
                )}
                {linkedReading && (
                    <div className="my-4 p-4 border rounded-md bg-secondary/30 w-full">
                        <p className="text-sm text-muted-foreground mb-1">Featured Reading:</p>
                        <Button variant="link" className="text-lg font-semibold text-accent hover:underline h-auto p-0 text-left" onClick={() => setPreviewReading(linkedReading)}>
                            {linkedReading.title}
                        </Button>
                    </div>
                )}
                {currentItem.usher && (
                <div className="my-4 p-4 border rounded-md bg-secondary/30 w-full">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center"><User className="mr-2 h-4 w-4"/>Usher(s):</p>
                    <p className="text-lg font-semibold text-foreground">{currentItem.usher}</p>
                </div>
                )}
                {isOffertoryItem && (
                    <div className="my-4 p-4 border rounded-md bg-secondary/30 w-full">
                        <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center"><Award className="mr-2 h-4 w-4"/>Special Number by:</p>
                        <p className="text-lg font-semibold text-foreground">{currentItem.specialNumber || '?'}</p>
                    </div>
                )}
                {!hasPrimaryContent && (
                <p className="text-muted-foreground italic text-lg">Details for this item will be provided during the service.</p>
                )}
            </div>
            
            {displayedNote && (
                <>
                {hasPrimaryContent && <Separator className="my-6" />}
                <div className="w-full text-left mt-4">
                    <h4 className="font-semibold text-md text-primary mb-2">My Notes:</h4>
                    <p className="text-md text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">{displayedNote}</p>
                </div>
                </>
            )}

            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-4 border-t">
            <Progress value={progressPercentage} className="w-full h-2" />
            <div className="flex justify-between w-full">
                <Button onClick={goToPrevious} disabled={currentIndex === 0} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentIndex === program.items.length - 1 ? (
                <Button variant="default" disabled>
                    End of Program <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
                ) : (
                <Button onClick={goToNext}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                )}
            </div>
            </CardFooter>
        </Card>
      </div>
      
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Notes for: {currentItem.title}</DialogTitle>
                <DialogDescription>
                    Add personal notes for this program item. They are saved locally on your device.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor="notes-textarea">Your Note</Label>
                <Textarea
                    id="notes-textarea"
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    rows={8}
                    placeholder="Type your notes here..."
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveNote}>Save Note</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewHymn} onOpenChange={(open) => !open && setPreviewHymn(null)}>
        <DialogContent className="sm:max-w-2xl h-[80vh] sm:h-auto sm:max-h-[85vh] flex flex-col">
          {previewHymn && (
            <>
              <DialogHeader>
                <DialogTitle>{previewHymn.titleEnglish || previewHymn.titleHiligaynon}</DialogTitle>
                <DialogDescription>
                  {previewHymn.pageNumber && `Page: ${previewHymn.pageNumber}`}
                  {previewHymn.pageNumber && previewHymn.keySignature && ` | `}
                  {previewHymn.keySignature && `Key: ${previewHymn.keySignature}`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full border rounded-md p-4">
                    <HymnMultiLanguageView hymn={previewHymn} />
                </ScrollArea>
              </div>
              <DialogFooter className="pt-4 flex-shrink-0">
                <Button variant="outline" className="w-full" onClick={() => setPreviewHymn(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewReading} onOpenChange={(open) => !open && setPreviewReading(null)}>
        <DialogContent className="sm:max-w-xl h-[80vh] sm:h-auto sm:max-h-[85vh] flex flex-col">
          {previewReading && (
            <>
              <DialogHeader>
                <DialogTitle>{previewReading.title}</DialogTitle>
                {previewReading.source && <DialogDescription>Source: {previewReading.source}</DialogDescription>}
              </DialogHeader>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full border rounded-md p-4">
                  <div className="space-y-4 text-lg text-foreground leading-relaxed">
                    {previewReading.lyrics.split('\n').map((line, index) => {
                        const speakerMatch = line.match(/^(Leader:|People:|All:)\s*/);
                        if (speakerMatch) {
                            const speaker = speakerMatch[1];
                            const text = line.substring(speaker.length).trim();
                            
                            if (!text) return null; 

                            if (speaker === 'People:' && previewReading.category === 'responsive-reading') {
                                return (
                                    <p key={index} className="font-bold text-foreground">
                                        {text}
                                    </p>
                                );
                            }
                            return <p key={index}>{text}</p>;

                        }
                        return <p key={index}>{line}</p>;
                    })}
                  </div>
                </ScrollArea>
              </div>
              <DialogFooter className="pt-4 flex-shrink-0">
                 <Button variant="outline" className="w-full" onClick={() => setPreviewReading(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
