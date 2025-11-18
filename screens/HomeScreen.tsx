// Main home screen
import React, { JSX, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createNote, fetchNotes } from '../store/noteSlice';
import { logout } from '../store/authSlice';
import { RootState } from '../store/store';
import { HomeScreenProps } from '../types/navigation';
import { Note } from '../types/note';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { notes, isLoading } = useSelector((state: RootState) => state.notes);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const handleAddNote = () => {
    const newNote = {
      title: 'New Note',
      rows: [{ 
        id: Date.now().toString(), 
        type: 'text' as const, 
        content: '', 
        order: 0 
      }],
    };
    dispatch(createNote(newNote)).then((action: any) => {
      if (action.payload) {
        navigation.navigate('EditNote', { noteId: action.payload._id });
      }
    });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate('EditNote', { noteId: item._id || item.id })}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteDate}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>

      <Button title="Add New Note" onPress={handleAddNote} />
      
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item: Note) => item._id || item.id}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});