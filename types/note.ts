// types/note.ts
export type RowType = 'text' | 'image' | 'checkbox' | 'bullet';

export interface NoteRow {
  id: string;
  type: RowType;
  content: string;
  imageUrl?: string;
  order: number;
}

// Base note interface without ID (for creation)
export interface BaseNote {
  title: string;
  rows: NoteRow[];
  createdAt?: string;
  updatedAt?: string;
}

// Frontend note (can have either id or _id)
export interface Note extends BaseNote {
  id: string;           // Frontend-generated ID or _id from backend
  _id?: string;         // MongoDB ID (if from backend)
  userId?: string;      // User association
  createdAt: string;
  updatedAt: string;
}

// Backend note (from API)
export interface ApiNote {
  _id: string;
  title: string;
  rows: NoteRow[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;    // Separate state for save operations
  error: string | null;
}

// API payload types
export interface CreateNotePayload {
  title: string;
  rows: NoteRow[];
}

export interface UpdateNotePayload {
  title?: string;
  rows?: NoteRow[];
}

// API response types
export interface NotesResponse {
  notes: ApiNote[];
}

export interface NoteResponse {
  note: ApiNote;
}

// Helper type to convert API note to frontend note
export type FrontendNote = Omit<ApiNote, '_id'> & { id: string };

// Utility function to convert API note to frontend format
export const apiNoteToFrontend = (apiNote: ApiNote): Note => ({
  id: apiNote._id, // Use _id as the primary id
  _id: apiNote._id,
  title: apiNote.title,
  rows: apiNote.rows,
  userId: apiNote.userId,
  createdAt: apiNote.createdAt,
  updatedAt: apiNote.updatedAt,
});

// Utility function to convert frontend note to API payload
export const frontendNoteToApi = (note: Note): CreateNotePayload => ({
  title: note.title,
  rows: note.rows,
});