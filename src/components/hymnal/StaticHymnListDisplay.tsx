
'use client';

import type { Hymn } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ExternalLink, Link2, Save, XCircle } from 'lucide-react';
import { useState } from 'react';
import { updateSampleHymn, initialSampleHymns } from '@/data/hymns'; // Import for updating in-memory fallback
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_HYMNS_KEY = 'graceNotesHymns';

interface StaticHymnListDisplayProps {
  hymns: Hymn[];
  onUrlUpdated: () => void; // Callback to notify parent of update
}

export default function StaticHymnListDisplay({ hymns, onUrlUpdated }: StaticHymnListDisplayProps) {
  const [editingHymnId, setEditingHymnId] = useState<string | null>(null);
  const [urlInputValue, setUrlInputValue] = useState('');
  const { toast } = useToast();

  const handleEditClick = (hymn: Hymn) => {
    setEditingHymnId(hymn.id);
    setUrlInputValue(hymn.externalUrl || '');
  };

  const handleCancelClick = () => {
    setEditingHymnId(null);
    setUrlInputValue('');
  };

  const handleSaveClick = (hymnId: string) => {
    // The 'hymns' prop is the current list, sourced from localStorage by the parent page.
    const hymnToUpdate = hymns.find(h => h.id === hymnId);
    if (!hymnToUpdate) {
      toast({ title: "Error", description: "Hymn not found for saving URL.", variant: "destructive" });
      return;
    }

    // Create a new array with the updated hymn based on the current list.
    // This ensures that only the specific hymn's externalUrl is modified.
    const updatedHymnsList = hymns.map(h =>
      h.id === hymnId ? { ...h, externalUrl: urlInputValue.trim() || undefined } : h
    );

    try {
      // Update localStorage with the new, complete list of hymns.
      // This saves the change persistently in the browser.
      localStorage.setItem(LOCAL_STORAGE_HYMNS_KEY, JSON.stringify(updatedHymnsList));
      
      // Also update in-memory initialSampleHymns.
      // This provides consistency if other parts of the app use initialSampleHymns
      // as a fallback or for initial data within the same session.
      updateSampleHymn(hymnId, { externalUrl: urlInputValue.trim() || undefined });

      toast({ title: "URL Saved", description: "The external URL has been updated for this hymn." });
      setEditingHymnId(null);
      setUrlInputValue('');
      onUrlUpdated(); // Notify parent to refresh its hymn list from localStorage
    } catch (error) {
      console.error("Error saving URL to localStorage:", error);
      toast({ title: "Storage Error", description: "Could not save URL.", variant: "destructive" });
    }
  };

  if (!hymns || hymns.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No hymns to display.</p>;
  }

  return (
    <div className="space-y-3">
      {hymns.map((hymn) => (
        <Card key={hymn.id} className="bg-card/80 shadow">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-lg font-medium text-primary/90">
              {hymn.titleHiligaynon ? hymn.titleHiligaynon.toUpperCase() : 'Untitled Hymn'}
            </CardTitle>
            {hymn.titleEnglish && hymn.titleEnglish !== hymn.titleHiligaynon && (
              <CardDescription className="text-sm text-muted-foreground">
                {hymn.titleEnglish}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="py-3 px-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              {hymn.pageNumber && (
                <span>Page: {hymn.pageNumber}</span>
              )}
            </div>
            
            {editingHymnId === hymn.id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                  <Input 
                    type="url"
                    placeholder="Enter URL (e.g., https://example.com)"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    className="h-8 text-xs flex-grow"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <Button variant="ghost" size="sm" onClick={handleCancelClick} className="text-xs">
                    <XCircle className="mr-1 h-3 w-3" /> Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSaveClick(hymn.id)} className="text-xs">
                    <Save className="mr-1 h-3 w-3" /> Save URL
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {hymn.externalUrl ? (
                  <div className="flex items-center justify-between gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <a 
                      href={hymn.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-accent hover:underline truncate flex-grow min-w-0"
                      title={hymn.externalUrl}
                    >
                      {hymn.externalUrl}
                    </a>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(hymn)} className="text-xs">
                      Edit URL
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground italic flex-grow">No URL assigned.</p>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(hymn)} className="text-xs">
                       Add URL
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
