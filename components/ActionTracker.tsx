
import React from 'react';
import { ActionItem } from '../types';
import { sendActionReminder } from '../services/mockFirebase';
import { AlertCircle, Clock, CheckCircle, Paperclip, Bell, MoreVertical, CheckSquare, Loader2, Zap, AlertTriangle, Info } from 'lucide-react';

interface ActionTrackerProps {
  actions: ActionItem[];
}

export const ActionTracker: React.FC<ActionTrackerProps> = ({ actions }) => {
  const columns = [
    { id: 'NEW', label: 'Backlog', color: 'text-slate-400' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-500' },
    { id: 'REVIEW', label: 'Institutional Review', color: 'text-amber-500' },
    { id: 'COMPLETED', label: 'Verified Complete', color: 'text-emerald-500' }
  ];

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return { 
          style: 'bg-red-500/10 text-red-600 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]', 
          icon: <Zap size={10} className="mr-1.5 animate-pulse fill-red-600" /> 
        };
      case 'HIGH':
        return { 
          style: 'bg-orange-500/10 text-orange-600 border-orange-500/20', 
          icon: <AlertTriangle size={10} className="mr-1.5" /> 
        };
      case 'MEDIUM':
        return { 
          style: 'bg-amber-500/10 text-amber-600 border-amber-500/20', 
          icon: <Info size={10} className="mr-1.5" /> 
        };
      case 'LOW':
      default:
        return { 
          style: 'bg-blue-500/10 text-blue-600 border-blue-500/20', 
          icon: <CheckCircle size={10} className="mr-1.5" /> 
        };
    }
  };

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      {columns.map(col => {
        const colActions = actions.filter(a => a.status === col.id);
        return (
          <div key={col.id} className="flex-none w-[85vw] md:w-80 flex flex-col snap-center">
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${col.id === 'IN_PROGRESS' ? 'animate-pulse' : ''} ${
                    col.id === 'NEW' ? 'bg-slate-400' : 
                    col.id === 'IN_PROGRESS' ? 'bg-blue-500' : 
                    col.id === 'REVIEW' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{col.label}</h3>
               </div>
               <span className="text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5">
                 {colActions.length}
               </span>
            </div>

            <div className="flex-1 rounded-[2.5rem] p-3 space-y-4 overflow-y-auto no-scrollbar bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 min-h-[400px]">
              {colActions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 opacity-20">
                   <CheckSquare size={32} />
                   <span className="text-[10px] font-black uppercase mt-2">Zero Tasks</span>
                </div>
              )}
              {colActions.map(action => {
                const priorityConfig = getPriorityConfig(action.priority);
                return (
                  <div key={action.id} className="glass-panel p-5 rounded-[2rem] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group active:scale-95 border border-white dark:border-white/5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border flex items-center ${priorityConfig.style}`}>
                        {priorityConfig.icon}
                        {action.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-5">
                      {action.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5">
                       <div className="flex items-center">
                          <div className="w-8 h-8 rounded-2xl bg-blue-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md">
                             {action.assigneeId.slice(0,2).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-3">Node Assigned</span>
                       </div>
                       
                       <div 
                        className="flex items-center space-x-2 text-slate-400 group/tooltip relative cursor-help"
                        title={`DEADLINE PROTOCOL: ${action.deadline} (GMT+0)`}
                       >
                          <Clock size={14} className="group-hover/tooltip:text-blue-500 transition-colors" />
                          <span className="text-[10px] font-black group-hover/tooltip:text-slate-800 dark:group-hover/tooltip:text-slate-200 transition-colors">
                            {action.deadline}
                          </span>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      })}
    </div>
  );
};
