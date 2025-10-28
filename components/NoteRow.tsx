// components/NoteRow.tsx
import React, { JSX, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NoteRow as NoteRowType } from '../types/note';

interface NoteRowProps {
  row: NoteRowType;
  onUpdate: (content: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export default function NoteRowComponent({ row, onUpdate, onRemove, onDuplicate }: NoteRowProps): JSX.Element {
  const [content, setContent] = useState<string>(row.content || '');

  useEffect(() => {
    setContent(row.content || '');
  }, [row.content]);

  const handleTextChange = (text: string): void => {
    setContent(text);
    onUpdate(text);
  };

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setContent(imageUri);
      onUpdate(imageUri);
    }
  };

  const takePhoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setContent(imageUri);
      onUpdate(imageUri);
    }
  };

  const toggleCheckbox = (): void => {
    const newContent = content === 'checked' ? 'unchecked' : 'checked';
    setContent(newContent);
    onUpdate(newContent);
  };

  //Artifact from before row duplication implemented
  const renderTextRowActions = () => (
    <View style={styles.rowActions}>
      <TouchableOpacity onPress={onDuplicate} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📋</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  // Action buttons for other row types
  const renderDefaultActions = () => (
  <View style={styles.rowActions}>
    <TouchableOpacity onPress={onDuplicate} style={styles.actionButton}>
      <Text style={styles.actionButtonText}>📋</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
      <Text style={styles.actionButtonText}>🗑️</Text>
    </TouchableOpacity>
  </View>
);

  if (row.type === 'text') {
    return (
      <View style={styles.rowContainer}>
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={handleTextChange}
          placeholder="Enter text..."
          multiline
          placeholderTextColor="#999"
        />
        {renderDefaultActions()}
      </View>
    );
  }

  if (row.type === 'image') {
    return (
      <View style={styles.rowContainer}>
        {content ? (
          <Image source={{ uri: content }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
        
        <View style={styles.imageButtons}>
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>📁 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>📷 Camera</Text>
          </TouchableOpacity>
        </View>
        
        {renderDefaultActions()}
      </View>
    );
  }

  if (row.type === 'checkbox') {
    return (
      <View style={styles.rowContainer}>
        <TouchableOpacity 
          style={[
            styles.checkbox,
            content === 'checked' ? styles.checkboxChecked : styles.checkboxUnchecked
          ]}
          onPress={toggleCheckbox}
        >
          <Text style={styles.checkboxText}>
            {content === 'checked' ? '✓' : ''}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={content === 'checked' || content === 'unchecked' ? '' : content}
          onChangeText={handleTextChange}
          placeholder="Checkbox item..."
          placeholderTextColor="#999"
        />
        {renderDefaultActions()}
      </View>
    );
  }

  // Bullet point type
  return (
    <View style={styles.rowContainer}>
      <Text style={styles.bulletPoint}>•</Text>
      <TextInput
        style={styles.textInput}
        value={content}
        onChangeText={handleTextChange}
        placeholder="Bullet point..."
        multiline
        placeholderTextColor="#999"
      />
      {renderDefaultActions()}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    padding: 8,
    marginRight: 8,
    fontSize: 16,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#999',
  },
  imageButtons: {
    flex: 1,
    marginLeft: 12,
  },
  imageButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#ff3b30',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxUnchecked: {
    backgroundColor: 'white',
    borderColor: '#ccc',
  },
  checkboxText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bulletPoint: {
    fontSize: 18,
    marginRight: 8,
    color: '#333',
  },
});