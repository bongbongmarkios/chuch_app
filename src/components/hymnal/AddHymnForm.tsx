
'use client';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addSampleHymn, initialSampleHymns } from '@/data/hymns'; 
import type { Hymn } from '@/types';
import { cn } from '@/lib/utils';

interface AddHymnFormProps {
  onFormSubmit?: () => void; 
  className?: string;       
}

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';

export default function AddHymnForm({ onFormSubmit, className }: AddHymnFormProps) {
  const [pageNumber, setPageNumber] = useState('');
  const [keySignature, setKeySignature] = useState('');
  
  const [titleEnglish, setTitleEnglish] = useState('');
  const [titleFilipino, setTitleFilipino] = useState('');
  const [titleHiligaynon, setTitleHiligaynon] = useState('');
  
  const [lyricsEnglish, setLyricsEnglish] = useState('');
  const [lyricsFilipino, setLyricsFilipino] = useState('');
  const [lyricsHiligaynon, setLyricsHiligaynon] = useState('');
  
  const { toast } = useToast();
  const router = useRouter();

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

    const newHymnData: Omit<Hymn, 'id'> = {
      titleHiligaynon: titleHiligaynon.trim(),
      titleFilipino: titleFilipino.trim() || undefined,
      titleEnglish: titleEnglish.trim() || titleHiligaynon.trim(), 
      
      lyricsHiligaynon: lyricsHiligaynon, 
      lyricsFilipino: titleFilipino.trim() ? lyricsFilipino : undefined, 
      lyricsEnglish: lyricsEnglish, 

      pageNumber: pageNumber.trim() || undefined,
      keySignature: keySignature.trim() || undefined,
      externalUrl: undefined, 
    };
    
    const addedHymn = addSampleHymn(newHymnData);

    try {
      const storedHymnsString = localStorage.getItem(LOCAL_STORAGE_HYMNS_KEY);
      let allHymnsForStorage: Hymn[];

      if (storedHymnsString) {
        try {
          allHymnsForStorage = JSON.parse(storedHymnsString);
          allHymnsForStorage = allHymnsForStorage.filter(h => h.id !== addedHymn.id);
          allHymnsForStorage.push(addedHymn);
        } catch (parseError) {
          console.error("Error parsing hymns from localStorage, re-initializing with current data:", parseError);
          allHymnsForStorage = [...initialSampleHymns]; 
        }
      } else {
        allHymnsForStorage = [...initialSampleHymns];
      }
      
      allHymnsForStorage.sort((a, b) => {
        const pageNumA = a.pageNumber ? parseInt(a.pageNumber, 10) : Infinity;
        const pageNumB = b.pageNumber ? parseInt(b.pageNumber, 10) : Infinity;
        if (isNaN(pageNumA) && isNaN(pageNumB)) return 0;
        if (isNaN(pageNumA)) return 1;
        if (isNaN(pageNumB)) return -1;
        return pageNumA - pageNumB;
      });

      localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(allHymnsForStorage));
      
    } catch (error) {
      console.error("Error saving hymn to localStorage:", error);
      toast({
        title: 'Storage Error',
        description: 'Could not save hymn to local storage. It is added for this session only.',
        variant: 'destructive',
      });
    }

    toast({
      title: "Hymn Added",
      description: `"${addedHymn.titleEnglish || addedHymn.titleHiligaynon}" has been added.`,
    });

    setTitleHiligaynon('');
    setTitleFilipino('');
    setTitleEnglish('');
    setPageNumber('');
    setKeySignature('');
    setLyricsHiligaynon('');
    setLyricsFilipino('');
    setLyricsEnglish('');

    if (onFormSubmit) {
      onFormSubmit(); 
    } else {
      router.push('/hymnal'); 
      router.refresh(); 
    }
  };

  const handleCancel = () => {
    setTitleHiligaynon('');
    setTitleFilipino('');
    setTitleEnglish('');
    setPageNumber('');
    setKeySignature('');
    setLyricsHiligaynon('');
    setLyricsFilipino('');
    setLyricsEnglish('');
    
    if (onFormSubmit) {
      onFormSubmit(); 
    } else {
      router.push('/hymnal'); 
    }
  };

  const isDialogMode = !!onFormSubmit;
  const idSuffix = isDialogMode ? 'dialog' : 'page';

  const FormWrapper = isDialogMode ? 'div' : Card;

  const formWrapperClasses = cn(
    isDialogMode 
      ? 'flex flex-col h-full' 
      : 'max-w-2xl mx-auto shadow-lg flex flex-col max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)]', 
    className 
  );

  const formClasses = cn(
    'flex flex-col flex-1 min-h-0' 
  );

  const cardHeaderClasses = cn(
    'flex-shrink-0' // Ensure header doesn't shrink
  );
  
  const cardContentClasses = cn(
    'pt-4 flex-1 min-h-0 overflow-hidden' 
  );

  const scrollAreaClasses = cn('h-full w-full');

  const cardFooterClasses = cn(
    'flex-shrink-0 flex flex-col items-stretch gap-2 pt-6'
  );

  return (
    <FormWrapper className={formWrapperClasses}>
      {!isDialogMode && (
        <CardHeader className={cardHeaderClasses}> 
          <CardTitle className="font-headline text-2xl">Add New Hymn</CardTitle>
          <CardDescription>Fill in the details for the new hymn. Hiligaynon title and lyrics are required.</CardDescription>
        </CardHeader>
      )}
      
      <form onSubmit={handleSubmit} className={formClasses}>
        <CardContent className={cardContentClasses}>
          <ScrollArea className={scrollAreaClasses}>
            <div className="space-y-6 pr-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor={`titleHiligaynon-${idSuffix}`}>Title (Hiligaynon)</Label>
                <Input 
                  id={`titleHiligaynon-${idSuffix}`} 
                  value={titleHiligaynon} 
                  onChange={(e) => setTitleHiligaynon(e.target.value.toUpperCase())} 
                  placeholder="Hiligaynon Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`titleFilipino-${idSuffix}`}>Title (Filipino, Optional)</Label>
                <Input id={`titleFilipino-${idSuffix}`} value={titleFilipino} onChange={(e) => setTitleFilipino(e.target.value)} placeholder="Filipino Title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`titleEnglish-${idSuffix}`}>Title (English, Optional)</Label>
                <Input id={`titleEnglish-${idSuffix}`} value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} placeholder="English Title" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`pageNumber-${idSuffix}`}>Page Number (Optional)</Label>
                  <Input id={`pageNumber-${idSuffix}`} value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} placeholder="e.g., 123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`keySignature-${idSuffix}`}>Key Signature (Optional)</Label>
                  <Input id={`keySignature-${idSuffix}`} value={keySignature} onChange={(e) => setKeySignature(e.target.value)} placeholder="e.g., C Major" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`lyricsHiligaynon-${idSuffix}`}>Lyrics (Hiligaynon)</Label>
                <Textarea id={`lyricsHiligaynon-${idSuffix}`} value={lyricsHiligaynon} onChange={(e) => setLyricsHiligaynon(e.target.value)} placeholder="Enter Hiligaynon lyrics..." rows={6} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lyricsFilipino-${idSuffix}`}>Lyrics (Filipino, Optional)</Label>
                <Textarea id={`lyricsFilipino-${idSuffix}`} value={lyricsFilipino} onChange={(e) => setLyricsFilipino(e.target.value)} placeholder="Enter Filipino lyrics..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lyricsEnglish-${idSuffix}`}>Lyrics (English, Optional)</Label>
                <Textarea id={`lyricsEnglish-${idSuffix}`} value={lyricsEnglish} onChange={(e) => setLyricsEnglish(e.target.value)} placeholder="Enter English lyrics..." rows={6} />
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className={cardFooterClasses}>
          <Button type="submit" className="w-full">Add Hymn</Button>
          <Button type="button" variant="outline" onClick={handleCancel} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </form>
    </FormWrapper>
  );
}
