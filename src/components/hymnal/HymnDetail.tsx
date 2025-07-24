'use client';
import type { Hymn } from '@/types';
import { useEffect, useState } from 'react';
import { useActivity } from '@/hooks/useActivityTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Pencil } from 'lucide-react';

type LanguageOption = 'hiligaynon' | 'filipino' | 'english';

interface HymnDetailProps {
  hymn: Hymn;
  selectedLanguage: LanguageOption;
  showLanguageSelector: boolean;
  onSelectLanguage: (language: LanguageOption) => void;
  playerControls?: React.ReactNode;
  lyricsFontSize?: number;
}

// Determines if a language option should be shown in the selector.
// Based only on the existence of the title for that language.
const languageIsActuallyAvailableForSelection = (lang: LanguageOption, hymn: Hymn): boolean => {
  switch (lang) {
    case 'hiligaynon':
      return !!hymn.titleHiligaynon;
    case 'filipino':
      return !!hymn.titleFilipino;
    case 'english':
      return !!hymn.titleEnglish;
    default:
      return false;
  }
};

const LYRICS_UNAVAILABLE_FILIPINO = "Lyrics unavailable for Filipino.";
const LYRICS_UNAVAILABLE_GENERIC = "Lyrics unavailable in this language.";

// Gets lyrics for the selected language. Prioritizes specific language lyrics (even if empty string).
// Falls back only if specific lyrics are undefined (e.g., optional Filipino not provided).
const getLyricsForLanguage = (lang: LanguageOption, hymn: Hymn): string => {
  switch (lang) {
    case 'hiligaynon':
      // Hiligaynon lyrics are a required string, can be ""
      return hymn.lyricsHiligaynon;
    case 'filipino':
      // If Filipino lyrics exist (even as ""), use them.
      if (hymn.lyricsFilipino !== undefined) {
        return hymn.lyricsFilipino;
      }
      // Fallback for Filipino if its specific lyrics are undefined:
      // Prefer non-empty fallbacks.
      if (hymn.lyricsHiligaynon && hymn.lyricsHiligaynon.trim() !== "") return hymn.lyricsHiligaynon;
      if (hymn.lyricsEnglish && hymn.lyricsEnglish.trim() !== "") return hymn.lyricsEnglish;
      return LYRICS_UNAVAILABLE_FILIPINO;
    case 'english':
      // English lyrics are a required string, can be ""
      return hymn.lyricsEnglish;
    default:
      // Should not happen with LanguageOption type. Generic fallback.
      if (hymn.lyricsHiligaynon && hymn.lyricsHiligaynon.trim() !== "") return hymn.lyricsHiligaynon;
      if (hymn.lyricsEnglish && hymn.lyricsEnglish.trim() !== "") return hymn.lyricsEnglish;
      return LYRICS_UNAVAILABLE_GENERIC;
  }
};


const getTitleForLanguage = (lang: LanguageOption, hymn: Hymn): string => {
  let title: string | undefined;
  switch (lang) {
    case 'hiligaynon':
      title = hymn.titleHiligaynon;
      break;
    case 'filipino':
      title = hymn.titleFilipino;
      break;
    case 'english':
      title = hymn.titleEnglish;
      break;
  }
  // Fallback title display
  return title || hymn.titleHiligaynon || hymn.titleEnglish || "Hymn Title Unavailable";
};

const languageOptions: { value: LanguageOption; label: string }[] = [
    { value: 'hiligaynon', label: 'Hiligaynon' },
    { value: 'filipino', label: 'Filipino' },
    { value: 'english', label: 'English' },
  ];

export default function HymnDetail({ hymn, selectedLanguage, showLanguageSelector, onSelectLanguage, playerControls, lyricsFontSize = 20 }: HymnDetailProps) {
  const { addHymnView } = useActivity();

  useEffect(() => {
    const trackingTitle = hymn.titleEnglish || hymn.titleHiligaynon;
    if (trackingTitle) {
      addHymnView(trackingTitle);
    }
  }, [addHymnView, hymn.titleEnglish, hymn.titleHiligaynon, hymn.id]);

  const currentTitle = getTitleForLanguage(selectedLanguage, hymn);
  const displayLyrics = getLyricsForLanguage(selectedLanguage, hymn);
  
  const unavailableMessages = [LYRICS_UNAVAILABLE_FILIPINO, LYRICS_UNAVAILABLE_GENERIC];
  const showNoLyricsMessage = unavailableMessages.includes(displayLyrics);

  return (
    <Card className="shadow-lg">
      <CardHeader className="relative">
        <div className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">
            {currentTitle.toUpperCase()}
          </CardTitle>
          {selectedLanguage !== 'hiligaynon' && hymn.titleHiligaynon && hymn.titleHiligaynon.toUpperCase() !== currentTitle.toUpperCase() && (
             <p className="text-md text-muted-foreground">{hymn.titleHiligaynon.toUpperCase()}</p>
          )}
          {selectedLanguage !== 'filipino' && hymn.titleFilipino && hymn.titleFilipino.toUpperCase() !== currentTitle.toUpperCase() && (
            <p className="text-md text-muted-foreground">{hymn.titleFilipino.toUpperCase()}</p>
          )}
          {selectedLanguage !== 'english' && hymn.titleEnglish && hymn.titleEnglish.toUpperCase() !== currentTitle.toUpperCase() && (
            <p className="text-md text-muted-foreground">{hymn.titleEnglish}</p>
          )}
        </div>

        <div className="mt-3 text-md text-muted-foreground space-y-1 text-center">
            {hymn.keySignature && <p>Key: {hymn.keySignature}</p>}
            {hymn.pageNumber && <p>Page: {hymn.pageNumber}</p>}
        </div>

        {playerControls && (
          <div className="mt-4 flex justify-center">
            {playerControls}
          </div>
        )}

        {showLanguageSelector && (
          <div className="flex items-center justify-center gap-2 py-3 border-y my-3">
            {languageOptions.map((option) => {
              const isSelectable = languageIsActuallyAvailableForSelection(option.value, hymn);
              if (!isSelectable) return null; 

              return (
                <Button
                  key={option.value}
                  variant={selectedLanguage === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectLanguage(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>
      <Separator className="my-2"/>
      <CardContent className="pt-4 space-y-6">
        {showNoLyricsMessage ? (
           <p className="text-muted-foreground italic text-center py-4">{displayLyrics}</p>
        ) : (
          <div>
            <div className="whitespace-pre-line text-foreground leading-relaxed" style={{ fontSize: lyricsFontSize }}>
              {displayLyrics} {/* This will show "" if lyrics are intentionally blank */}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
