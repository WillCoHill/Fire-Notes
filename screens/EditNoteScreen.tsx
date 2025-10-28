import React, { useState, useEffect, useCallback, JSX } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateNote } from '../store/noteSlice';
import { RootState } from '../store/store';
import { EditNoteScreenProps } from '../types/navigation';
import { NoteRow, RowType } from '../types/note';
import NoteRowComponent from '../components/NoteRow';
import debounce from 'lodash/debounce';

export default function EditNoteScreen({ route, navigation }: EditNoteScreenProps): JSX.Element {
  const { noteId } = route.params;
  const notes = useSelector((state: RootState) => state.notes.notes);
  const dispatch = useDispatch();
  
  const note = notes.find(n => n.id === noteId);
  const [title, setTitle] = useState<string>(note?.title || '');
  const [rows, setRows] = useState<NoteRow[]>(note?.rows || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Auto-save function with debouncing
  const autoSave = useCallback(
    debounce((currentTitle: string, currentRows: NoteRow[]) => {
      if (!noteId) return;
      
      dispatch(updateNote({
        id: noteId,
        updates: { title: currentTitle, rows: currentRows }
      }));
      
      setHasUnsavedChanges(false);
      console.log('Auto-saved note:', currentTitle);
    }, 1000), // Wait 1 second after last change made
    [noteId, dispatch]
  );

  // Update title and trigger auto-save
  const handleTitleChange = (text: string) => {
    setTitle(text);
    setHasUnsavedChanges(true);
  };

  // Update rows & trigger auto-save
  const handleRowsChange = (newRows: NoteRow[]) => {
    setRows(newRows);
    setHasUnsavedChanges(true);
  };

  // ROW CRUD
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

  // NEW FEATURE 10/26: Duplicate a row (BELOW current row)
  const duplicateRow = (rowId: string): void => {
    const rowToDuplicate = rows.find(row => row.id === rowId);
    if (!rowToDuplicate) return;

    const newRow: NoteRow = {
      id: Date.now().toString(),
      type: rowToDuplicate.type,
      content: rowToDuplicate.content,
      order: rows.length, // This will make it at the end, for now
    };

    // Search for the index of the row to duplicate
    const rowIndex = rows.findIndex(row => row.id === rowId);
    
    // Insert the new row right below the duplicated row
    const updatedRows = [
      ...rows.slice(0, rowIndex + 1),
      newRow,
      ...rows.slice(rowIndex + 1)
    ];

    // Update new order for all rows
    const rowsWithUpdatedOrder = updatedRows.map((row, index) => ({
      ...row,
      order: index
    }));

    handleRowsChange(rowsWithUpdatedOrder);
  };

  // Save right when component unmounts
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges) {
        autoSave.flush(); // <<<<< Force immediate save
      }
    };
  }, [hasUnsavedChanges, autoSave]);

  // Auto-save when either TITLE or ROWS has change
  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSave(title, rows);
    }

    // Debounce will be cleaned up ON UNMOUNT
    return () => {
      autoSave.cancel();
    };
  }, [title, rows, hasUnsavedChanges, autoSave]);

  // Update for title with unsaved changes indicate
  useEffect(() => {
    navigation.setOptions({
      title: `${title || 'New Note'}${hasUnsavedChanges ? ' •' : ''}`,
    });
  }, [title, hasUnsavedChanges, navigation]);

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
      />

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
      </View>

      {hasUnsavedChanges && (
        <View style={styles.saveIndicator}>
          <Text style={styles.saveIndicatorText}>Saving...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  addButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveIndicator: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  saveIndicatorText: {
    color: 'white',
    fontSize: 12,
  },
});