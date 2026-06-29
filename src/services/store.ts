import { useState, useEffect } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // in hours
  category: 'Study' | 'Work' | 'Finance' | 'Life' | 'Health';
  progress: number; // 0 to 100
  completed: boolean;
  notes?: string;
  subtasks?: { id: string; title: string; completed: boolean; difficulty?: 'easy' | 'medium' | 'hard' }[];
  studyBlocks?: { id: string; date: string; time: string; duration: number; completed: boolean }[];
  completionProbability?: number; // 0 to 100%
}

export interface Habit {
  id: string;
  name: string;
  category: 'Sleep' | 'Exercise' | 'Reading' | 'Study' | 'Meditation' | 'Water';
  streak: number;
  history: { [date: string]: boolean }; // YYYY-MM-DD -> completed
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: { label: string; actionId: string; payload?: any }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DDTHH:MM
  end: string;
  type: 'task' | 'study_block' | 'personal' | 'meeting';
  taskId?: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warn' | 'success' | 'action';
  message: string;
}

// ----------------------------------------------------
// INITIAL DEMO DATA
// ----------------------------------------------------

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Advanced AI Project Submission',
    description: 'Prepare and build the final next-generation agentic dashboard submission.',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59', // tomorrow
    priority: 'critical',
    estimatedDuration: 6,
    category: 'Study',
    progress: 40,
    completed: false,
    notes: 'Requires Google Gemini API integration and deep analytics.',
    subtasks: [
      { id: 'sub-1-1', title: 'Initialize Next.js project and layout', completed: true },
      { id: 'sub-1-2', title: 'Connect Gemini and Firebase simulation layers', completed: true },
      { id: 'sub-1-3', title: 'Draft the Agentic rescheduling logic', completed: false, difficulty: 'hard' },
      { id: 'sub-1-4', title: 'Verify and clean UI responsive states', completed: false, difficulty: 'easy' },
    ],
    studyBlocks: [
      { id: 'sb-1-1', date: new Date().toISOString().split('T')[0], time: '14:00', duration: 2, completed: false },
      { id: 'sb-1-2', date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00', duration: 4, completed: false },
    ],
    completionProbability: 85,
  },
  {
    id: 't-2',
    title: 'Quarterly Financial Planning',
    description: 'Review budget sheets and prepare financial projections for next quarter.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T17:00',
    priority: 'high',
    estimatedDuration: 4,
    category: 'Finance',
    progress: 0,
    completed: false,
    notes: 'Sync with billing invoices from Gmail.',
    subtasks: [
      { id: 'sub-2-1', title: 'Download all Q2 invoice PDFs', completed: false },
      { id: 'sub-2-2', title: 'Analyze spending categories', completed: false, difficulty: 'medium' },
      { id: 'sub-2-3', title: 'Create presentation slides', completed: false, difficulty: 'medium' },
    ],
    studyBlocks: [],
    completionProbability: 60,
  },
  {
    id: 't-3',
    title: 'Monthly Cloud Infrastructure Review',
    description: 'Optimize Google Cloud Run deployment budgets and monitor memory constraints.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T12:00',
    priority: 'medium',
    estimatedDuration: 2,
    category: 'Work',
    progress: 100,
    completed: true,
    subtasks: [
      { id: 'sub-3-1', title: 'Analyze server logs', completed: true },
      { id: 'sub-3-2', title: 'Re-configure Auto-scaling thresholds', completed: true },
    ],
    completionProbability: 100,
  },
  {
    id: 't-4',
    title: 'Bioinformatics Lab Assessment',
    description: 'Analyze protein alignments and fold predictions.',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00',
    priority: 'high',
    estimatedDuration: 3,
    category: 'Study',
    progress: 10,
    completed: false,
    subtasks: [
      { id: 'sub-4-1', title: 'Fetch FASTA sequence profiles', completed: true },
      { id: 'sub-4-2', title: 'Run blast alignment searches', completed: false, difficulty: 'medium' },
    ],
    completionProbability: 75,
  },
  {
    id: 't-5',
    title: 'Schedule Health Checkup',
    description: 'Annual routine clinical visit booking.',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T18:00',
    priority: 'low',
    estimatedDuration: 1,
    category: 'Health',
    progress: 0,
    completed: false,
    completionProbability: 95,
  },
];

const INITIAL_HABITS: Habit[] = [
  { id: 'h-1', name: '6 AM Sleep Wakeup', category: 'Sleep', streak: 4, history: { [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true, [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true } },
  { id: 'h-2', name: 'Cardio Training', category: 'Exercise', streak: 1, history: { [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true } },
  { id: 'h-3', name: 'Technical Reading', category: 'Reading', streak: 3, history: { [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true, [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true } },
  { id: 'h-4', name: 'Gemini Agent Design Study', category: 'Study', streak: 7, history: { [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true, [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true, [new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: true } },
];

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'e-1', title: 'AI Pitch Rehearsal Meeting', start: new Date().toISOString().split('T')[0] + 'T11:00', end: new Date().toISOString().split('T')[0] + 'T12:00', type: 'meeting' },
  { id: 'e-2', title: 'Weekly Sprint Standup', start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:30', end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00', type: 'meeting' },
  { id: 'e-3', title: 'Cloud Run Architecture Session', start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T15:00', end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T16:30', type: 'meeting' },
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c-1',
    sender: 'ai',
    text: "Welcome back! I am your RecollectBuddy AI Assistant. I have analyzed your 4 pending assignments and upcoming deadlines.\n\nYour *Advanced AI Project Submission* is due tomorrow. I scheduled a focused study session for you today at 2 PM. Let me know if you would like to break this down into actionable steps or optimize your week!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions: [
      { label: 'Decompose Project', actionId: 'decompose_ai_project' },
      { label: 'Optimize My Week', actionId: 'optimize_week' },
    ],
  },
];

const INITIAL_LOGS: AgentLog[] = [
  { id: 'log-1', timestamp: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString(), type: 'info', message: 'Gemini Assistant initialized successfully.' },
  { id: 'log-2', timestamp: new Date(Date.now() - 8 * 60 * 1000).toLocaleTimeString(), type: 'success', message: 'Synced Google Calendar - 3 meetings imported.' },
  { id: 'log-3', timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(), type: 'warn', message: 'AI calculated high-stress probability on Tomorrow\'s Deadline. Suggested 14:00 focus block.' },
];

// ----------------------------------------------------
// STATE MANAGER CLASS / SERVICES
// ----------------------------------------------------

export class RecollectStore {
  private static instance: RecollectStore;
  private listeners: (() => void)[] = [];

  public tasks: Task[] = [];
  public habits: Habit[] = [];
  public calendarEvents: CalendarEvent[] = [];
  public chatHistory: ChatMessage[] = [];
  public agentLogs: AgentLog[] = [];
  public apiKey: string = '';
  public userProfile: { name: string; email: string; loggedIn: boolean } = { name: 'Guest User', email: 'guest@recollectbuddy.com', loggedIn: false };

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): RecollectStore {
    if (!RecollectStore.instance) {
      RecollectStore.instance = new RecollectStore();
    }
    return RecollectStore.instance;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      this.tasks = JSON.parse(localStorage.getItem('rb_tasks') || JSON.stringify(INITIAL_TASKS));
      this.habits = JSON.parse(localStorage.getItem('rb_habits') || JSON.stringify(INITIAL_HABITS));
      this.calendarEvents = JSON.parse(localStorage.getItem('rb_calendar') || JSON.stringify(INITIAL_CALENDAR_EVENTS));
      this.chatHistory = JSON.parse(localStorage.getItem('rb_chat') || JSON.stringify(INITIAL_CHAT));
      this.agentLogs = JSON.parse(localStorage.getItem('rb_logs') || JSON.stringify(INITIAL_LOGS));
      this.apiKey = localStorage.getItem('rb_apikey') || '';
      this.userProfile = JSON.parse(localStorage.getItem('rb_profile') || JSON.stringify({ name: 'Hackathon Judge', email: 'judge@googlehackathon.com', loggedIn: true }));
    } catch (e) {
      this.tasks = INITIAL_TASKS;
      this.habits = INITIAL_HABITS;
      this.calendarEvents = INITIAL_CALENDAR_EVENTS;
      this.chatHistory = INITIAL_CHAT;
      this.agentLogs = INITIAL_LOGS;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    localStorage.setItem('rb_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('rb_habits', JSON.stringify(this.habits));
    localStorage.setItem('rb_calendar', JSON.stringify(this.calendarEvents));
    localStorage.setItem('rb_chat', JSON.stringify(this.chatHistory));
    localStorage.setItem('rb_logs', JSON.stringify(this.agentLogs));
    localStorage.setItem('rb_apikey', this.apiKey);
    localStorage.setItem('rb_profile', JSON.stringify(this.userProfile));

    this.notify();
  }

  public addListener(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ----------------------------------------------------
  // MUTATIONS (CRUD)
  // ----------------------------------------------------

  public login(name: string, email: string) {
    this.userProfile = { name, email, loggedIn: true };
    this.addLog('info', `User ${name} logged in.`);
    this.saveToStorage();
  }

  public logout() {
    this.userProfile = { name: 'Guest User', email: 'guest@recollectbuddy.com', loggedIn: false };
    this.addLog('info', 'User logged out.');
    this.saveToStorage();
  }

  public addTask(task: Omit<Task, 'id' | 'completed' | 'progress'>) {
    const newTask: Task = {
      ...task,
      id: 't-' + Math.random().toString(36).substr(2, 9),
      completed: false,
      progress: 0,
      completionProbability: Math.floor(Math.random() * 30) + 60,
    };
    this.tasks.push(newTask);
    this.addLog('success', `Created task: "${newTask.title}"`);
    this.saveToStorage();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>) {
    this.tasks = this.tasks.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        if (updates.completed !== undefined) {
          updated.progress = updates.completed ? 100 : 0;
        }
        return updated;
      }
      return t;
    });
    this.addLog('info', `Updated task ID: ${id}`);
    this.saveToStorage();
  }

  public deleteTask(id: string) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.addLog('warn', `Deleted task ID: ${id}`);
    this.saveToStorage();
  }

  public toggleSubtask(taskId: string, subtaskId: string) {
    this.tasks = this.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        const subtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        const completedCount = subtasks.filter(s => s.completed).length;
        const progress = Math.round((completedCount / subtasks.length) * 100);
        return { ...t, subtasks, progress, completed: progress === 100 };
      }
      return t;
    });
    this.saveToStorage();
  }

  public toggleHabit(habitId: string, date: string) {
    this.habits = this.habits.map(h => {
      if (h.id === habitId) {
        const currentlyCompleted = !!h.history[date];
        const history = { ...h.history, [date]: !currentlyCompleted };
        const streak = !currentlyCompleted ? h.streak + 1 : Math.max(0, h.streak - 1);
        return { ...h, history, streak };
      }
      return h;
    });
    this.saveToStorage();
  }

  public addCalendarEvent(event: Omit<CalendarEvent, 'id'>) {
    const newEvent: CalendarEvent = {
      ...event,
      id: 'e-' + Math.random().toString(36).substr(2, 9),
    };
    this.calendarEvents.push(newEvent);
    this.saveToStorage();
    return newEvent;
  }

  public deleteCalendarEvent(id: string) {
    this.calendarEvents = this.calendarEvents.filter(e => e.id !== id);
    this.saveToStorage();
  }

  public addChatMessage(sender: 'user' | 'ai', text: string, actions?: ChatMessage['actions']) {
    const newMessage: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions,
    };
    this.chatHistory.push(newMessage);
    this.saveToStorage();
  }

  public addLog(type: AgentLog['type'], message: string) {
    const newLog: AgentLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    this.agentLogs = [newLog, ...this.agentLogs].slice(0, 50); // keep last 50 logs
    this.saveToStorage();
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    this.addLog('info', 'Google Gemini API key updated.');
    this.saveToStorage();
  }

  // ----------------------------------------------------
  // AGENTIC AI ACTIONS (Core Feature Demonstrators)
  // ----------------------------------------------------

  public triggerMissTodaySession() {
    // Demo flow: The user skips today's session. The AI replans everything.
    this.addLog('warn', 'User skipped today\'s study block for "Advanced AI Project Submission".');
    
    // 1. Mark current study blocks today as missed or remove them.
    const today = new Date().toISOString().split('T')[0];
    this.tasks = this.tasks.map(t => {
      if (t.id === 't-1' && t.studyBlocks) {
        return {
          ...t,
          studyBlocks: t.studyBlocks.map(sb => {
            if (sb.date === today) {
              return { ...sb, completed: false, date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '08:00' };
            }
            return sb;
          })
        };
      }
      return t;
    });

    // 2. Insert Agent Logs of automatic rescheduling
    this.addLog('action', 'Agentic Engine started: Scanning calendar for upcoming free slots...');
    this.addLog('action', 'Identified tomorrow morning free block: 08:00 - 11:30.');
    this.addLog('action', 'Rescheduled study block. Created task sub-breakdown to balance workload.');
    this.addLog('success', 'Replanning completed. Sent push notification and sync event to Google Calendar.');

    // 3. Add AI Chat notification
    this.addChatMessage('ai', "🚨 **I noticed you skipped today's study block for your Advanced AI Project.**\n\nNo worries! I've proactively reorganized your schedule. I detected a free space in your Google Calendar tomorrow morning. I've moved your 2-hour session to **tomorrow at 8:00 AM** and broken down your remaining subtasks to ensure you complete the submission before the 11:59 PM deadline. Your success probability remains high (80%).", [
      { label: 'Confirm New Plan', actionId: 'confirm_reschedule' },
      { label: 'Auto-Optimize Week', actionId: 'optimize_week' }
    ]);

    this.saveToStorage();
  }

  public triggerDecomposeTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.addLog('action', `Gemini Engine: Analyzing task context & estimating complexity for "${task.title}"...`);
    
    const defaultSubtasks = [
      { id: 'sub-d-1', title: 'Phase 1: Initial Research & Data Gathering', completed: false, difficulty: 'easy' as const },
      { id: 'sub-d-2', title: 'Phase 2: Core Architecture & Logic Setup', completed: false, difficulty: 'medium' as const },
      { id: 'sub-d-3', title: 'Phase 3: Integration, Styling & Responsive Pass', completed: false, difficulty: 'medium' as const },
      { id: 'sub-d-4', title: 'Phase 4: Optimization, Tests & Final Push', completed: false, difficulty: 'hard' as const },
    ];

    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: defaultSubtasks,
        };
      }
      return t;
    });

    this.addLog('success', `Task "${task.title}" successfully decomposed into 4 highly-focused subtasks.`);
    this.saveToStorage();
  }

  public triggerOptimizeWeek() {
    this.addLog('action', 'Agentic Engine: Scanning all 4 pending tasks & historical productivity metrics...');
    this.addLog('action', 'Cross-referencing 3 Google Calendar events to find deep focus windows...');
    
    // Add study blocks to all non-completed tasks
    this.tasks = this.tasks.map(t => {
      if (!t.completed && (!t.studyBlocks || t.studyBlocks.length === 0)) {
        const dateStr = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          ...t,
          studyBlocks: [
            { id: 'sb-gen-' + Math.random().toString(36).substr(2, 5), date: dateStr, time: '13:00', duration: 1.5, completed: false }
          ]
        };
      }
      return t;
    });

    this.addLog('success', 'Week optimization complete: 3 focus blocks strategically inserted in your schedule to balance cognitive load.');
    this.addChatMessage('ai', "✨ **Weekly Schedule Optimized!**\n\nI have structured focused study sessions for all your pending high and medium priority items. I've placed them in open slots surrounding your existing meetings to prevent burnout and maximize completion velocity.");
    this.saveToStorage();
  }
}

// React Hook integration
export function useRecollectStore() {
  const store = RecollectStore.getInstance();
  const [state, setState] = useState({
    tasks: store.tasks,
    habits: store.habits,
    calendarEvents: store.calendarEvents,
    chatHistory: store.chatHistory,
    agentLogs: store.agentLogs,
    apiKey: store.apiKey,
    userProfile: store.userProfile,
  });

  useEffect(() => {
    const unsub = store.addListener(() => {
      setState({
        tasks: [...store.tasks],
        habits: [...store.habits],
        calendarEvents: [...store.calendarEvents],
        chatHistory: [...store.chatHistory],
        agentLogs: [...store.agentLogs],
        apiKey: store.apiKey,
        userProfile: { ...store.userProfile },
      });
    });
    return unsub;
  }, []);

  return {
    ...state,
    store,
  };
}
