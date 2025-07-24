import { samplePrograms } from '@/data/programs';

export async function generateStaticParams() {
  return samplePrograms.map(program => ({
    id: program.id,
  }));
}

import ProgramPageClient from './ProgramPageClient';

export default async function ProgramPageServer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProgramPageClient id={resolvedParams.id} />;
}
