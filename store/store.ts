import { configureStore } from '@reduxjs/toolkit';
import noteReducer from './noteSlice';
import { persistReducer,
         persistStore,
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
//kept for posterity to consolidate reducer functions
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1
};


const persistedReducer = persistReducer(persistConfig, noteReducer);

export const store = configureStore({
  reducer: {
    notes: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;