'use client';

import type { Hymn } from '@/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

type LanguageOption = 'hiligaynon' | 'filipino' | 'english';

interface HymnMultiLanguageDialogProps {
  hymn: Hymn;
  selectedLanguage: LanguageOption;
  onSelectLanguage: (language: LanguageOption) => void;
}

const languageOptions: { value: LanguageOption; label: string }[] = [
  { value: 'hiligaynon', label: 'Hiligaynon' },
  { value: 'filipino', label: 'Filipino' },
  { value: 'english', label: 'English' },
];

const languageIsAvailable = (lang: LanguageOption, hymn: Hymn): boolean => {
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

export default function HymnMultiLanguageDialog({ hymn, selectedLanguage, onSelectLanguage }: HymnMultiLanguageDialogProps) {
  if (!hymn.pageNumber) { // Only show if page number exists
    return null;
  }

  const availableLanguages = languageOptions.filter(option => languageIsAvailable(option.value, hymn));
  
  if (availableLanguages.length <= 1) {
    return null; // Don't show if only one language is available
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Select language"
          className="hover:bg-transparent active:bg-transparent focus:bg-transparent"
        >
          <Globe className="h-8 w-8 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {availableLanguages.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelectLanguage(option.value)}
            className={selectedLanguage === option.value ? "bg-primary text-primary-foreground" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
