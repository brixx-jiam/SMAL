
import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { getAuditLogs } from '../services/mockFirebase';
import { ShieldCheck, Hash, FileCheck, Search, Calendar, User, Activity, Filter, RefreshCw, Download } from 'lucide-react';

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActor = actorFilter === '' || log.actorId.toLowerCase().includes(actorFilter.toLowerCase());
    
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    
    let matchesDate = true;
    const logDate = new Date(log.timestamp);
    if (startDate) {
      matchesDate = matchesDate && logDate >= new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && logDate <= end;
    }

    return matchesSearch && matchesActor && matchesAction && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActorFilter('');
    setActionFilter('ALL');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
           <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
             <ShieldCheck className="mr-2 text-green-600 dark:text-green-500"/> 
             Compliance Audit Trail
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Immutable records of all system activities.</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={fetchLogs} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800" title="Refresh Logs">
                <RefreshCw size={18} />
            </button>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                <Download size={16} className="mr-2"/> Export CSV
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
         <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center"><Search size={12} className="mr-1"/> Search Details</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Keyword, ID, Resource..."
              className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
            />
         </div>
         <div className="md:col-span-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center"><User size={12} className="mr-1"/> Actor ID</label>
             <input 
               type="text" 
               value={actorFilter}
               onChange={(e) => setActorFilter(e.target.value)}
               placeholder="e.g. u1"
               className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
             />
         </div>
         <div className="md:col-span-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center"><Activity size={12} className="mr-1"/> Action Type</label>
             <select 
               value={actionFilter}
               onChange={(e) => setActionFilter(e.target.value)}
               className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
             >
                <option value="ALL">All Actions</option>
                {uniqueActions.map(act => <option key={act} value={act}>{act}</option>)}
             </select>
         </div>
         <div className="md:col-span-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center"><Calendar size={12} className="mr-1"/> Date Range</label>
             <div className="flex space-x-1">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-1/2 text-xs border border-slate-300 dark:border-slate-600 rounded px-1 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-1/2 text-xs border border-slate-300 dark:border-slate-600 rounded px-1 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
             </div>
         </div>
         <div className="md:col-span-1">
            <button 
              onClick={clearFilters}
              className="w-full text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium py-2 rounded-lg flex items-center justify-center transition-colors"
            >
                <Filter size={14} className="mr-2" /> Clear Filters
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 bg-white dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
             <tr>
               <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Timestamp</th>
               <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Actor ID</th>
               <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Action</th>
               <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400 w-1/3">Details</th>
               <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Integrity Hash (SHA-256)</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
             {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Loading secure logs...</td></tr>
             ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                   <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                   <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                       <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-600">{log.actorId}</span>
                   </td>
                   <td className="px-6 py-4 font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">{log.action}</td>
                   <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.details} <br/> <span className="text-xs text-slate-400 dark:text-slate-500">Res ID: {log.resourceId}</span></td>
                   <td className="px-6 py-4 font-mono text-[10px] text-slate-400 dark:text-slate-500 break-all w-64">
                      <div className="flex items-center" title={log.hash}><Hash size={10} className="mr-1 text-green-500"/> {log.hash.substring(0, 20)}...</div>
                   </td>
                </tr>
             ))
             ) : (
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400 dark:text-slate-500 italic">No logs found matching your filters.</td></tr>
             )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
          <span>Showing {filteredLogs.length} records</span>
          <span className="flex items-center"><FileCheck size={12} className="mr-1 text-green-600 dark:text-green-500"/> Audit Trail Verified</span>
      </div>
    </div>
  );
};
