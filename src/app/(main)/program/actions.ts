
// 'use server'; // Temporarily disabled for mobile build

import { revalidatePath } from 'next/cache';
import { addSampleProgram, deleteSampleProgramById, samplePrograms } from '@/data/programs';
import type { Program, ProgramItem, ProgramItemTitle } from '@/types';

export interface CreateProgramArgs {
  title: string;
  date: string; // Expected in YYYY-MM-DD format
  items: Omit<ProgramItem, 'id'>[]; // Array of detailed items, not just titles
}

export async function createNewProgramAction(args: CreateProgramArgs) {
  const newProgramData: Omit<Program, 'id' | 'items'> = {
    title: args.title,
    date: args.date,
  };

  let addedProgram: Program | null = null;
  try {
    // The items are now passed directly with their details from the form
    addedProgram = addSampleProgram(newProgramData, args.items);

  } catch (error) {
    console.error('Failed to create new program:', error);
    return { error: 'Failed to create program.' };
  }

  revalidatePath('/program');
  return { success: true, newProgram: addedProgram };
}

export async function deleteProgramAction(programId: string) {
  try {
    const deletedProgram = deleteSampleProgramById(programId);
    if (deletedProgram) {
      revalidatePath('/program');
      return { success: true, deletedProgram };
    }
    return { error: 'Program not found or already deleted.'}
  } catch (error) {
    console.error('Failed to delete program:', error);
    return { error: 'Failed to delete program.' };
  }
}
