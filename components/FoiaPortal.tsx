
import React, { useState, useEffect } from 'react';
import { FoiaRequest, Meeting } from '../types';
import { getMeetings, getFoiaRequests } from '../services/supabase';
import { 
  Search, Eye, Filter, CheckCircle, Clock, 
  AlertTriangle, ExternalLink, ShieldCheck, 
  Mail, Loader2, Download, Landmark, 
  Fingerprint, ChevronRight, Activity, FileText
} from 'lucide-react';

export const FoiaPortal = () => {
  const [requests, setRequests] = useState<FoiaRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [reqs, mtgs] = await Promise.all([getFoiaRequests(), getMeetings()]);
      setRequests(reqs);
      setMeetings(mtgs);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'RELEASED': return { label: 'Released', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' };
      case 'PENDING': return { label: 'Pending', color: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' };
      case 'REDACTION_NEEDED': return { label: 'Redaction', color: 'text-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500 animate-pulse' };
      case 'REJECTED': return { label: 'Rejected', color: 'text-rose-500', bg: 'bg-rose-500/10', dot: 'bg-rose-500' };
      default: return { label: status, color: 'text-slate-500', bg: 'bg-slate-500/10', dot: 'bg-slate-500' };
    }
  };

  const filteredRequests = requests.filter(r => 
    r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.organization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      
      {/* Concise Header HUD */}
      <header className="px-4 md:px-0 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Transparency</h2>
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-2 px-2 py-0.5 bg-blue-500/5 rounded-full border border-blue-500/10 w-fit">
                <Activity size={10} className="text-blue-500" />
                <span className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">FOIA OVERWATCH ACTIVE</span>
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System v2.4.1</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0 w-full lg:w-auto">
           {[
             { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length, color: 'text-blue-500' },
             { label: 'Compliance', value: '92%', color: 'text-emerald-500' },
             { label: 'Avg Speed', value: '3.2d', color: 'text-amber-500' }
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-3 shadow-sm shrink-0 min-w-[120px]">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
             </div>
           ))}
        </div>
      </header>

      {/* Sleek Control Bar */}
      <div className="px-4 md:px-0 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Scan Request Index..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm dark:text-white"
          />
        </div>
        <button className="h-[48px] px-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center transition-all active:scale-95 shrink-0">
          <Filter size={16} className="mr-2"/> Redaction Audit
        </button>
      </div>

      {/* High-Fidelity Request Grid/List */}
      <div className="px-4 md:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>
        ) : filteredRequests.map((req) => {
          const status = getStatusConfig(req.status);
          return (
            <div 
              key={req.id}
              className="group bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5">
                      <Landmark size={20} />
                   </div>
                   <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                      <div className={`w-1 h-1 rounded-full ${status.dot}`}></div>
                      <span>{status.label}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{req.id}</h3>
                    <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight line-clamp-1">{req.requesterName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{req.organization}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 dark:border-white/5">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filed On</p>
                        <p className="text-[10px] font-bold dark:text-white flex items-center"><Clock size={10} className="mr-1.5 text-blue-500"/> {req.requestDate}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                        <p className="text-[10px] font-bold dark:text-white flex items-center justify-end"><Clock size={10} className="mr-1.5 text-rose-500"/> {req.dueDate}</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                 <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Fingerprint size={12} className="mr-1.5 text-blue-500" /> Secure Case
                 </div>
                 <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                       <Eye size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-90 transition-all">
                       <ExternalLink size={16} />
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
        
        {!isLoading && filteredRequests.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30">
             <FileText size={40} className="mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest text-center">No Disclosure Records Matching Query</p>
          </div>
        )}
      </div>

      {/* Action Prompt - High visibility but compact */}
      <div className="px-4 md:px-0">
         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="text-center md:text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight">Institutional Integrity Archive</h3>
                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-2">All disclosed minutes are encrypted and timestamped via Sovereign Core.</p>
               </div>
               <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center transition-all hover:scale-[1.02] active:scale-95">
                  Access Public Vault <ChevronRight size={16} className="ml-2" />
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};
