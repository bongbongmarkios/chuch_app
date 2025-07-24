import { sampleReadings } from '@/data/readings';

export async function generateStaticParams() {
  return sampleReadings.map(reading => ({
    id: reading.id,
  }));
}

import ReadingPageClient from './ReadingPageClient';

export default async function ReadingPageServer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ReadingPageClient id={resolvedParams.id} />;
}
