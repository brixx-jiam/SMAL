
import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Meeting, ActionItem, AttendanceRecord } from '../types';
import { ArrowUpRight, DollarSign, Activity, CheckSquare, CalendarRange, Zap, ShieldCheck, TrendingUp, Fingerprint, Languages, Wand2, Sparkles, ChevronRight } from 'lucide-react';

interface DashboardProps {
  meetings: Meeting[];
  actions: ActionItem[];
  attendance: AttendanceRecord[];
  onOpenTranscriber: () => void;
}

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
  <div className="executive-card glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col justify-between min-w-[280px] md:min-w-0 snap-center shadow-xl relative overflow-hidden flex-shrink-0 md:flex-shrink">
    <div className="flex justify-between items-start">
      <div className={`p-4 rounded-3xl bg-slate-50/50 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-sm`}>
        <Icon size={24} className={color} />
      </div>
      <div className={`flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
        {trend > 0 ? <ArrowUpRight size={12} className="mr-1" /> : <Activity size={12} className="mr-1" />}
        {Math.abs(trend)}%
      </div>
    </div>
    
    <div className="mt-8">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{title}</p>
      <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white glow-text tracking-tighter leading-none">{value}</h3>
      <p className="text-[11px] font-bold text-slate-500 mt-4 flex items-center">
        <Fingerprint size={12} className="mr-2 opacity-30" />
        {subtext}
      </p>
    </div>
    
    <div className="absolute -bottom-6 -right-6 opacity-5 scale-150 rotate-12">
      <Icon size={120} />
    </div>
  </div>
);

const TranslationEntryCard = ({ onOpen }: { onOpen: () => void }) => (
  <div 
    onClick={onOpen}
    className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border border-white/10 cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
  >
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-[1s]">
      <Languages size={180} />
    </div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-10">
         <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/10">AI Language Assistant</span>
         </div>
         <Wand2 size={24} className="text-white/30" />
      </div>

      <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase glow-text leading-none max-w-xl">
        Voice Translator <br/>& Text Converter
      </h3>
      <p className="text-xs md:text-sm font-bold text-blue-200/60 uppercase tracking-[0.4em] mb-12">Turn recordings into text and other languages instantly</p>
      
      <div className="flex items-center justify-between">
         <div className="flex -space-x-3">
            {['FR', 'ES', 'AR', 'ZH', 'EN'].map((lang, i) => (
              <div key={lang} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[10px] font-black" style={{ zIndex: 5 - i }}>
                {lang}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-blue-600 border border-white/20 flex items-center justify-center text-[10px] font-black z-0">
               +
            </div>
         </div>
         
         <div className="flex items-center space-x-4 group/btn">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover/btn:text-white transition-colors">Open Translator</span>
            <div className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-xl group-hover/btn:translate-x-2 transition-transform">
               <ChevronRight size={24} />
            </div>
         </div>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ meetings, actions, onOpenTranscriber }) => {
  const stats = useMemo(() => {
    const totalCost = meetings.reduce((sum, m) => sum + (m.currentCost || 0), 0);
    const completed = actions.filter(a => a.status === 'COMPLETED').length;
    const rate = actions.length > 0 ? Math.round((completed / actions.length) * 100) : 0;
    const live = meetings.filter(m => m.status === 'LIVE').length;
    return { totalCost, live, rate };
  }, [meetings, actions]);

  const chartData = useMemo(() => [
    { n: 'MON', v: 45 }, { n: 'TUE', v: 52 }, { n: 'WED', v: 48 }, { n: 'THU', v: 61 }, { n: 'FRI', v: 55 }, { n: 'SAT', v: 67 }, { n: 'SUN', v: 80 }
  ], []);

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-1000 pb-24">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
         <div className="space-y-2">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white glow-text leading-none">
               OVERVIEW
            </h2>
            <div className="flex items-center space-x-4">
               <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
               <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Institutional HUD // LIVE ACCESS</p>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <div className="glass-panel px-6 py-3 rounded-2xl flex items-center space-x-4 border-slate-200/50 dark:border-white/5">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Network: 100%</span>
            </div>
         </div>
      </div>

      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 overflow-x-auto pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory no-scrollbar">
        <StatCard title="Fiscal Aggregate" value={`SLE ${(stats.totalCost/1000).toFixed(1)}K`} subtext="Institutional Spend" icon={DollarSign} color="text-emerald-500" trend={12.4} />
        <StatCard title="Process Velocity" value={`${stats.rate}%`} subtext="Resolution Index" icon={CheckSquare} color="text-indigo-500" trend={-2.1} />
        <StatCard title="Live Sessions" value={stats.live} subtext="Active Node Meetings" icon={Zap} color={stats.live > 0 ? "text-red-500" : "text-slate-400"} trend={0} />
        <StatCard title="Data Artifacts" value={meetings.length} subtext="Verified Records" icon={TrendingUp} color="text-cyan-500" trend={18.9} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-8 space-y-12">
          <TranslationEntryCard onOpen={onOpenTranscriber} />
          
          <div className="glass-panel p-10 md:p-14 rounded-[3.5rem] md:rounded-[4.5rem] shadow-2xl bg-white dark:bg-slate-900 border-white/20">
             <div className="flex justify-between items-center mb-12">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-blue-600 rounded-2xl text-white">
                      <CalendarRange size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Strategic Pulse</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Capacity Forecast</p>
                   </div>
                </div>
             </div>
             
             <div className="w-full h-[400px] min-h-[400px] relative">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                      <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                      <YAxis hide />
                      <Tooltip contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}} />
                      <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#colorGov)" strokeWidth={4} animationDuration={1500} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="glass-panel p-10 rounded-[3.5rem] shadow-2xl bg-white dark:bg-slate-900 border-white/20">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 flex items-center">
               <Activity size={20} className="mr-3 text-blue-600"/> Velocity Analytics
             </h3>
             <div className="w-full h-[300px] min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData.slice(0, 5)} layout="vertical" margin={{ left: -10, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="n" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} width={60} />
                      <Bar dataKey="v" radius={[0, 20, 20, 0]} barSize={24} animationDuration={1500}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                        ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="glass-panel p-10 rounded-[3.5rem] shadow-2xl bg-slate-900 text-white border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"></div>
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h4 className="text-lg font-black uppercase tracking-tighter">Security Feed</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Log v4.1</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl">
                   <ShieldCheck size={24} className="text-emerald-500" />
                </div>
             </div>
             
             <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 group-hover:translate-x-1">
                     <div className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></div>
                        <span className="text-[10px] font-mono text-slate-400">0x{Math.random().toString(16).slice(2,8)}</span>
                     </div>
                     <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Verified</span>
                  </div>
                ))}
             </div>
             
             <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 transition-all">
                Access Audit Logs
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
