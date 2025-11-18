import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp, CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// MAIN STACK PARAMS
export type RootStackParamList = {
  // AUTH FLOW
  Login: undefined;
  Register: undefined;
  
  // MAIN APP FLOW
  Main: undefined; // TAB
  Home: undefined;
  EditNote: { 
    noteId: string;
    // ADD MORE ROUTE PARAMS HERE
    isNew?: boolean;
  };
  
  // MODALS SECTION
  Settings: undefined;
  Profile: undefined;
};

// NAV
export type MainTabParamList = {
  Notes: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// PROPS FOR EACH SCREEN W/ TYPING
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type EditNoteScreenProps = NativeStackScreenProps<RootStackParamList, 'EditNote'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// ROUTE PROPS FOR ROUTE (NO NAV)
export type EditNoteRouteProp = RouteProp<RootStackParamList, 'EditNote'>;

// HELPERS FOR NAV + ROUTE
export type RootStackNavigationProp<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>['navigation'];

export type RootStackRouteProp<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>['route'];

// UTILITY TYPE FOR COMPONENT THAT TAKES NAV + ROUTE AS PROPS
export type RootStackComponentProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// 'useNavigation' HOOK TYPE
import { StackNavigationProp } from '@react-navigation/stack';
export type RootStackNavigation = StackNavigationProp<RootStackParamList>;

// 'useRoute' HOOK TYPE
export type RootStackRoute<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

// ROUTE SAFE HOOKS : NAV + ROUTE
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}