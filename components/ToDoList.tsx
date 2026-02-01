
import React, { useState, useEffect } from 'react';
import { ToDoItem } from '../types';
import { getToDos, createToDo, updateToDo, deleteToDo, bulkCreateToDos } from '../services/mockFirebase';
import { generateDailyPlan } from '../services/geminiService';
import { Plus, Trash2, Check, CheckCircle, Circle, Wand2, Loader2, ListTodo, X } from 'lucide-react';

interface ToDoListProps {
  userId: string;
}

export const ToDoList: React.FC<ToDoListProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<ToDoItem[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  
  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    setLoading(true);
    const data = await getToDos(userId);
    setTasks(data);
    setLoading(false);
  };

  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;

    const task: ToDoItem = {
      id: `task_${Date.now()}`,
      userId,
      text: newTask.trim(),
      isCompleted: false,
      priority: 'MEDIUM',
      timestamp: new Date().toISOString()
    };

    await createToDo(task);
    setTasks(prev => {
        // Simple optimistic sort: uncompleted first
        const newList = [task, ...prev];
        return newList.sort((a,b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
    });
    setNewTask('');
  };

  const toggleComplete = async (task: ToDoItem) => {
    const updated = { ...task, isCompleted: !task.isCompleted };
    
    // Optimistic Update
    setTasks(prev => 
      prev.map(t => t.id === task.id ? updated : t)
          .sort((a,b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
    );

    await updateToDo(task.id, { isCompleted: updated.isCompleted });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this task?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
      await deleteToDo(id);
    }
  };

  const handleAiPlan = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const plan = await generateDailyPlan(aiPrompt);
      
      const newTasks: ToDoItem[] = plan.map((item, index) => ({
        id: `ai_task_${Date.now()}_${index}`,
        userId,
        text: item.text,
        priority: item.priority as 'HIGH'|'MEDIUM'|'LOW',
        isCompleted: false,
        timestamp: new Date(Date.now() - index * 1000).toISOString() // Stagger timestamps
      }));

      await bulkCreateToDos(newTasks);
      await loadTasks(); // Reload to get proper sort
      setShowAiModal(false);
      setAiPrompt('');
    } catch (e) {
      alert("Failed to generate plan.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
               <ListTodo className="mr-3 text-blue-600 dark:text-blue-400"/>
               My Daily Planner
             </h2>
             <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal tasks and priorities.</p>
          </div>
          <button 
            onClick={() => setShowAiModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-all text-sm font-medium hover:scale-105 active:scale-95"
          >
             <Wand2 size={16} className="mr-2" />
             AI Smart Plan
          </button>
       </div>

       {/* Add Task Bar */}
       <form onSubmit={handleAddTask} className="relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full pl-4 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-base bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
             <Plus size={20} />
          </button>
       </form>

       {/* Task List */}
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">
          {loading ? (
             <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400"/></div>
          ) : tasks.length === 0 ? (
             <div className="p-10 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <ListTodo size={48} className="mb-4 opacity-20"/>
                <p>No tasks yet. Add one or ask AI to plan your day!</p>
             </div>
          ) : (
             <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {tasks.map(task => (
                   <li key={task.id} className={`p-4 flex items-start group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${task.isCompleted ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                      <button 
                        onClick={() => toggleComplete(task)}
                        className={`mt-1 mr-4 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-green-500 dark:text-green-400' : 'text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400'}`}
                      >
                         {task.isCompleted ? <CheckCircle size={24} className="fill-green-100 dark:fill-green-900/30" /> : <Circle size={24} />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                         <p className={`text-base font-medium transition-all ${task.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.text}
                         </p>
                         {!task.isCompleted && (
                            <div className="flex items-center mt-1">
                               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide mr-2 ${
                                  task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900' :
                                  task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900' :
                                  'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900'
                               }`}>
                                  {task.priority}
                               </span>
                            </div>
                         )}
                      </div>

                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 size={18} />
                      </button>
                   </li>
                ))}
             </ul>
          )}
       </div>

       {/* AI Modal */}
       {showAiModal && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 border-b border-purple-100 dark:border-purple-900/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 flex items-center">
                     <Wand2 size={20} className="mr-2"/> AI Daily Planner
                  </h3>
                  <button onClick={() => setShowAiModal(false)} className="text-purple-300 hover:text-purple-600 dark:hover:text-purple-200"><X size={20}/></button>
               </div>
               
               <div className="p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                     Tell me everything you need to do today. I will organize, prioritize, and create your checklist.
                  </p>
                  <textarea 
                     value={aiPrompt}
                     onChange={(e) => setAiPrompt(e.target.value)}
                     placeholder="e.g. I need to call the director, finish the Q3 report, buy milk, email Sarah about the budget, and review the meeting minutes."
                     className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[150px] resize-none mb-4 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                  />
                  <button 
                     onClick={handleAiPlan}
                     disabled={isAiLoading || !aiPrompt}
                     className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-purple-300 dark:disabled:bg-purple-900 transition-colors flex justify-center items-center shadow-md"
                  >
                     {isAiLoading ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2" size={18}/>}
                     {isAiLoading ? 'Analyzing & Planning...' : 'Generate My Plan'}
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
