// Main home screen
import React, { JSX } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addNote } from '../store/noteSlice';
import { RootState } from '../store/store';
import { HomeScreenProps } from '../types/navigation';
import { Note } from '../types/note';

export default function HomeScreen({ navigation }: HomeScreenProps): JSX.Element {
  const notes = useSelector((state: RootState) => state.notes.notes);
  const dispatch = useDispatch();

  const handleAddNote = (): void => {
    const newNoteId = notes.length.toString(); 
    const newNote = {
      id: newNoteId,
      title: 'New Note',
      rows: [{ 
        id: Date.now().toString(), 
        type: 'text' as const, 
        content: '', 
        order: 0 
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addNote(newNote));
    navigation.navigate('EditNote', { noteId: newNoteId });
  };

  const renderNoteItem = ({ item }: { item: Note }): JSX.Element => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate('EditNote', { noteId: item.id })}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteDate}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button title="Add New Note" onPress={handleAddNote} />
      
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item: Note) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  list: {
    marginTop: 16,
  },
});