
import React, { useState } from 'react';
import { Search, FileText, ChevronRight, Filter, Sparkles, MessageSquare } from 'lucide-react';
import { Meeting, ActionItem } from '../types';
import { searchKnowledgeBase } from '../services/mockFirebase';
import { queryKnowledgeBase } from '../services/geminiService';

export const KnowledgeBase = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ meetings: Meeting[], actions: ActionItem[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setAiAnswer(null);
    
    // 1. Search DB
    const res = await searchKnowledgeBase(query);
    setResults(res);
    setLoading(false);

    // 2. Ask AI
    if (res.meetings.length > 0 || res.actions.length > 0) {
      setIsAiAnswering(true);
      
      // Build context from results
      let context = "";
      res.meetings.forEach(m => {
        context += `Meeting: ${m.title} (Date: ${m.date})\nSummary: ${m.minutes?.summary || 'N/A'}\nDecisions: ${m.minutes?.decisions.join(', ') || 'None'}\n\n`;
      });
      res.actions.forEach(a => {
        context += `Action: ${a.description} (Status: ${a.status}, Assignee: ${a.assigneeId})\n`;
      });

      const answer = await queryKnowledgeBase(query, context);
      setAiAnswer(answer);
      setIsAiAnswering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Knowledge Intelligence Engine</h2>
        <p className="text-slate-500 dark:text-slate-400">Semantic search and AI synthesis across all institutional memory.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400" />
         </div>
         <input 
           type="text" 
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           placeholder="Search for 'Budget cuts', 'Project Alpha', or ask a question..." 
           className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
         />
         <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-full font-medium hover:bg-blue-700 transition-colors">
            {loading ? 'Searching...' : 'Search'}
         </button>
      </form>

      {/* AI Answer Section */}
      {(isAiAnswering || aiAnswer) && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mt-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
           <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center">
             <Sparkles className="mr-2 text-indigo-600 dark:text-indigo-400" size={20}/> AI Synthesis
           </h3>
           {isAiAnswering ? (
             <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></span>
                <span className="text-sm font-medium ml-2">Analyzing records...</span>
             </div>
           ) : (
             <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                <p>{aiAnswer}</p>
             </div>
           )}
        </div>
      )}

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4">
           <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center"><FileText className="mr-2"/> Relevant Meetings</h3>
              {results.meetings.length > 0 ? (
                <div className="space-y-4">
                  {results.meetings.map(m => (
                    <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md cursor-pointer transition-shadow">
                       <h4 className="font-bold text-blue-600 dark:text-blue-400">{m.title}</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{m.date} • {m.organizerId}</p>
                       <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{m.minutes?.summary || "No summary available."}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-500 dark:text-slate-400 italic">No meetings found.</p>}
           </div>

           <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center"><Filter className="mr-2"/> Related Decisions & Actions</h3>
              {results.actions.length > 0 ? (
                 <div className="space-y-4">
                    {results.actions.map(a => (
                       <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between items-start">
                             <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{a.description}</p>
                             <span className={`text-[10px] px-2 py-1 rounded font-bold ${a.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                {a.status}
                             </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Assigned to: {a.assigneeId}</p>
                       </div>
                    ))}
                 </div>
              ) : <p className="text-slate-500 dark:text-slate-400 italic">No actions found.</p>}
           </div>
        </div>
      )}
    </div>
  );
};
