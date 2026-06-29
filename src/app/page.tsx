'use client';

import React, { useState } from 'react';
import { useRecollectStore, Task, Habit, CalendarEvent, AgentLog } from '../services/store';
import { askGemini } from '../services/gemini';
import {
  Sparkles,
  LayoutDashboard,
  Brain,
  Calendar,
  CheckSquare,
  Activity,
  Settings,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Check,
  User,
  LogOut,
  CalendarDays,
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  Play,
  RotateCcw,
  UserCheck,
  Award,
  Zap,
  CheckCircle2,
  Calendar as CalendarIcon,
  Search,
  Sliders,
  Send,
  HelpCircle,
  Eye,
  Menu,
  X,
  Volume2
} from 'lucide-react';

export default function RecollectBuddyApp() {
  const {
    tasks,
    habits,
    calendarEvents,
    chatHistory,
    agentLogs,
    apiKey,
    userProfile,
    store
  } = useRecollectStore();

  // Navigation & Page State
  const [appMode, setAppMode] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'planner' | 'tasks' | 'calendar' | 'habits' | 'analytics' | 'integrations' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Task Creator modal / states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newTaskDuration, setNewTaskDuration] = useState(2);
  const [newTaskCategory, setNewTaskCategory] = useState<'Study' | 'Work' | 'Finance' | 'Life' | 'Health'>('Study');

  // Integrations state
  const [gmailConnected, setGmailConnected] = useState(false);
  const [whatsAppConnected, setWhatsConnected] = useState(false);
  const [simulatedWhatsAppMsg, setSimulatedWhatsAppMsg] = useState('Remind me to finish quarterly budget tomorrow');

  // Settings states
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  // ----------------------------------------------------
  // HANDLERS & SIMULATORS
  // ----------------------------------------------------

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || chatInput;
    if (!msgText.trim()) return;

    store.addChatMessage('user', msgText);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    try {
      const result = await askGemini(msgText, apiKey);
      store.addChatMessage('ai', result.text, result.actions);
    } catch (e) {
      store.addChatMessage('ai', "I encountered an error analyzing your request. Let's try another approach.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (actionId: string, payload?: any) => {
    if (actionId === 'decompose_ai_project') {
      store.triggerDecomposeTask('t-1');
      store.addChatMessage('ai', "✅ **I have decomposed your Advanced AI Project!** I analyzed the complexity profile and added 4 structured phases with difficulty ratings. Check the **AI Planner** or the **Tasks** tab to see your custom roadmap.");
    } else if (actionId === 'optimize_week') {
      store.triggerOptimizeWeek();
    } else if (actionId === 'confirm_reschedule') {
      store.addLog('success', 'User accepted the rescheduled session.');
      store.addChatMessage('ai', "Awesome! The tomorrow 8:00 AM session has been locked. I synced it to your Google Calendar.");
    } else if (actionId === 'view_today') {
      setActiveTab('dashboard');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    store.addTask({
      title: newTaskTitle,
      description: newTaskDesc,
      deadline: newTaskDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      priority: newTaskPriority,
      estimatedDuration: Number(newTaskDuration),
      category: newTaskCategory,
      notes: '',
      subtasks: [
        { id: 'sub-new-1', title: 'Gather resource materials', completed: false, difficulty: 'easy' },
        { id: 'sub-new-2', title: 'Complete first draft revision', completed: false, difficulty: 'medium' }
      ],
      studyBlocks: [
        { id: 'sb-new-1', date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '11:00', duration: Number(newTaskDuration), completed: false }
      ]
    });

    // Reset task fields
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDeadline('');
    setNewTaskPriority('medium');
    setNewTaskDuration(2);
    setNewTaskCategory('Study');
    setShowTaskModal(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.setApiKey(localApiKey);
    store.addLog('success', 'Settings successfully updated.');
    alert('Settings saved! RecollectBuddy is now customized.');
  };

  // ----------------------------------------------------
  // CALCULATIONS (FOR CHARTS & SCORE)
  // ----------------------------------------------------
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  // Custom smart productivity score calculation
  const baseScore = completionRate;
  const habitStreakBonus = habits.reduce((acc, h) => acc + h.streak, 0) * 1.5;
  const productivityScore = Math.min(100, Math.max(10, Math.round(baseScore + habitStreakBonus)));

  return (
    <div className="min-h-screen flex flex-col relative bg-[#090d16] text-[#f8fafc] overflow-x-hidden selection:bg-[#2563eb]/30">
      
      {/* Background Orbs */}
      <div className="glow-primary top-10 left-10 animate-pulse-glow"></div>
      <div className="glow-accent top-1/2 right-10 animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* ----------------------------------------------------
          LANDING PAGE MODE
          ---------------------------------------------------- */}
      {appMode === 'landing' && (
        <div className="flex-1 flex flex-col z-10">
          {/* Header */}
          <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-[#2563eb] to-[#10b981] p-2.5 rounded-xl shadow-lg shadow-blue-500/10">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">RecollectBuddy</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAppMode('app')} 
                className="px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-600 font-semibold text-sm transition shadow-lg shadow-blue-500/20"
              >
                Launch App
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 flex flex-col items-start gap-6 text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Not a reminder app.<br />
                An <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-500 bg-clip-text text-transparent">AI Executive Assistant</span>.
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-xl">
                Plan Smarter. Beat Deadlines. Stay Accountable. RecollectBuddy proactively reorganizes schedules, tracks streaks, and coaches you to finish work before deadlines hit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <button 
                  onClick={() => setAppMode('app')}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#2563eb] to-blue-600 hover:from-blue-600 hover:to-blue-700 font-bold text-base transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  Get Started For Free <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setAppMode('app'); setActiveTab('chat'); }}
                  className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-base transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 text-emerald-400" /> Try Live AI Demo
                </button>
              </div>
            </div>

            {/* Visual Dashboard Mock Widget */}
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 blur-3xl rounded-3xl"></div>
              <div className="glass-panel border border-white/10 p-6 md:p-8 rounded-2xl relative shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">RecollectBuddy // Agentic Monitor</div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Today's Focus Block</div>
                      <div className="font-semibold text-lg text-white">Advanced AI Submission</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" /> 14:00 (Duration: 2.5h)
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold uppercase">High Priority</span>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-yellow-200">Session missed? AI auto-reorganized!</div>
                        <p className="text-xs text-slate-300 mt-1">"I have detected a calendar free-block tomorrow morning at 08:00 AM. I have shifted your AI project blocks to protect your deadline."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Features Grid */}
          <section className="bg-slate-950/40 border-t border-white/5 py-16 md:py-24">
            <div className="max-w-7xl w-full mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-white">Engineered For Execution</h2>
                <p className="text-slate-400 mt-3">Simple reminders only create stress. RecollectBuddy builds actual pathways to completion.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Google Gemini Smart Brain</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Uses actual context windows to dissect massive projects, estimate difficulty, generate timelines, and craft proactive text coaching.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Sliders className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Agentic Replanning</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Missed a study slot or took a break? The AI detects it automatically, reshuffles your calendar events, and communicates the update to prevent panic.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Calendar className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Google Calendar Sync</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Imports existing personal, professional, or academic events and fits coaching blocks tightly around them.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/5 h-20 flex items-center justify-center text-slate-500 text-xs">
            © 2026 RecollectBuddy. Designed for Google Agentic AI Hackathon.
          </footer>
        </div>
      )}

      {/* ----------------------------------------------------
          APPLICATION DASHBOARD MODE
          ---------------------------------------------------- */}
      {appMode === 'app' && (
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
          
          {/* Mobile Header Toggle */}
          <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/10 z-30">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-white">RecollectBuddy</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* SIDE NAVIGATION */}
          <aside className={`w-full lg:w-64 bg-slate-950/80 border-r border-white/5 p-6 flex flex-col gap-8 z-20 transition-all duration-300 lg:static fixed top-[60px] left-0 bottom-0 ${mobileMenuOpen ? 'block' : 'hidden lg:flex'}`}>
            <div className="hidden lg:flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <span className="font-bold text-lg tracking-tight">RecollectBuddy</span>
            </div>

            {/* Profile widget */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                {userProfile.name[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold text-xs truncate">{userProfile.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{userProfile.email}</div>
              </div>
              <button onClick={() => setAppMode('landing')} title="Logout" className="p-1 hover:text-rose-400 transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 flex flex-col gap-1.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'chat', label: 'AI Assistant', icon: Sparkles },
                { id: 'planner', label: 'AI Planner', icon: Brain },
                { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
                { id: 'calendar', label: 'Calendar Sync', icon: CalendarIcon },
                { id: 'habits', label: 'Habit Tracker', icon: Flame },
                { id: 'analytics', label: 'Analytics', icon: Activity },
                { id: 'integrations', label: 'Smart Previews', icon: Mail },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      active 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick coaching info */}
            <div className="p-4 bg-gradient-to-tr from-blue-500/5 to-emerald-500/5 border border-white/5 rounded-2xl text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">Progress Index</div>
              <div className="text-2xl font-extrabold mt-1 text-emerald-400">{productivityScore}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Excellent streak velocity this week.</div>
            </div>
          </aside>

          {/* MAIN PAGE VIEWPORTS */}
          <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
            
            {/* AGENTIC LOG REPLAN BANNER */}
            <div className="glass-panel border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 via-emerald-500/5 to-slate-900 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/30">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">RecollectBuddy Proactive Agent is ACTIVE</div>
                  <p className="text-xs text-slate-400">Continuous background scheduling scanning your connected Google Calendar.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => store.triggerMissTodaySession()}
                  className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl font-bold text-xs transition"
                >
                  Simulate Skip Session
                </button>
                <button
                  onClick={() => store.triggerOptimizeWeek()}
                  className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl font-bold text-xs transition"
                >
                  Optimize Schedule
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------
                TAB: DASHBOARD
                ---------------------------------------------------- */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                
                {/* Statistics Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Score</div>
                      <div className="text-3xl font-extrabold text-white mt-1">{productivityScore}</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +12% vs last week
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Deadlines</div>
                      <div className="text-3xl font-extrabold text-white mt-1">{activeTasks.length}</div>
                      <div className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" /> 1 urgent submission
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                      <Clock className="w-6 h-6 text-rose-400" />
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Habit Streaks</div>
                      <div className="text-3xl font-extrabold text-white mt-1">{habits[2]?.streak || 3} days</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <Flame className="w-3 h-3" /> Technical Reading active
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</div>
                      <div className="text-3xl font-extrabold text-white mt-1">{completionRate}%</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        Total {tasks.length} tracked items
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Layout Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left and Middle Columns (2 cols wide) */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Today's Focus Card */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-tr from-slate-900 to-slate-950">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">Critical Target</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Today's Focus Task</h3>
                      
                      {tasks.find(t => t.id === 't-1') ? (
                        <div>
                          <h4 className="text-2xl font-black text-white">{tasks[0].title}</h4>
                          <p className="text-slate-400 text-sm mt-1">{tasks[0].description}</p>
                          
                          <div className="mt-4 flex flex-wrap gap-4 items-center text-xs text-slate-300">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-400" /> Duration: {tasks[0].estimatedDuration} Hours</span>
                            <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-emerald-400" /> Deadline: Tomorrow 23:59</span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-6">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-400">Completion Probability: {tasks[0].completionProbability}%</span>
                              <span className="text-emerald-400">{tasks[0].progress}% Complete</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${tasks[0].progress}%` }}></div>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2">
                            <button
                              onClick={() => { store.toggleSubtask('t-1', 'sub-1-3'); }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                            >
                              Complete Phase 3 Subtask
                            </button>
                            <button
                              onClick={() => { store.triggerDecomposeTask('t-1'); }}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs rounded-lg transition"
                            >
                              Regenerate AI Subtasks
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500">No high priority tasks scheduled. Create one!</div>
                      )}
                    </div>

                    {/* Upcoming Tasks Overview */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Pending Assignments & Work</h3>
                        <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition">
                          <Plus className="w-3.5 h-3.5" /> Add Task
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {tasks.slice(0, 3).map(task => (
                          <div key={task.id} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${task.priority === 'critical' ? 'bg-rose-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-slate-400'}`}></span>
                                <span className={`font-semibold text-sm ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1 max-w-md truncate">{task.description}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 font-mono">{task.deadline.split('T')[0]}</span>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => store.updateTask(task.id, { completed: !task.completed })}
                                className="w-4.5 h-4.5 rounded border-white/20 bg-slate-900 accent-blue-600 focus:ring-0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Assistant Insights / Proactive coaching widget */}
                  <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-4">
                          <Sparkles className="w-4 h-4" /> AI COACHING INSIGHT
                        </div>
                        <div className="text-sm font-semibold text-white">Daily Review & Goal Target</div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          "Your performance streak remains stable. However, our analytics indicate the 'Quarterly Financial Planning' task is risk-prone due to incoming study overlaps. I highly suggest starting research early."
                        </p>

                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <div className="text-xs font-bold text-blue-300">Gemini Suggestion:</div>
                          <p className="text-xs text-slate-300 mt-1">"Generate modular subtasks to reduce cognitive friction by 40%."</p>
                          <button
                            onClick={() => handleActionClick('decompose_ai_project')}
                            className="mt-2.5 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition"
                          >
                            Optimize Now
                          </button>
                        </div>
                      </div>

                      {/* Agentic Decision Log Box */}
                      <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Agentic Thought Log</div>
                        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                          {agentLogs.slice(0, 3).map(log => (
                            <div key={log.id} className="text-[10px] flex items-start gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'warn' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                              <div>
                                <span className="text-slate-500 mr-1.5 font-mono">{log.timestamp}</span>
                                <span className="text-slate-300">{log.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: CHAT COMPANION
                ---------------------------------------------------- */}
            {activeTab === 'chat' && (
              <div className="glass-panel border border-white/10 rounded-2xl flex-1 flex flex-col h-[650px] overflow-hidden">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Gemini Productivity Coach</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Real-time Cognitive Assistant
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full font-mono">
                    Mode: Proactive Scheduler
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                  {chatHistory.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 border border-white/5 text-slate-200 rounded-bl-none'}`}>
                        {msg.text.split('\n').map((line, idx) => (
                          <p key={idx} className="mt-1">{line}</p>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>

                      {/* Display smart recommendation action buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.actions.map((act, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(act.actionId, act.payload)}
                              className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400 transition flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="self-start flex gap-1.5 items-center bg-white/5 border border-white/5 p-3 rounded-2xl text-slate-400 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  )}
                </div>

                {/* Preset Fast Actions */}
                <div className="px-6 py-2.5 border-t border-white/5 flex gap-2 overflow-x-auto bg-slate-950/20">
                  {[
                    "My project is due tomorrow.",
                    "Optimize my weekly calendar slots.",
                    "I want some custom productivity motivation.",
                    "How do I complete work before study overlap?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(preset)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-slate-300 font-semibold whitespace-nowrap transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Input Controls */}
                <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Gemini to reschedule, optimize, or breakdown a task..."
                    className="flex-1 py-3 px-4 rounded-xl glass-input text-sm"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition shadow-lg shadow-blue-500/10"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: AI PLANNER
                ---------------------------------------------------- */}
            {activeTab === 'planner' && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold text-white mb-2">Google Gemini Autonomous AI Planner</h3>
                  <p className="text-slate-400 text-sm">Dynamic timeline distribution of remaining projects mapped tightly to open calendar slots.</p>
                </div>

                {/* Horizontal Calendar Session Timeline */}
                <div className="grid grid-cols-1 gap-6">
                  {tasks.filter(t => !t.completed).map(task => (
                    <div key={task.id} className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-950 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">{task.category}</span>
                          <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${task.priority === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>{task.priority}</span>
                        </div>
                        <h4 className="text-xl font-bold text-white mt-3">{task.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                          <span>⏱ Estimated Study Blocks Required: {Math.ceil(task.estimatedDuration / 1.5)} blocks</span>
                          <span>⏳ Success Probability: <strong className="text-emerald-400">{task.completionProbability}%</strong></span>
                        </div>
                      </div>

                      {/* Study Blocks Details */}
                      <div className="w-full md:w-80 flex flex-col gap-3">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-1.5">Scheduled Focus Slots</div>
                        {task.studyBlocks && task.studyBlocks.length > 0 ? (
                          task.studyBlocks.map(sb => (
                            <div key={sb.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-white">{sb.date}</div>
                                <div className="text-[10px] text-slate-400">{sb.time} ({sb.duration} Hours)</div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">CONFIRMED</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 py-2">No focus sessions built. Click "Optimize My Week" to generate study blocks.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: TASK MANAGER
                ---------------------------------------------------- */}
            {activeTab === 'tasks' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Task Management Portal</h3>
                    <p className="text-slate-400 text-sm">Create, review, and decompose your pending deadlines.</p>
                  </div>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" /> Create Custom Task
                  </button>
                </div>

                {/* Subtask / List Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tasks.map(task => (
                    <div key={task.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">{task.category}</span>
                            <h4 className="text-lg font-bold text-white mt-2">{task.title}</h4>
                          </div>
                          <button onClick={() => store.deleteTask(task.id)} className="text-slate-500 hover:text-rose-400 transition p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{task.description}</p>

                        {/* Subtasks checklist */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex flex-col gap-2 mb-4 bg-slate-950/20 p-3 rounded-xl">
                            <div className="text-xs font-bold text-slate-400 mb-1">Decomposed Steps</div>
                            {task.subtasks.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => store.toggleSubtask(task.id, sub.id)}
                                className="flex items-center gap-2.5 text-xs text-left text-slate-300 hover:text-white transition"
                              >
                                <span className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center ${sub.completed ? 'bg-blue-600 border-blue-600' : 'bg-slate-900'}`}>
                                  {sub.completed && <Check className="w-3 h-3 text-white" />}
                                </span>
                                <span className={sub.completed ? 'line-through text-slate-500' : ''}>{sub.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action trigger footer */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Deadline: {task.deadline.split('T')[0]}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => store.triggerDecomposeTask(task.id)}
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition"
                          >
                            AI Decompose
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: CALENDAR SYNC
                ---------------------------------------------------- */}
            {activeTab === 'calendar' && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-950 to-slate-900 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Google Calendar Sync Terminal</h3>
                    <p className="text-slate-400 text-sm">Unified view of imported meetings and AI focus study block injections.</p>
                  </div>
                  <button className="px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-sm font-bold text-white rounded-xl transition">
                    Import Events Now
                  </button>
                </div>

                {/* Simulated Grid Calendar Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left block list of events */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-1">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Scheduled Events</h4>
                    <div className="flex flex-col gap-3">
                      {calendarEvents.map(ev => (
                        <div key={ev.id} className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                            <span className="font-semibold text-xs text-white">{ev.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">{ev.start.replace('T', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Heatmap Calendar block */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Visual Sync Board</h4>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
                      {Array.from({ length: 28 }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const hasEvent = dayNum === 1 || dayNum === 2 || dayNum === 5 || dayNum === 14;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border border-white/5 flex flex-col items-center justify-between h-20 ${
                              hasEvent ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5'
                            }`}
                          >
                            <span className="text-slate-400 text-[10px] font-mono">{dayNum}</span>
                            {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: HABITS
                ---------------------------------------------------- */}
            {activeTab === 'habits' && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold text-white">Daily Habit Streaks</h3>
                  <p className="text-slate-400 text-sm">Consistency builds mastery. Track your daily routines and gain massive multiplier scores.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {habits.map(habit => (
                    <div key={habit.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-white">{habit.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Category: {habit.category}</p>
                        
                        {/* Streak Counter */}
                        <div className="mt-4 flex items-center gap-1.5">
                          <span className="text-2xl font-black text-white">{habit.streak}</span>
                          <span className="text-xs text-slate-400 font-semibold">day streak</span>
                        </div>
                      </div>

                      {/* Interactive checkboxes representing past 5 days */}
                      <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, offset) => {
                          const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          const completed = !!habit.history[date];
                          return (
                            <button
                              key={offset}
                              onClick={() => store.toggleHabit(habit.id, date)}
                              className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center transition ${
                                completed 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-white/5 border-white/5 text-slate-500'
                              }`}
                              title={date}
                            >
                              <Check className={`w-4 h-4 ${completed ? 'opacity-100' : 'opacity-20'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: ANALYTICS
                ---------------------------------------------------- */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold text-white">Performance Analytics Dashboard</h3>
                  <p className="text-slate-400 text-sm">Aggregated productivity logs and predictive accomplishment metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chart 1: SVG Weekly Trends */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Completion Trends</h4>
                    
                    <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-white/5 pt-10">
                      {[30, 45, 60, 84, 90, 80, 95].map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 w-8">
                          <div className="text-[10px] text-slate-400 font-mono">{val}%</div>
                          <div className="bg-gradient-to-t from-[#2563eb] to-[#10b981] w-full rounded-t-md transition-all duration-500" style={{ height: `${val * 1.5}px` }}></div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">Day {idx+1}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart 2: Category Distribution */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Task Categorization</h4>
                    
                    <div className="flex flex-col gap-4 mt-6">
                      {[
                        { cat: 'Study', count: 4, pct: 40, color: 'bg-blue-500' },
                        { cat: 'Work', count: 2, pct: 20, color: 'bg-indigo-500' },
                        { cat: 'Finance', count: 1, pct: 15, color: 'bg-emerald-500' },
                        { cat: 'Health', count: 1, pct: 15, color: 'bg-rose-500' },
                        { cat: 'Life', count: 1, pct: 10, color: 'bg-yellow-500' }
                      ].map(item => (
                        <div key={item.cat}>
                          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                            <span>{item.cat} ({item.count} items)</span>
                            <span>{item.pct}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: SMART PREVIEWS (Gmail / WhatsApp placeholder)
                ---------------------------------------------------- */}
            {activeTab === 'integrations' && (
              <div className="flex flex-col gap-6">
                
                {/* Section Overview */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold text-white">Advanced Omnichannel Agent Previews</h3>
                  <p className="text-slate-400 text-sm">Extract schedules seamlessly from invoices, emails, or let Gemini alert you directly through messaging portals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Gmail extraction panel */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-white">Gmail Extraction Companion</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Enable Gemini scan triggers over incoming receipts, invoices, calendar updates, and auto-populate your RecollectBuddy planner.
                      </p>

                      <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5">
                        <div className="text-xs font-bold text-white mb-2">Simulated Inbound Email:</div>
                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-950/40 p-2.5 rounded border border-white/5">
                          From: billing@cloudserver.com<br />
                          Subject: Invoice #81039 due tomorrow for $42.00
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Gemini automatically built Task & payment link.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setGmailConnected(!gmailConnected); }}
                      className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                        gmailConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {gmailConnected ? 'Connected to Gmail' : 'Connect Google Workspace Account'}
                    </button>
                  </div>

                  {/* WhatsApp simulator container */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-white">WhatsApp Agent Notifications</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Chat directly to your assistant on WhatsApp. Create tasks, query timelines, and get pinged dynamically when schedules are auto-reorganized.
                      </p>

                      <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5">
                        <div className="text-xs font-bold text-white mb-2">WhatsApp Sandbox Simulator</div>
                        <input
                          type="text"
                          value={simulatedWhatsAppMsg}
                          onChange={e => setSimulatedWhatsAppMsg(e.target.value)}
                          placeholder="Type simulated message..."
                          className="w-full text-xs py-2 px-3 rounded bg-slate-900 border border-white/10 mt-1.5 mb-2 text-white"
                        />
                        <button
                          onClick={() => {
                            store.addLog('action', 'Inbound WhatsApp webhook received.');
                            store.addLog('success', `Created task: "${simulatedWhatsAppMsg}"`);
                            alert('WhatsApp hook processed! Checklist generated inside Tasks Tab.');
                          }}
                          className="w-full py-1.5 bg-emerald-500 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-600 transition"
                        >
                          Send Webhook Trigger
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => { setWhatsConnected(!whatsAppConnected); }}
                      className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                        whatsAppConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {whatsAppConnected ? 'Connected to WhatsApp API' : 'Initialize Mobile Sandbox'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB: SETTINGS
                ---------------------------------------------------- */}
            {activeTab === 'settings' && (
              <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 max-w-2xl mx-auto w-full">
                <h3 className="text-xl font-bold text-white mb-2">Platform Configuration</h3>
                <p className="text-slate-400 text-sm border-b border-white/5 pb-4 mb-6">Enter your credentials below to enable live Google ecosystem API requests.</p>

                <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Google Gemini API Key</label>
                    <input
                      type="password"
                      value={localApiKey}
                      onChange={e => setLocalApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="py-3 px-4 rounded-xl glass-input text-sm"
                    />
                    <span className="text-[10px] text-slate-500 mt-1">If blank, RecollectBuddy defaults to a rich semantic agentic sandbox.</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">User Account Profile Name</label>
                    <input
                      type="text"
                      defaultValue={userProfile.name}
                      onChange={e => store.login(e.target.value, userProfile.email)}
                      className="py-3 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Workspace Email</label>
                    <input
                      type="email"
                      defaultValue={userProfile.email}
                      onChange={e => store.login(userProfile.name, e.target.value)}
                      className="py-3 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-4 py-3 bg-[#2563eb] hover:bg-blue-600 font-bold text-sm text-white rounded-xl transition shadow-lg shadow-blue-500/10"
                  >
                    Save Changes & Sync
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ----------------------------------------------------
          GLOBAL TASK MODAL DIALOG
          ---------------------------------------------------- */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-md w-full border border-white/10 p-6 rounded-2xl relative shadow-2xl">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-4">Create New Task Submission</h3>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Physics Midterm Exam Revision"
                  className="py-2.5 px-3 rounded bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Short Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="Include notes or reference materials..."
                  className="py-2.5 px-3 rounded bg-slate-900 border border-white/10 text-sm text-white h-20 resize-none focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Deadline</label>
                  <input
                    type="datetime-local"
                    value={newTaskDeadline}
                    onChange={e => setNewTaskDeadline(e.target.value)}
                    className="py-2.5 px-3 rounded bg-slate-900 border border-white/10 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Priority Level</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="py-2.5 px-3 rounded bg-slate-900 border border-white/10 text-sm text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Estimate (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newTaskDuration}
                    onChange={e => setNewTaskDuration(Number(e.target.value))}
                    className="py-2.5 px-3 rounded bg-slate-900 border border-white/10 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value as any)}
                    className="py-2.5 px-3 rounded bg-slate-900 border border-white/10 text-sm text-white"
                  >
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                    <option value="Life">Life</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition"
              >
                Assemble Task & AI Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
