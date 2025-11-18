// store/noteSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note, NotesState, ApiNote, CreateNotePayload } from '../types/note';
import { notesAPI } from '../services/api';
import { apiNoteToFrontend } from '../types/note';

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNotes();
      // Convert API notes to frontend format
      return response.map((apiNote: ApiNote) => apiNoteToFrontend(apiNote));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData: CreateNotePayload, { rejectWithValue }) => {
    try {
      const response = await notesAPI.createNote(noteData);
      return apiNoteToFrontend(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create note');
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, updates }: { id: string; updates: Partial<Note> }, { rejectWithValue }) => {
    try {
      const { id: _, ...updatePayload } = updates; // Remove id from updates
      const response = await notesAPI.updateNote(id, updatePayload);
      return apiNoteToFrontend(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      await notesAPI.deleteNote(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optional: Local optimistic updates while syncing
    updateNoteOptimistically: (state, action: PayloadAction<{ id: string; updates: Partial<Note> }>) => {
      const { id, updates } = action.payload;
      const noteIndex = state.notes.findIndex(note => note.id === id || note._id === id);
      if (noteIndex !== -1) {
        state.notes[noteIndex] = {
          ...state.notes[noteIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      if (state.currentNote && (state.currentNote.id === id || state.currentNote._id === id)) {
        state.currentNote = {
          ...state.currentNote,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Note
      .addCase(createNote.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isSaving = false;
        state.notes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update Note
      .addCase(updateNote.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.notes.findIndex(note => 
          note.id === action.payload.id || note._id === action.payload._id
        );
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote && 
            (state.currentNote.id === action.payload.id || 
             state.currentNote._id === action.payload._id)) {
          state.currentNote = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Delete Note
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => 
          note.id !== action.payload && note._id !== action.payload
        );
        if (state.currentNote && 
            (state.currentNote.id === action.payload || 
             state.currentNote._id === action.payload)) {
          state.currentNote = null;
        }
      });
  },
});

export const { setCurrentNote, clearError, updateNoteOptimistically } = noteSlice.actions;
export default noteSlice.reducer;