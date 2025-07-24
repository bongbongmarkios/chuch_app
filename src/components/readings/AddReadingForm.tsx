
'use client';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CardContent, CardFooter } from '@/components/ui/card'; // Only if needed for structure

interface AddReadingFormProps {
  onFormSubmit?: () => void;
  className?: string;
}

export default function AddReadingForm({ onFormSubmit, className }: AddReadingFormProps) {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [source, setSource] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !lyrics) {
      toast({
        title: "Error",
        description: "Title and Lyrics are required.",
        variant: "destructive",
      });
      return;
    }

    console.log('New Reading:', { title, lyrics, source });
    toast({
      title: "Reading Added (Simulated)",
      description: `"${title}" has been added (not actually saved).`,
    });

    // Reset form fields
    setTitle('');
    setLyrics('');
    setSource('');

    if (onFormSubmit) {
      onFormSubmit();
    }
    // No router.push here, dialog context handles closure
  };

  return (
    // No Card wrapper needed if it's directly in DialogContent
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6 pt-4"> {/* Use div for content if no CardContent */}
        <div className="space-y-2">
          <Label htmlFor="reading-title-dialog">Title</Label>
          <Input 
            id="reading-title-dialog" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., The Lord is My Shepherd" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reading-source-dialog">Source (Optional)</Label>
          <Input 
            id="reading-source-dialog" 
            value={source} 
            onChange={(e) => setSource(e.target.value)} 
            placeholder="e.g., Psalm 23" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reading-lyrics-dialog">Lyrics</Label>
          <Textarea 
            id="reading-lyrics-dialog" 
            value={lyrics} 
            onChange={(e) => setLyrics(e.target.value)} 
            placeholder="Enter reading lyrics here..." 
            rows={8} 
            required 
          />
        </div>
      </div>
      <div className="pt-6 flex justify-end"> {/* Use div for footer if no CardFooter */}
        <Button type="submit">Add Reading</Button>
      </div>
    </form>
  );
}
