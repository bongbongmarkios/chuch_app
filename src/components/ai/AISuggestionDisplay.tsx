// import { suggestRelatedContent, type SuggestRelatedContentOutput } from '@/ai/flows/suggest-related-content';
'use client';

import { useEffect, useState } from 'react';
import { useActivity } from '@/hooks/useActivityTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Wand2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { initialSampleHymns } from '@/data/hymns'; // Use initialSampleHymns
import { sampleReadings } from '@/data/readings';

// AI suggestions are unavailable in offline APK
export default function AISuggestionDisplay() {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>AI suggestions are unavailable in the offline APK version.</p>
    </div>
  );
}
