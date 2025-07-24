'use client';
import type { Reading } from '@/types';
import { useEffect, useState } from 'react';
import { useActivity } from '@/hooks/useActivityTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ReadingDetailProps {
  reading: Reading;
  fontSizeClass: string;
}

export default function ReadingDetail({ reading, fontSizeClass }: ReadingDetailProps) {
  const { addReadingView } = useActivity();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    addReadingView(reading.title);
  }, [addReadingView, reading.title, reading.id]);

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">{reading.title}</CardTitle>
            {(reading.source || reading.pageNumber) && (
                <CardDescription className="text-md text-muted-foreground pt-2">
                    {reading.source && `Source: ${reading.source}`}
                    {reading.source && reading.pageNumber && ` | `}
                    {reading.pageNumber && `Page: ${reading.pageNumber}`}
                </CardDescription>
            )}
        </CardHeader>
        <Separator className="my-2"/>
        <CardContent className="pt-4">
            <div className={cn("space-y-1 text-foreground leading-relaxed", fontSizeClass)}>
              {reading.lyrics.split('\n').map((line, index) => {
                const speakerMatch = line.match(/^(Leader:|People:|All:)\s*/);
                if (speakerMatch) {
                  const speaker = speakerMatch[1];
                  const text = line.substring(speaker.length).trim();
                  if (!text) return null;
                  const isActive = activeIndex === index;
                  const isPeople = speaker === 'People:' && reading.category === 'responsive-reading';
                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center group cursor-pointer rounded transition-colors',
                        isActive ? 'bg-primary/10' : 'hover:bg-muted/50',
                        'px-1 -mx-1'
                      )}
                      tabIndex={0}
                      role="button"
                      aria-label={`Mark as reading: ${text}`}
                      onClick={() => setActiveIndex(index)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveIndex(index); }}
                    >
                      <span className={cn('w-5 flex-shrink-0 text-primary transition-opacity', isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50')}>▶</span>
                      <span className={cn('flex-1', isPeople ? 'font-bold' : undefined)}>{text}</span>
                    </div>
                  );
                }
                // For lines that don't have a speaker tag (like empty lines for spacing)
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center group cursor-pointer rounded transition-colors',
                      activeIndex === index ? 'bg-primary/10' : 'hover:bg-muted/50',
                      'px-1 -mx-1'
                    )}
                    tabIndex={0}
                    role="button"
                    aria-label={`Mark as reading: ${line}`}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveIndex(index); }}
                  >
                    <span className={cn('w-5 flex-shrink-0 text-primary transition-opacity', activeIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-50')}>▶</span>
                    <span className="flex-1">{line}</span>
                  </div>
                );
              })}
            </div>
        </CardContent>
    </Card>
  );
}
