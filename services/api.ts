// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiNote, CreateNotePayload, UpdateNotePayload } from '../types/note';

const API_BASE_URL = 'http://localhost:3001/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 sec timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// API DEBUGGING REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('🚨 API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Add TOKEN to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },
};

export const notesAPI = {
  getNotes: async (): Promise<ApiNote[]> => {
    const response = await api.get('/notes');
    return response.data;
  },
  createNote: async (note: CreateNotePayload): Promise<ApiNote> => {
    const response = await api.post('/notes', note);
    return response.data;
  },
  updateNote: async (id: string, updates: UpdateNotePayload): Promise<ApiNote> => {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  },
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

// ROUTE TO CHECK SERVER STATUS
export const healthCheck = async (): Promise<any> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;