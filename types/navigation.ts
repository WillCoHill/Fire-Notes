// types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  EditNote: { noteId: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type EditNoteScreenProps = NativeStackScreenProps<RootStackParamList, 'EditNote'>;