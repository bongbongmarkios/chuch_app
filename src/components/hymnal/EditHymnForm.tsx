
'use client';
import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateSampleHymn, initialSampleHymns } from '@/data/hymns';
import type { Hymn } from '@/types';
import { CardContent, CardFooter } from '@/components/ui/card';

interface EditHymnFormProps {
  hymnToEdit: Hymn;
  onEditSuccess: (updatedHymn: Hymn) => void; 
  onCancel: () => void;
  className?: string;
}

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';

export default function EditHymnForm({ hymnToEdit, onEditSuccess, onCancel, className }: EditHymnFormProps) {
  const [pageNumber, setPageNumber] = useState(hymnToEdit.pageNumber || '');
  const [keySignature, setKeySignature] = useState(hymnToEdit.keySignature || '');
  
  const [titleEnglish, setTitleEnglish] = useState(hymnToEdit.titleEnglish || '');
  const [titleFilipino, setTitleFilipino] = useState(hymnToEdit.titleFilipino || '');
  const [titleHiligaynon, setTitleHiligaynon] = useState(hymnToEdit.titleHiligaynon || '');
  
  const [lyricsEnglish, setLyricsEnglish] = useState(hymnToEdit.lyricsEnglish || '');
  const [lyricsFilipino, setLyricsFilipino] = useState(hymnToEdit.lyricsFilipino || '');
  const [lyricsHiligaynon, setLyricsHiligaynon] = useState(hymnToEdit.lyricsHiligaynon || '');
  
  const { toast } = useToast();

  useEffect(() => {
    setPageNumber(hymnToEdit.pageNumber || '');
    setKeySignature(hymnToEdit.keySignature || '');
    setTitleEnglish(hymnToEdit.titleEnglish || '');
    setTitleFilipino(hymnToEdit.titleFilipino || '');
    setTitleHiligaynon(hymnToEdit.titleHiligaynon || '');
    setLyricsEnglish(hymnToEdit.lyricsEnglish || '');
    setLyricsFilipino(hymnToEdit.lyricsFilipino || '');
    setLyricsHiligaynon(hymnToEdit.lyricsHiligaynon || '');
  }, [hymnToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!titleHiligaynon.trim() || !lyricsHiligaynon.trim()) {
      toast({
        title: "Error",
        description: "Hiligaynon Title and Hiligaynon Lyrics are required and cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const updatedHymnPartialData: Partial<Omit<Hymn, 'id'>> = {
      titleHiligaynon: titleHiligaynon.trim(),
      titleFilipino: titleFilipino.trim() || undefined,
      titleEnglish: titleEnglish.trim() || titleHiligaynon.trim(), // Fallback to Hiligaynon
      
      lyricsHiligaynon: lyricsHiligaynon, // Preserve original spacing
      lyricsFilipino: titleFilipino.trim() ? lyricsFilipino : undefined, // Save lyrics (can be "") if title exists
      lyricsEnglish: lyricsEnglish, // Save as is (can be "")

      pageNumber: pageNumber.trim() || undefined,
      keySignature: keySignature.trim() || undefined,
      // externalUrl is not edited in this form, so it's not included in updatedHymnPartialData
      // updateSampleHymn will merge, preserving existing externalUrl
    };
    
    const updatedHymnFullData = updateSampleHymn(hymnToEdit.id, updatedHymnPartialData);

    if (updatedHymnFullData) {
      try {
        const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
        let allHymnsForStorage: Hymn[];

        if (storedHymnsString) {
          allHymnsForStorage = JSON.parse(storedHymnsString);
        } else {
          allHymnsForStorage = [...initialSampleHymns]; 
        }
        
        const hymnIndex = allHymnsForStorage.findIndex(h => h.id === updatedHymnFullData.id);
        if (hymnIndex > -1) {
          allHymnsForStorage[hymnIndex] = updatedHymnFullData;
        } else {
          // This case should ideally not happen in an edit form context if ID is valid
          allHymnsForStorage.push(updatedHymnFullData);
        }
        localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(allHymnsForStorage));
        
      } catch (error) {
        console.error("Error saving edited hymn to localStorage:", error);
        toast({
          title: 'Storage Error',
          description: 'Could not save edited hymn to local storage. Changes are for this session only.',
          variant: 'destructive',
        });
      }

      toast({
        title: "Hymn Updated",
        description: `"${updatedHymnFullData.titleEnglish || updatedHymnFullData.titleHiligaynon}" has been updated.`,
        duration: 1000, 
      });
      onEditSuccess(updatedHymnFullData); 
    } else {
      toast({
        title: "Error",
        description: "Failed to update hymn. Hymn ID might not exist.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${className || ''} flex flex-col`}>
      <CardContent className="pt-4 flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="space-y-6 pr-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-titleHiligaynon">Title (Hiligaynon)</Label>
              <Input 
                id="edit-titleHiligaynon" 
                value={titleHiligaynon} 
                onChange={(e) => setTitleHiligaynon(e.target.value.toUpperCase())} 
                placeholder="Hiligaynon Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-titleFilipino">Title (Filipino, Optional)</Label>
              <Input id="edit-titleFilipino" value={titleFilipino} onChange={(e) => setTitleFilipino(e.target.value)} placeholder="Filipino Title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-titleEnglish">Title (English, Optional)</Label>
              <Input id="edit-titleEnglish" value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} placeholder="English Title" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pageNumber">Page Number (Optional)</Label>
                <Input id="edit-pageNumber" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} placeholder="e.g., 123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-keySignature">Key Signature (Optional)</Label>
                <Input id="edit-keySignature" value={keySignature} onChange={(e) => setKeySignature(e.target.value)} placeholder="e.g., C Major" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-lyricsHiligaynon">Lyrics (Hiligaynon)</Label>
              <Textarea id="edit-lyricsHiligaynon" value={lyricsHiligaynon} onChange={(e) => setLyricsHiligaynon(e.target.value)} placeholder="Enter Hiligaynon lyrics..." rows={6} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lyricsFilipino">Lyrics (Filipino, Optional)</Label>
              <Textarea id="edit-lyricsFilipino" value={lyricsFilipino} onChange={(e) => setLyricsFilipino(e.target.value)} placeholder="Enter Filipino lyrics..." rows={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lyricsEnglish">Lyrics (English, Optional)</Label>
              <Textarea id="edit-lyricsEnglish" value={lyricsEnglish} onChange={(e) => setLyricsEnglish(e.target.value)} placeholder="Enter English lyrics..." rows={6} />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-6 flex-shrink-0 flex-col items-stretch gap-2">
        <Button type="submit" className="w-full">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </CardFooter>
    </form>
  );
}
