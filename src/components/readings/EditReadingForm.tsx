
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Reading, ReadingCategory } from '@/types';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const readingCategories: ReadingCategory[] = ['responsive-reading', 'call-to-worship', 'offertory-sentence'];

interface EditReadingFormProps {
  readingToEdit: Reading;
  onEditSuccess: (updatedReading: Reading) => void;
  onCancel: () => void;
  className?: string;
}

export default function EditReadingForm({ readingToEdit, onEditSuccess, onCancel, className }: EditReadingFormProps) {
  const [title, setTitle] = useState(readingToEdit.title || '');
  const [source, setSource] = useState(readingToEdit.source || '');
  const [lyrics, setLyrics] = useState(readingToEdit.lyrics || '');
  const [category, setCategory] = useState<ReadingCategory>(readingToEdit.category || 'responsive-reading');
  const [pageNumber, setPageNumber] = useState(readingToEdit.pageNumber || '');
  const { toast } = useToast();

  useEffect(() => {
    setTitle(readingToEdit.title || '');
    setSource(readingToEdit.source || '');
    setLyrics(readingToEdit.lyrics || '');
    setCategory(readingToEdit.category || 'responsive-reading');
    setPageNumber(readingToEdit.pageNumber || '');
  }, [readingToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !lyrics.trim()) {
      toast({
        title: "Error",
        description: "Title and Lyrics are required.",
        variant: "destructive",
      });
      return;
    }

    const updatedReadingPartialData: Partial<Omit<Reading, 'id'>> = {
      title: title.trim(),
      source: source.trim() || undefined,
      lyrics: lyrics,
      category: category,
      pageNumber: pageNumber.trim() || undefined,
    };
    
    // The parent component will handle the actual update logic (in-memory and localStorage)
    // Here we just prepare the full data object to pass back up
    const updatedReadingFullData: Reading = {
      ...readingToEdit,
      ...updatedReadingPartialData,
    }

    if (updatedReadingFullData) {
      toast({
        title: "Reading Updated",
        description: `"${updatedReadingFullData.title}" has been updated.`,
        duration: 2000,
      });
      onEditSuccess(updatedReadingFullData);
    } else {
      toast({
        title: "Error",
        description: "Failed to update reading. Reading ID might not exist.",
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
              <Label htmlFor="edit-reading-title">Title</Label>
              <Input
                id="edit-reading-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reading Title"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-reading-source">Source (Optional)</Label>
                    <Input
                        id="edit-reading-source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g., Psalm 23"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-reading-page-number">Page Number (Optional)</Label>
                    <Input
                        id="edit-reading-page-number"
                        value={pageNumber}
                        onChange={(e) => setPageNumber(e.target.value)}
                        placeholder="e.g., 501"
                    />
                </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="edit-reading-category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ReadingCategory)}>
                <SelectTrigger id="edit-reading-category">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {readingCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reading-lyrics">Lyrics</Label>
              <Textarea
                id="edit-reading-lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Enter reading lyrics..."
                rows={8}
                required
              />
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
