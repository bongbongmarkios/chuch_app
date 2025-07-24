
import type { Program, ProgramItem } from '@/types';
import { programItemTitles } from '@/types';

let itemIdCounter = 0;

// This function is kept for seeding initial samplePrograms
const createProgramItems = (titles: ProgramItem['title'][]): ProgramItem[] => {
  return titles.map(title => ({
    id: `item-${itemIdCounter++}`,
    title: title,
  }));
};

export let samplePrograms: Program[] = [
  {
    id: '30001',
    title: 'Sunday Morning Worship - July 21, 2024',
    date: '2024-07-21',
    items: createProgramItems([
      "Doxology",
      "Call to Worship",
      "Opening Hymn",
      "Opening Prayer",
      "Responsive Reading",
      "Rice for Mission offering with children's choir",
      "Hymn of Preparation",
      "Scripture Reading",
      "Pastoral Prayer",
      "Choir",
      "Message",
      "Giving of tithes or pledges and offering to the lord",
      "Closing Hymn",
      "Prayer of Benediction"
    ]),
  }
];

// Function to add a new program to the in-memory sample data
export function addSampleProgram(
  programData: Omit<Program, 'id' | 'items'>,
  itemsToCreate: Omit<ProgramItem, 'id'>[] // New parameter signature for detailed items
): Program {
  let maxId = 30000; // Base for program IDs
  samplePrograms.forEach(program => {
    const idNum = parseInt(program.id, 10);
    if (!isNaN(idNum) && idNum >= 30000 && idNum < 40000) {
      if (idNum > maxId) {
        maxId = idNum;
      }
    }
  });
  const newId = (maxId + 1).toString();

  const newProgram: Program = {
    id: newId,
    ...programData,
    items: itemsToCreate.map(item => ({
      id: `item-${itemIdCounter++}`,
      ...item,
    })),
  };
  samplePrograms.unshift(newProgram);
  return newProgram;
}

// Function to "delete" a program by its ID from the in-memory sample data
// It now returns the deleted program object, or null if not found.
export function deleteSampleProgramById(programId: string): Program | null {
  const programIndex = samplePrograms.findIndex(p => p.id === programId);
  if (programIndex > -1) {
    const deletedProgram = samplePrograms.splice(programIndex, 1)[0];
    return deletedProgram;
  }
  return null; // Program not found
}
