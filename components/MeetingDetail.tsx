import React, { useState, useEffect } from 'react';
import { Meeting, MeetingStatus, User, MeetingMinutes, AttendanceRecord } from '../types';
import { updateMeeting, getUsers, getAttendance, markAttendanceRecord } from '../services/supabase';
import { generateMeetingMinutes } from '../services/geminiService';
import { 
  ArrowLeft, Calendar, MapPin, Users, Clock, 
  FileText, Wand2, Loader2, CheckCircle, 
  ShieldCheck, Zap, Plus, Trash2, Edit3, Save, MessageSquare,
  UserCheck, UserMinus, ShieldAlert, Banknote, 
  Target, Activity, Fingerprint, QrCode, Database,
  X, Shield, Hash
} from 'lucide-react';

interface MeetingDetailProps {
  meeting: Meeting;
  canEdit: boolean;
  onBack: () => void;
  onUpdateMeeting: () => void;
  onAddAction: () => void;
  isOffline: boolean;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({ 
  meeting, onBack, onUpdateMeeting 
}) => {
  const [activeView, setActiveView] = useState<'RECORD' | 'ATTENDANCE'>('RECORD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [minutes, setMinutes] = useState<MeetingMinutes | undefined>(meeting.minutes);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [aiDirective, setAiDirective] = useState('');
  const [meetingCost, setMeetingCost] = useState<number>(meeting.currentCost || 0);

  // Attendance Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState<User | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'QR' | 'BIOMETRIC' | 'BLOCKCHAIN' | null>(null);
  const [verificationStep, setVerificationStep] = useState<'SELECT' | 'PROCESS' | 'SUCCESS'>('SELECT');
  const [vHash, setVHash] = useState('');

  useEffect(() => {
    getUsers().then(setAllUsers);
    refreshAttendance();
  }, [meeting.id]);

  const refreshAttendance = async () => {
    const data = await getAttendance(meeting.id);
    setAttendance(data);
  };

  const handleGenerateMinutes = async () => {
    if (!meeting.transcript) return;
    setIsGenerating(true);
    try {
      const generatedMinutes = await generateMeetingMinutes(meeting.transcript, aiDirective);
      const refinedActionItems = generatedMinutes.actionItems.map(item => {
        const foundUser = allUsers.find(u => 
          u.name.toLowerCase().includes((item.assigneeId || '').toLowerCase())
        );
        return { ...item, assigneeId: foundUser ? foundUser.id : '' };
      });
      setMinutes({ ...generatedMinutes, actionItems: refinedActionItems });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveMeeting = async () => {
    setIsSaving(true);
    try {
      await updateMeeting(meeting.id, { 
        minutes, 
        currentCost: meetingCost,
        status: minutes ? MeetingStatus.COMPLETED : meeting.status 
      });
      onUpdateMeeting();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const startVerification = (user: User) => {
    setVerifyingUser(user);
    setVerificationStep('SELECT');
    setVerificationMethod(null);
    setIsVerifying(true);
  };

  const processVerification = async (method: 'QR' | 'BIOMETRIC' | 'BLOCKCHAIN') => {
    setVerificationMethod(method);
    setVerificationStep('PROCESS');
    await new Promise(r => setTimeout(r, 2000));
    setVHash('0x' + Math.random().toString(16).slice(2, 10).toUpperCase() + '...' + Math.random().toString(16).slice(2, 6).toUpperCase());
    
    if (verifyingUser) {
      // Map extended verify methods to enum if needed, or stick to enum. 
      // Using MANUAL as fallback for simulation if not in schema.
      await markAttendanceRecord({
        meetingId: meeting.id,
        userId: verifyingUser.id,
        status: 'PRESENT',
        method: method === 'QR' ? 'QR' : 'MANUAL'
      });
    }

    setVerificationStep('SUCCESS');
    await new Promise(r => setTimeout(r, 1500));
    setIsVerifying(false);
    refreshAttendance();
  };

  const addActionItem = () => {
    if (!minutes) return;
    const newItem = {
      description: '',
      assigneeId: '',
      deadline: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM' as const
    };
    setMinutes({ ...minutes, actionItems: [...minutes.actionItems, newItem] });
  };

  const removeActionItem = (index: number) => {
    if (!minutes) return;
    const newList = minutes.actionItems.filter((_, i) => i !== index);
    setMinutes({ ...minutes, actionItems: newList });
  };

  const updateActionItemField = (index: number, field: keyof MeetingMinutes['actionItems'][0], value: any) => {
    if (!minutes) return;
    const newList = [...minutes.actionItems];
    newList[index] = { ...newList[index], [field]: value };
    setMinutes({ ...minutes, actionItems: newList });
  };

  const attendanceStats = {
    present: attendance.filter(a => a.status === 'PRESENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
    excused: attendance.filter(a => a.status === 'EXCUSED').length,
    total: meeting.attendees.length
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="flex items-center px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all">
            <ArrowLeft size={12} className="mr-1.5" /> Back
          </button>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
          <div className="flex bg-slate-100/50 dark:bg-black/20 p-1 rounded-xl">
              <button onClick={() => setActiveView('RECORD')} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'RECORD' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                Artifact
              </button>
              <button onClick={() => setActiveView('ATTENDANCE')} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'ATTENDANCE' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                Attendance
              </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${meeting.status === MeetingStatus.LIVE ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}>
             {meeting.status}
           </span>
           <button onClick={handleSaveMeeting} disabled={isSaving} className="flex items-center px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10">
              {isSaving ? <Loader2 size={12} className="animate-spin mr-1.5"/> : <Save size={12} className="mr-1.5" />}
              Commit
           </button>
        </div>
      </div>

      {activeView === 'RECORD' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-4">
             <div className="glass-panel p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-6">
                   <div>
                     <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{meeting.title}</h2>
                     <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">Institutional meeting node</p>
                   </div>
                   <ShieldCheck className="text-blue-600/20" size={24} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
                   <div className="space-y-0.5 text-xs">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="font-bold dark:text-white flex items-center"><Calendar size={10} className="mr-1.5 text-blue-500"/> {meeting.date}</p>
                   </div>
                   <div className="space-y-0.5 text-xs">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mark</p>
                      <p className="font-bold dark:text-white flex items-center"><Clock size={10} className="mr-1.5 text-blue-500"/> {meeting.startTime}</p>
                   </div>
                   <div className="space-y-0.5 text-xs">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sector</p>
                      <p className="font-bold dark:text-white flex items-center truncate max-w-[100px]"><MapPin size={10} className="mr-1.5 text-blue-500"/> {meeting.location}</p>
                   </div>
                   <div className="space-y-0.5 text-xs">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nodes</p>
                      <p className="font-bold dark:text-white flex items-center"><Users size={10} className="mr-1.5 text-blue-500"/> {meeting.attendees?.length || 0} Unified</p>
                   </div>
                </div>
                <div className="py-4 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg"><Banknote size={16} className="text-emerald-500"/></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fiscal Trace (SLE)</p>
                        <input type="number" value={meetingCost} onChange={(e) => setMeetingCost(parseFloat(e.target.value) || 0)} className="bg-transparent border-none p-0 text-xs font-black dark:text-white outline-none focus:ring-0 w-24" />
                      </div>
                   </div>
                   <div className="h-8 w-[1px] bg-slate-100 dark:bg-white/5"></div>
                   <div className="flex items-center space-x-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Aggregate</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">SLE {meetingCost.toLocaleString()}</p>
                   </div>
                </div>
                <div className="mt-2">
                   <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center"><FileText size={12} className="mr-1.5 text-blue-500"/> Verbatim Trace</h3>
                   </div>
                   <textarea className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5 font-mono text-[10px] leading-relaxed text-slate-600 dark:text-slate-300 h-40 overflow-y-auto no-scrollbar outline-none focus:ring-1 ring-blue-500/20" value={meeting.transcript || ''} readOnly />
                </div>
                <div className="mt-4 space-y-3">
                   <div className="relative group">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={12} />
                      <input type="text" value={aiDirective} onChange={(e) => setAiDirective(e.target.value)} placeholder="Special AI Directive..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-blue-500/40 transition-all dark:text-white" />
                   </div>
                   <button onClick={handleGenerateMinutes} disabled={isGenerating || !meeting.transcript} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] shadow-lg flex items-center justify-center transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-30">
                      {isGenerating ? <Loader2 className="animate-spin mr-2" size={14}/> : <><Wand2 size={14} className="mr-2"/> Initiate Synthesis</>}
                   </button>
                </div>
             </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
             {isGenerating ? (
               <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white/40 dark:bg-slate-900/40 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10">
                  <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
                  <p className="text-[9px] font-black uppercase tracking-widest animate-pulse">Synthesis in progress...</p>
               </div>
             ) : minutes ? (
               <div className="space-y-4 animate-in slide-in-from-right-2 duration-500">
                  <section className="glass-panel p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50">
                     <div className="flex items-center justify-between mb-3 text-xs">
                        <h4 className="font-black uppercase text-emerald-500 tracking-widest flex items-center"><CheckCircle size={12} className="mr-1.5"/> Summary</h4>
                        <Edit3 size={10} className="text-slate-300" />
                     </div>
                     <textarea value={minutes.summary} onChange={(e) => setMinutes({...minutes, summary: e.target.value})} className="w-full bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed outline-none border-none resize-none h-24 no-scrollbar" />
                  </section>
                  <section className="glass-panel p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[9px] font-black uppercase text-amber-500 tracking-widest flex items-center"><Zap size={12} className="mr-1.5"/> Directives</h4>
                        <button onClick={addActionItem} className="p-1 bg-amber-500/10 text-amber-600 rounded-lg hover:bg-amber-500/20 transition-all"><Plus size={14}/></button>
                     </div>
                     <div className="space-y-3">
                        {minutes.actionItems.map((action, idx) => (
                           <div key={idx} className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 relative group transition-all hover:bg-slate-100/50 dark:hover:bg-white/5">
                              <button onClick={() => removeActionItem(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                              <textarea value={action.description} onChange={(e) => updateActionItemField(idx, 'description', e.target.value)} className="w-full bg-transparent text-[10px] font-black dark:text-white outline-none resize-none border-none leading-snug mb-2 no-scrollbar" rows={2} placeholder="DIRECTIVE DESCRIPTION..." />
                              <div className="flex items-center space-x-2">
                                 <select value={action.assigneeId || ''} onChange={(e) => updateActionItemField(idx, 'assigneeId', e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-lg px-2 py-1 text-[9px] font-black uppercase outline-none dark:text-white">
                                    <option value="">NODE...</option>
                                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                 </select>
                                 <select value={action.priority} onChange={(e) => updateActionItemField(idx, 'priority', e.target.value)} className="w-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-lg px-2 py-1 text-[9px] font-black uppercase outline-none dark:text-white">
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MED</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="CRITICAL">U-0</option>
                                 </select>
                              </div>
                           </div>
                        ))}
                        {minutes.actionItems.length === 0 && (
                          <div className="py-8 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                             <Target size={24} />
                             <p className="text-[8px] font-black uppercase tracking-widest mt-2">No directives logged</p>
                          </div>
                        )}
                     </div>
                  </section>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full min-h-[400px] opacity-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">
                  <Activity size={40} className="mb-2 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Meeting Staging Area</p>
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 space-y-4">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Present', value: attendanceStats.present, color: 'text-emerald-500', icon: UserCheck },
                { label: 'Late', value: attendanceStats.late, color: 'text-amber-500', icon: Clock },
                { label: 'Excused', value: attendanceStats.excused, color: 'text-blue-500', icon: UserMinus },
                { label: 'Quorum', value: `${Math.round((attendanceStats.present / (attendanceStats.total || 1)) * 100)}%`, color: 'text-indigo-500', icon: ShieldAlert }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                   <div className="flex justify-between items-center mb-1">
                      <stat.icon size={14} className={stat.color} />
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</span>
                   </div>
                   <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                   <thead className="bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-6 py-4 text-left">Node Identification</th>
                         <th className="px-6 py-4 text-left">Sector ID</th>
                         <th className="px-6 py-4 text-left">Protocol Status</th>
                         <th className="px-6 py-4 text-right">Verification</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {meeting.attendees.map(userId => {
                        const user = allUsers.find(u => u.id === userId);
                        const record = attendance.find(a => a.userId === userId);
                        return (
                          <tr key={userId} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                             <td className="px-6 py-3">
                                <div className="flex items-center">
                                   <div className="w-8 h-8 rounded-lg mr-3 bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                                      <img src={user?.avatar} className="w-full h-full object-cover" alt="AV" />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black dark:text-white uppercase tracking-tight">{user?.name || 'Syncing...'}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">{user?.department || 'Sector Zero'}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-3 font-mono text-[9px] text-slate-500 uppercase">#{userId.slice(-6)}</td>
                             <td className="px-6 py-3">
                                {record ? (
                                  <div className="flex flex-col">
                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border w-fit ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : record.status === 'LATE' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                      {record.status}
                                    </span>
                                    <span className="text-[7px] font-black text-slate-400 uppercase mt-1 flex items-center">
                                      via {record.method} protocol
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border bg-rose-50 text-rose-500 border-rose-100 animate-pulse">Missing</span>
                                )}
                             </td>
                             <td className="px-6 py-3 text-right">
                                {!record ? (
                                  <button onClick={() => user && startVerification(user)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95">
                                    Verify Node
                                  </button>
                                ) : (
                                  <span className="text-emerald-500"><CheckCircle size={16} className="ml-auto" /></span>
                                )}
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {isVerifying && verifyingUser && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setIsVerifying(false)}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-8 md:p-12">
                 <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center space-x-4">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 p-0.5 shadow-2xl">
                          <img src={verifyingUser.avatar} className="w-full h-full object-cover rounded-[1.4rem]" alt="PR"/>
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{verifyingUser.name}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center"><Shield size={10} className="mr-1.5 text-blue-500"/> Personnel Authenticity Verification</p>
                       </div>
                    </div>
                    <button onClick={() => setIsVerifying(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={20} /></button>
                 </div>

                 {verificationStep === 'SELECT' && (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: 'QR', label: 'QR Scan', icon: QrCode, color: 'text-blue-500', desc: 'Secure node ID scan' },
                            { id: 'BIOMETRIC', label: 'Fingerprint', icon: Fingerprint, color: 'text-indigo-500', desc: 'Neural biometric check' },
                            { id: 'BLOCKCHAIN', label: 'Ledger Verify', icon: Database, color: 'text-emerald-500', desc: 'Distributed signature' }
                          ].map(opt => (
                            <button key={opt.id} onClick={() => processVerification(opt.id as any)} className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] flex flex-col items-center text-center group transition-all hover:bg-white dark:hover:bg-blue-600 hover:shadow-2xl hover:scale-[1.02]">
                               <opt.icon size={32} className={`mb-4 ${opt.color} group-hover:text-white transition-colors`} />
                               <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest group-hover:text-white">{opt.label}</span>
                               <span className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest group-hover:text-white/60">{opt.desc}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                 )}

                 {verificationStep === 'PROCESS' && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                       <div className="relative mb-10">
                          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
                          {verificationMethod === 'BIOMETRIC' ? (
                            <div className="relative">
                               <Fingerprint size={120} className="text-blue-600 animate-pulse" />
                               <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 animate-[scan-line_2s_ease-in-out_infinite] blur-sm"></div>
                            </div>
                          ) : verificationMethod === 'QR' ? (
                             <QrCode size={120} className="text-blue-600 animate-pulse" />
                          ) : (
                             <Database size={120} className="text-blue-600 animate-pulse" />
                          )}
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Running {verificationMethod} Protocol...</p>
                       <div className="mt-8 flex items-center space-x-2 text-[9px] font-mono text-slate-500">
                          <Loader2 size={12} className="animate-spin" />
                          <span>SYNCHRONIZING WITH SOVEREIGN CLOUD</span>
                       </div>
                    </div>
                 )}

                 {verificationStep === 'SUCCESS' && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-700 text-center">
                       <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20"><CheckCircle size={48} className="text-emerald-500" /></div>
                       <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Protocol Verified</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Attendance successfully committed to institutional archive.</p>
                       <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 w-full max-w-sm">
                          <div className="flex justify-between items-center mb-3 text-xs uppercase">
                             <span className="font-black text-slate-400 tracking-widest">Transaction Hash</span>
                             <Hash size={10} className="text-blue-500" />
                          </div>
                          <p className="font-mono text-[9px] text-blue-600 dark:text-blue-400 break-all leading-relaxed uppercase">{vHash}</p>
                       </div>
                    </div>
                 )}
              </div>
              <div className="px-8 py-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                 <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Node ID: {verifyingUser.id}</span>
                 <div className="flex items-center space-x-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Institutional Chain Certified</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};