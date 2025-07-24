
'use client';

import type { Hymn } from '@/types';
import { CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface HymnMultiLanguageViewProps {
  hymn: Hymn;
}

export default function HymnMultiLanguageView({ hymn }: HymnMultiLanguageViewProps) {
  const hasHiligaynon = hymn.titleHiligaynon && hymn.lyricsHiligaynon;
  const hasFilipino = hymn.titleFilipino && hymn.lyricsFilipino;
  const hasEnglish = hymn.titleEnglish && hymn.lyricsEnglish;
  const hasAnyContent = hasHiligaynon || hasFilipino || hasEnglish;

  return (
    <div className="space-y-6 pb-4"> {/* Added pb-4 for scroll area padding */}
      {hasHiligaynon && (
        <div>
          <CardTitle className="font-headline text-xl text-primary mb-1">{hymn.titleHiligaynon}</CardTitle>
          <p className="text-xs text-muted-foreground mb-2">Hiligaynon</p>
          <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
            {hymn.lyricsHiligaynon}
          </div>
        </div>
      )}

      {hasFilipino && (
        <>
          {hasHiligaynon && <Separator className="my-4" />}
          <div>
            <CardTitle className="font-headline text-xl text-primary mb-1">{hymn.titleFilipino}</CardTitle>
            <p className="text-xs text-muted-foreground mb-2">Filipino</p>
            <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
              {hymn.lyricsFilipino}
            </div>
          </div>
        </>
      )}

      {hasEnglish && (
         <>
          {(hasHiligaynon || hasFilipino) && <Separator className="my-4" />}
          <div>
            <CardTitle className="font-headline text-xl text-primary mb-1">{hymn.titleEnglish}</CardTitle>
            <p className="text-xs text-muted-foreground mb-2">English</p>
            <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
              {hymn.lyricsEnglish}
            </div>
          </div>
        </>
      )}
      
      {!hasAnyContent && (
        <p className="text-muted-foreground italic text-center py-4">No lyrics available in any language for this hymn.</p>
      )}
    </div>
  );
}
