export interface Hymn {
  id: string;
  pageNumber?: string; // Replaces old 'number'
  keySignature?: string;
  
  titleEnglish: string; 
  titleFilipino?: string;
  titleHiligaynon: string; // Now required
  
  lyricsEnglish: string; 
  lyricsFilipino?: string;
  lyricsHiligaynon: string; // Now required
  
  externalUrl?: string; // New field for external URL
}

export const programItemTitles = [
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
] as const;

export type ProgramItemTitle = typeof programItemTitles[number];

export interface ProgramItem {
  id: string; // Unique ID for the item within the program
  title: ProgramItemTitle;
  content?: string; // e.g., scripture text, prayer text, or reference to a hymn/reading ID
  hymnId?: string; // Optional: if item is a hymn, link to Hymn
  readingId?: string; // Optional: if item is a responsive reading, link to Reading
  notes?: string; // Optional notes for the program item
  usher?: string; // For offertory item
  specialNumber?: string; // For offertory item
}

export interface Program {
  id: string;
  title: string;
  date?: string; 
  items: ProgramItem[];
}

export type ReadingCategory = 'responsive-reading' | 'call-to-worship' | 'offertory-sentence';

export interface Reading {
  id: string;
  title: string;
  lyrics: string; 
  source?: string;
  category?: ReadingCategory;
  pageNumber?: string;
}

// For AI suggestions
export type UserActivity = {
  recentProgramItems: string[];
  recentHymns: string[]; // Will store the English title of the hymn
  recentReadings: string[];
};

// For Trashed Items
export type ItemType = 'hymn' | 'reading' | 'program'; // Added 'program'

export interface TrashedItemBase {
  originalId: string; // Original ID of the item
  itemType: ItemType;
  trashedAt: string; // ISO string date of when it was trashed
}

export interface TrashedHymn extends TrashedItemBase {
  itemType: 'hymn';
  data: Hymn;
}

export interface TrashedReading extends TrashedItemBase {
  itemType: 'reading';
  data: Reading;
}

export interface TrashedProgram extends TrashedItemBase { // New interface for trashed programs
  itemType: 'program';
  data: Program;
}

export type AnyTrashedItem = TrashedHymn | TrashedReading | TrashedProgram; // Added TrashedProgram

// For AI Chat
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string; // ISO 8601 format
}
