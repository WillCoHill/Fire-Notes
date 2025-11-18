import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../hooks/redux'; // Use typed hooks
import { updateNote } from '../store/noteSlice';
import { EditNoteScreenProps } from '../types/navigation';
import { NoteRow, RowType } from '../types/note';
import NoteRowComponent from '../components/NoteRow';
import { ExportService } from '../services/exportService';
import debounce from 'lodash/debounce';

export default function EditNoteScreen({ route, navigation }: EditNoteScreenProps): JSX.Element {
  const { noteId } = route.params;
  const notes = useAppSelector((state) => state.notes.notes);
  const { isSaving, isLoading } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();
  
  const note = notes.find(n => n.id === noteId || n._id === noteId);
  const [title, setTitle] = useState<string>(note?.title || '');
  const [rows, setRows] = useState<NoteRow[]>(note?.rows || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // USER REFS FOR LATEST VALS
  const titleRef = useRef(title);
  const rowsRef = useRef(rows);
  const noteIdRef = useRef(noteId);

  // UPDATED REFS
  useEffect(() => {
    titleRef.current = title;
    rowsRef.current = rows;
    noteIdRef.current = noteId;
  }, [title, rows, noteId]);

  // AUTOSAVE FUNCTION
  const autoSave = useCallback(
    debounce(() => {
      const currentTitle = titleRef.current;
      const currentRows = rowsRef.current;
      const currentNoteId = noteIdRef.current;

      if (!currentNoteId) {
        console.log('No note ID available for auto-save');
        return;
      }

      console.log('Auto-saving note:', currentNoteId);
      
      dispatch(updateNote({
        id: currentNoteId,
        updates: { 
          title: currentTitle, 
          rows: currentRows,
          updatedAt: new Date().toISOString()
        }
      }))
        .unwrap()
        .then(() => {
          setHasUnsavedChanges(false);
          console.log('Auto-save successful');
        })
        .catch((error) => {
          console.error('Auto-save failed:', error);
          setHasUnsavedChanges(true);
          Alert.alert('Save Error', 'Failed to save note. Please check your connection.');
        });
    }, 1500),
    [dispatch]
  );

  const handleTitleChange = (text: string) => {
    setTitle(text);
    setHasUnsavedChanges(true);
    autoSave();
  };

  const handleRowsChange = (newRows: NoteRow[]) => {
    setRows(newRows);
    setHasUnsavedChanges(true);
    autoSave();
  };

  const addRow = (type: RowType): void => {
    const newRow: NoteRow = {
      id: Date.now().toString(),
      type,
      content: type === 'checkbox' ? 'unchecked' : '',
      order: rows.length,
    };
    handleRowsChange([...rows, newRow]);
  };

  const updateRow = (rowId: string, content: string): void => {
    const updatedRows = rows.map(row => 
      row.id === rowId ? { ...row, content } : row
    );
    handleRowsChange(updatedRows);
  };

  const removeRow = (rowId: string): void => {
    const updatedRows = rows.filter(row => row.id !== rowId);
    handleRowsChange(updatedRows);
  };

  const duplicateRow = (rowId: string): void => {
    const rowToDuplicate = rows.find(row => row.id === rowId);
    if (!rowToDuplicate) return;

    const newRow: NoteRow = {
      id: Date.now().toString(),
      type: rowToDuplicate.type,
      content: rowToDuplicate.content,
      order: rows.length,
    };

    const rowIndex = rows.findIndex(row => row.id === rowId);
    const updatedRows = [
      ...rows.slice(0, rowIndex + 1),
      newRow,
      ...rows.slice(rowIndex + 1)
    ];

    const rowsWithUpdatedOrder = updatedRows.map((row, index) => ({
      ...row,
      order: index
    }));

    handleRowsChange(rowsWithUpdatedOrder);
  };

  const handleExportTxt = async (): Promise<void> => {
    if (!note) {
      Alert.alert('Error', 'No note found to export');
      return;
    }

    const currentNote = {
      ...note,
      title,
      rows,
      updatedAt: new Date().toISOString(),
    };

    await ExportService.exportNoteAsTxt(currentNote);
  };

  const handleExportMarkdown = async (): Promise<void> => {
    if (!note) {
      Alert.alert('Error', 'No note found to export');
      return;
    }

    const currentNote = {
      ...note,
      title,
      rows,
      updatedAt: new Date().toISOString(),
    };

    await ExportService.exportNoteAsMarkdown(currentNote);
  };

  const showExportOptions = (): void => {
    Alert.alert(
      'Export Note',
      'Choose export format:',
      [
        {
          text: 'Text File (.txt)',
          onPress: handleExportTxt,
        },
        {
          text: 'Markdown (.md)',
          onPress: handleExportMarkdown,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const forceSave = useCallback(() => {
    if (hasUnsavedChanges) {
      autoSave.flush();
    }
  }, [hasUnsavedChanges, autoSave]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      forceSave();
    });

    return unsubscribe;
  }, [navigation, forceSave]);

  useEffect(() => {
    let headerTitle = `${title || 'New Note'}`;
    
    if (hasUnsavedChanges) {
      headerTitle += ' •';
    }
    
    if (isSaving) {
      headerTitle += ' (Saving...)';
    }

    navigation.setOptions({
      title: headerTitle,
      headerRight: () => (
        <View style={styles.headerButtons}>
          {isSaving && <ActivityIndicator size="small" color="#007AFF" style={styles.savingIndicator} />}
          <TouchableOpacity onPress={showExportOptions} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={forceSave} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>💾</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [title, hasUnsavedChanges, isSaving, navigation, forceSave]);

  useEffect(() => {
    return () => {
      autoSave.cancel();
    };
  }, [autoSave]);

  if (isLoading && !note) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading note...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="Note Title"
        placeholderTextColor="#999"
      />
      
      <FlatList
        data={rows}
        renderItem={({ item }) => (
          <NoteRowComponent
            row={item}
            onUpdate={(content: string) => updateRow(item.id, content)}
            onRemove={() => removeRow(item.id)}
            onDuplicate={() => duplicateRow(item.id)}
          />
        )}
        keyExtractor={(item: NoteRow) => item.id}
        style={styles.list}
        contentContainerStyle={rows.length === 0 ? styles.emptyList : undefined}
      />

      {rows.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No content yet. Add some rows below!</Text>
        </View>
      )}

      <View style={styles.addButtons}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addRow('text')}
        >
          <Text style={styles.addButtonText}>📝 Text</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addRow('image')}
        >
          <Text style={styles.addButtonText}>🖼️ Image</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addRow('checkbox')}
        >
          <Text style={styles.addButtonText}>☑️ Checkbox</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.addButton, styles.exportButton]}
          onPress={showExportOptions}
        >
          <Text style={styles.addButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        {hasUnsavedChanges && !isSaving && (
          <Text style={styles.unsavedText}>Unsaved changes</Text>
        )}
        {isSaving && (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}
        {!hasUnsavedChanges && !isSaving && (
          <Text style={styles.savedText}>All changes saved</Text>
        )}
      </View>
    </View>
  );
}

// STYLE REDUNDANCY
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingIndicator: {
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 18,
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  addButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    marginBottom: 8,
  },
  exportButton: {
    backgroundColor: '#34C759',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  statusBar: {
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
  },
  unsavedText: {
    color: '#FF9500',
    fontSize: 14,
  },
  savedText: {
    color: '#34C759',
    fontSize: 14,
  },
});