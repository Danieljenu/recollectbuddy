import { RecollectStore, Task } from './store';

export async function askGemini(prompt: string, apiKey?: string): Promise<{ text: string; actions?: { label: string; actionId: string; payload?: any }[] }> {
  const store = RecollectStore.getInstance();
  
  if (apiKey) {
    try {
      store.addLog('action', 'Sending query directly to Google Gemini API (gemini-2.5-flash)...');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are RecollectBuddy, a premium, proactive AI Productivity Companion.
Keep your responses beautiful, modern, structured with bold headings or list items, and motivational.
Do not act like a basic reminder app. You help the user complete work by analyzing schedules, prioritizing, and organizing.

Task Context of User: ${JSON.stringify(store.tasks.map(t => ({ title: t.title, deadline: t.deadline, completed: t.completed, category: t.category, progress: t.progress })))}
User Profile: ${JSON.stringify(store.userProfile)}

User Request: "${prompt}"

Provide your professional coaching response. If appropriate, suggest action items.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API Error: Status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';
      
      // Attempt to extract or suggest standard action items based on text
      const actions: { label: string; actionId: string; payload?: any }[] = [];
      if (prompt.toLowerCase().includes('decompose') || prompt.toLowerCase().includes('break')) {
        actions.push({ label: 'Break Into Steps', actionId: 'decompose_ai_project' });
      }
      if (prompt.toLowerCase().includes('optimize') || prompt.toLowerCase().includes('schedule')) {
        actions.push({ label: 'Optimize My Week', actionId: 'optimize_week' });
      }
      
      store.addLog('success', 'Gemini content generated successfully.');
      return { text, actions: actions.length > 0 ? actions : undefined };
    } catch (e: any) {
      store.addLog('warn', `Gemini API call failed: ${e.message}. Falling back to Smart Simulation.`);
    }
  }

  // ----------------------------------------------------
  // INTELLIGENT COMPANION RESPONSE SIMULATOR
  // ----------------------------------------------------
  store.addLog('action', 'Gemini simulation engine: Analyzing user input...');
  await new Promise(resolve => setTimeout(resolve, 800)); // typing delay

  const query = prompt.toLowerCase();

  if (query.includes('due') || query.includes('project') || query.includes('assignment') || query.includes('friday') || query.includes('tomorrow')) {
    store.addLog('success', 'Interpreted intent: High stress deadline warning.');
    return {
      text: "🚨 **High Priority Deadline Warning!**\n\nI understand you have an upcoming project submission or critical deadline due very soon. Based on your active calendar and habits, here is my recommendation:\n\n* **Stress Estimate**: Very High. Your current schedule has multiple meetings surrounding this slot.\n* **Action Plan**: Let's decompose your *Advanced AI Project Submission* into smaller, bite-sized phases. This will reduce cognitive resistance and help you start immediately.\n* **Schedule Recommendation**: I've detected an open 3-hour window in your Google Calendar tomorrow. I recommend a focused study block starting at **10:00 AM**.",
      actions: [
        { label: 'Decompose Project', actionId: 'decompose_ai_project' },
        { label: 'Optimize My Week', actionId: 'optimize_week' }
      ]
    };
  }

  if (query.includes('optimize') || query.includes('plan') || query.includes('schedule') || query.includes('week')) {
    store.addLog('success', 'Interpreted intent: Full schedule optimization request.');
    return {
      text: "📊 **Proactive Weekly Optimization Plan**\n\nI have scanned your 4 pending assignments and 3 imported Google Calendar events. To ensure you complete everything without burning out, I suggest a balanced planning distribution:\n\n1. **Advanced AI Project Submission**: Finish outstanding subtasks tomorrow morning during a dedicated 4-hour slot.\n2. **Quarterly Financial Planning**: Schedule a 2-hour session on Friday afternoon right after your sync meeting.\n3. **Bioinformatics Lab Assessment**: Work for 1.5 hours on Saturday morning.\n\nThis distribution maintains a high success probability (85%) and reserves plenty of rest time.",
      actions: [
        { label: 'Optimize My Week Now', actionId: 'optimize_week' },
        { label: 'Decompose Tasks', actionId: 'decompose_ai_project' }
      ]
    };
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('who are you')) {
    return {
      text: `Hello ${store.userProfile.name}! 👋 I am **RecollectBuddy**, your proactive AI Executive Companion.\n\nI can analyze your deadlines, decompose projects into focus blocks, schedule them around your meetings, and automatically reorganise your week if you skip a session.\n\nHow can I help you stay on track today?`,
      actions: [
        { label: 'View Today\'s Plan', actionId: 'view_today' },
        { label: 'Optimize My Schedule', actionId: 'optimize_week' }
      ]
    };
  }

  if (query.includes('help') || query.includes('coach') || query.includes('motivate') || query.includes('stuck')) {
    return {
      text: "💡 **Productivity Coaching & Motivation**\n\nRemember: *\"Procrastination is the gap between intention and action.\"*\n\nYour weekly completion rate is at a fantastic **84%**! You are doing incredibly well. Let's tackle that one small subtask right now. It will only take 15 minutes. Just take the first step, and the momentum will carry you forward!",
      actions: [
        { label: 'Decompose Main Task', actionId: 'decompose_ai_project' }
      ]
    };
  }

  // Default smart fallback response
  return {
    text: `Understood! I've logged your request: "${prompt}".\n\nTo help you act on this, I suggest compiling a focused set of subtasks or adding a dedicated focus block to your calendar. What would you like me to automate?`,
    actions: [
      { label: 'Break Into Steps', actionId: 'decompose_ai_project' },
      { label: 'Schedule Focus Block', actionId: 'optimize_week' }
    ]
  };
}
