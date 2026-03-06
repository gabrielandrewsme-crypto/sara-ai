import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Event, Transaction, Note, MindMap, ChatMessage, UserSettings, DiaryEntry, RoutineItem, Reminder } from '@/types/sara';
import { useAuth } from '@/contexts/AuthContext';

interface SaraContextType {
  // User
  user: UserSettings;
  setUser: (user: UserSettings) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Routine
  routineItems: RoutineItem[];
  addRoutineItem: (item: Omit<RoutineItem, 'id'>) => void;
  deleteRoutineItem: (id: string) => void;
  toggleRoutineItem: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Mind Maps
  mindMaps: MindMap[];
  addMindMap: (mindMap: Omit<MindMap, 'id' | 'createdAt'>) => void;
  updateMindMap: (id: string, mindMap: Partial<MindMap>) => void;
  deleteMindMap: (id: string) => void;
  
  // Diary
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDiaryEntry: (id: string, entry: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SaraContext = createContext<SaraContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultUser: UserSettings = {
  name: 'Usuário',
  theme: 'light',
  notifications: {
    tasks: true,
    events: true,
    financial: true,
  },
};

/** Returns a localStorage key namespaced by user ID so data is isolated per account */
const userKey = (userId: string | undefined, key: string) =>
  userId ? `sara_${userId}_${key}` : `sara_guest_${key}`;

const loadJson = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const SaraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const uid = authUser?.id;

  const [user, setUser] = useState<UserSettings>(defaultUser);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loaded, setLoaded] = useState(false);

  // Load data when auth user changes
  useEffect(() => {
    setUser(loadJson(userKey(uid, 'user'), defaultUser));
    setTasks(loadJson(userKey(uid, 'tasks'), []));
    setRoutineItems(loadJson(userKey(uid, 'routine'), []));
    setReminders(loadJson(userKey(uid, 'reminders'), []));
    setEvents(loadJson(userKey(uid, 'events'), []));
    setTransactions(loadJson(userKey(uid, 'transactions'), []));
    setNotes(loadJson(userKey(uid, 'notes'), []));
    setMindMaps(loadJson(userKey(uid, 'mindmaps'), []));
    setDiaryEntries(loadJson(userKey(uid, 'diary'), []));
    setChatMessages(loadJson(userKey(uid, 'chat'), []));
    const savedTheme = localStorage.getItem(userKey(uid, 'theme'));
    setTheme((savedTheme as 'light' | 'dark') || 'light');
    setLoaded(true);
  }, [uid]);

  // Persist to localStorage (only after initial load)
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'user'), JSON.stringify(user)); }, [user, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'tasks'), JSON.stringify(tasks)); }, [tasks, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'routine'), JSON.stringify(routineItems)); }, [routineItems, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'reminders'), JSON.stringify(reminders)); }, [reminders, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'events'), JSON.stringify(events)); }, [events, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'transactions'), JSON.stringify(transactions)); }, [transactions, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'notes'), JSON.stringify(notes)); }, [notes, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'mindmaps'), JSON.stringify(mindMaps)); }, [mindMaps, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'diary'), JSON.stringify(diaryEntries)); }, [diaryEntries, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'chat'), JSON.stringify(chatMessages)); }, [chatMessages, uid, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem(userKey(uid, 'theme'), theme); }, [theme, uid, loaded]);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Task functions
  const addTask = (task: Omit<Task, 'id'>) => setTasks(prev => [...prev, { ...task, id: generateId() }]);
  const updateTask = (id: string, task: Partial<Task>) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  // Routine functions
  const addRoutineItem = (item: Omit<RoutineItem, 'id'>) => setRoutineItems(prev => [...prev, { ...item, id: generateId() }]);
  const deleteRoutineItem = (id: string) => setRoutineItems(prev => prev.filter(r => r.id !== id));
  const toggleRoutineItem = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setRoutineItems(prev => prev.map(r => {
      if (r.id !== id) return r;
      const isCompletedToday = r.lastCompletedDate === today;
      return { ...r, completed: !isCompletedToday, lastCompletedDate: isCompletedToday ? undefined : today };
    }));
  };

  // Reminder functions
  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => setReminders(prev => [...prev, { ...reminder, id: generateId(), createdAt: new Date().toISOString() }]);
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));
  const toggleReminder = (id: string) => setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));

  // Event functions
  const addEvent = (event: Omit<Event, 'id'>) => setEvents(prev => [...prev, { ...event, id: generateId() }]);
  const updateEvent = (id: string, event: Partial<Event>) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => setTransactions(prev => [...prev, { ...transaction, id: generateId() }]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  // Note functions
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setNotes(prev => [...prev, { ...note, id: generateId(), createdAt: now, updatedAt: now }]);
  };
  const updateNote = (id: string, note: Partial<Note>) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n));
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  // Mind Map functions
  const addMindMap = (mindMap: Omit<MindMap, 'id' | 'createdAt'>) => setMindMaps(prev => [...prev, { ...mindMap, id: generateId(), createdAt: new Date().toISOString() }]);
  const updateMindMap = (id: string, mindMap: Partial<MindMap>) => setMindMaps(prev => prev.map(m => m.id === id ? { ...m, ...mindMap } : m));
  const deleteMindMap = (id: string) => setMindMaps(prev => prev.filter(m => m.id !== id));

  // Diary functions
  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setDiaryEntries(prev => [...prev, { ...entry, id: generateId(), createdAt: now, updatedAt: now }]);
  };
  const updateDiaryEntry = (id: string, entry: Partial<DiaryEntry>) => setDiaryEntries(prev => prev.map(d => d.id === id ? { ...d, ...entry, updatedAt: new Date().toISOString() } : d));
  const deleteDiaryEntry = (id: string) => setDiaryEntries(prev => prev.filter(d => d.id !== id));

  // Chat functions
  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => setChatMessages(prev => [...prev, { ...message, id: generateId(), timestamp: new Date().toISOString() }]);
  const clearChat = () => setChatMessages([]);

  return (
    <SaraContext.Provider value={{
      user, setUser,
      tasks, addTask, updateTask, deleteTask, toggleTask,
      routineItems, addRoutineItem, deleteRoutineItem, toggleRoutineItem,
      reminders, addReminder, deleteReminder, toggleReminder,
      events, addEvent, updateEvent, deleteEvent,
      transactions, addTransaction, deleteTransaction,
      notes, addNote, updateNote, deleteNote,
      mindMaps, addMindMap, updateMindMap, deleteMindMap,
      diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
      chatMessages, addChatMessage, clearChat,
      theme, toggleTheme,
    }}>
      {children}
    </SaraContext.Provider>
  );
};

export const useSara = () => {
  const context = useContext(SaraContext);
  if (!context) throw new Error('useSara must be used within SaraProvider');
  return context;
};
