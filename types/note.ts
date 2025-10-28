export type RowType = 'text' | 'image' | 'checkbox' | 'bullet';

export interface NoteRow {
  id: string;
  type: RowType;
  content: string;
  imageUrl?: string;
  order: number;
}

export interface Note {
  id: string;
  title: string;
  rows: NoteRow[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
}