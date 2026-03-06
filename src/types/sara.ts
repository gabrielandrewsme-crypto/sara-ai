export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  lastCompletedDate?: string; // tracks which day it was completed
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  completed: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

export interface MindMap {
  id: string;
  title: string;
  nodes: MindMapNode[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'sara';
  content: string;
  timestamp: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'awful';
  content: string;
  highlights?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    tasks: boolean;
    events: boolean;
    financial: boolean;
  };
}
