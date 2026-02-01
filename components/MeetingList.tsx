
import React, { useState, useMemo } from 'react';
import { Meeting, MeetingStatus, User } from '../types';
import { 
  Plus, MapPin, ChevronRight, Activity, Calendar, Clock, Layers, X, Sparkles, Loader2, Trash2, UserPlus, Users, Search as SearchIcon, Shield
} from 'lucide-react';
import { generateMeetingAgenda } from '../services/geminiService';

interface MeetingListProps {
  meetings: Meeting[];
  canManage: boolean;
  currentUser: User;
  allUsers: User[];
  onSelectMeeting: (meeting: Meeting) => void;
  onCreateMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({ 
  meetings, currentUser, allUsers, onSelectMeeting, onCreateMeeting, onDeleteMeeting 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [personnelSearch, setPersonnelSearch] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: 'Sovereign Boardroom',
    agenda: [] as string[],
    attendees: [currentUser.id]
  });

  const handleGenerateAgenda = async () => {
    if (!formData.title.trim()) return;
    setIsGeneratingAgenda(true);
    try {
      const suggestedAgenda = await generateMeetingAgenda(formData.title);
      setFormData(prev => ({ ...prev, agenda: suggestedAgenda }));
    } catch (error) {
      console.error("Agenda generation failed:", error);
    } finally {
      setIsGeneratingAgenda(false);
    }
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const toggleAttendee = (userId: string) => {
    setFormData(prev => {
      if (prev.attendees.includes(userId)) {
        if (userId === currentUser.id) return prev;
        return { ...prev, attendees: prev.attendees.filter(id => id !== userId) };
      } else {
        return { ...prev, attendees: [...prev.attendees, userId] };
      }
    });
  };

  const filteredPersonnel = useMemo(() => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(personnelSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(personnelSearch.toLowerCase())
    );
  }, [allUsers, personnelSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMtg: Meeting = {
      id: `m${Date.now()}`,
      ...formData,
      status: MeetingStatus.SCHEDULED,
      organizerId: currentUser.id,
      qrCodeUrl: '',
    };
    onCreateMeeting(newMtg);
    setShowModal(false);
    setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        location: 'Sovereign Boardroom',
        agenda: [] as string[],
        attendees: [currentUser.id]
      });
  };

  const getStatusConfig = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.LIVE: return { label: 'Live', color: 'text-rose-500', bg: 'bg-rose-500/10', dot: 'bg-rose-500 animate-pulse' };
      case MeetingStatus.SCHEDULED: return { label: 'Scheduled', color: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' };
      default: return { label: 'Archived', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' };
    }
  };

  const handleDelete = (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    if (window.confirm(`PROTOCOL PURGE: Delete meeting "${meeting.title}"? All associated minutes, tasks, and records will be destroyed.`)) {
      onDeleteMeeting(meeting.id);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1000px] mx-auto animate-in fade-in duration-500">
      
      <header className="px-4 md:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Ops Center</h2>
          <div className="flex items-center space-x-2 px-2 py-0.5 bg-blue-500/5 rounded-full border border-blue-500/10 w-fit">
              <Activity size={10} className="text-blue-500" />
              <span className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">{meetings.length} NODES ACTIVE</span>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="h-[44px] px-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center transition-all active:scale-95"
        >
          <Plus size={16} className="mr-2"/> New Meeting
        </button>
      </header>

      <div className="px-4 md:px-0 space-y-3">
        {meetings.map((meeting) => {
          const status = getStatusConfig(meeting.status);
          return (
            <div 
              key={meeting.id} 
              onClick={() => onSelectMeeting(meeting)}
              className="group bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            >
              <div className="p-4 md:p-5 flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-900 dark:text-white border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black">{meeting.startTime}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{meeting.date.split('-')[1]}/{meeting.date.split('-')[2]}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-1">{meeting.title}</h3>
                  <div className="flex items-center space-x-4">
                     <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <MapPin size={12} className="mr-1.5 text-blue-500" /> {meeting.location}
                     </div>
                     <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                        <div className={`w-1 h-1 rounded-full ${status.dot}`}></div>
                        <span>{status.label}</span>
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => handleDelete(e, meeting)}
                    className="p-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Purge Meeting Record"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {meetings.length === 0 && (
          <div className="py-20 flex flex-col items-center opacity-30">
             <Layers size={40} className="mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">Meeting Index Empty</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-[5000] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl my-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">New Meeting</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Identification</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="MEETING TITLE" 
                    className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl outline-none dark:text-white font-black text-xs uppercase pr-12 focus:ring-2 ring-blue-500/20 transition-all" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={handleGenerateAgenda}
                    disabled={isGeneratingAgenda || !formData.title.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all disabled:opacity-30"
                    title="AI Suggested Agenda"
                  >
                    {isGeneratingAgenda ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Calendar Node</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl outline-none dark:text-white font-bold text-[10px] focus:ring-2 ring-blue-500/20 transition-all" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Spatial Sector</label>
                    <input type="text" placeholder="SECTOR" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl outline-none dark:text-white font-bold text-[10px] uppercase focus:ring-2 ring-blue-500/20 transition-all" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <Users size={12} className="mr-1.5" /> Personnel Nodes
                   </label>
                   <button 
                     type="button"
                     onClick={() => setIsInviting(!isInviting)}
                     className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                   >
                      <UserPlus size={10} className="mr-1" /> Invite
                   </button>
                </div>
                
                {isInviting && (
                   <div className="bg-slate-50 dark:bg-black/30 rounded-xl p-3 border border-blue-200/20 animate-in slide-in-from-top-2">
                      <div className="relative mb-3">
                         <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                         <input 
                           type="text" 
                           placeholder="Search personnel index..." 
                           value={personnelSearch}
                           onChange={(e) => setPersonnelSearch(e.target.value)}
                           className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase outline-none border border-slate-200 dark:border-slate-700"
                         />
                      </div>
                      <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1">
                         {filteredPersonnel.map(u => {
                            const isSelected = formData.attendees.includes(u.id);
                            return (
                               <button
                                 key={u.id}
                                 type="button"
                                 onClick={() => toggleAttendee(u.id)}
                                 className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                               >
                                  <div className="flex items-center space-x-2">
                                     <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black shrink-0 overflow-hidden">
                                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                     </div>
                                     <span className="text-[9px] font-black uppercase truncate">{u.name}</span>
                                  </div>
                                  <span className="text-[7px] font-bold opacity-60 uppercase">{u.department}</span>
                               </button>
                            );
                         })}
                      </div>
                   </div>
                )}

                <div className="flex flex-wrap gap-2">
                   {formData.attendees.map(id => {
                      const u = allUsers.find(user => user.id === id);
                      if (!u) return null;
                      return (
                         <div key={id} className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-1 rounded-lg">
                            <span className="text-[8px] font-black text-slate-600 dark:text-slate-300 uppercase mr-2">{u.name}</span>
                            {id !== currentUser.id && (
                               <button type="button" onClick={() => toggleAttendee(id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                  <X size={10} />
                               </button>
                            )}
                         </div>
                      );
                   })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    <span>Meeting Agenda</span>
                    {formData.agenda.length > 0 && <span className="text-blue-500">{formData.agenda.length} Items</span>}
                </label>
                
                <div className={`space-y-2 max-h-48 overflow-y-auto no-scrollbar rounded-xl ${formData.agenda.length > 0 ? 'bg-slate-50 dark:bg-black/10 p-2' : ''}`}>
                    {formData.agenda.map((item, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm animate-in slide-in-from-bottom-2">
                            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 leading-tight flex-1">{item}</span>
                            <button 
                                type="button" 
                                onClick={() => removeAgendaItem(idx)}
                                className="ml-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {formData.agenda.length === 0 && !isGeneratingAgenda && (
                        <div className="py-8 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-40">
                             <Sparkles size={20} className="mb-2" />
                             <p className="text-[8px] font-black uppercase tracking-widest text-center px-4">Enter title and tap sparkles for AI suggested agenda</p>
                        </div>
                    )}
                    {isGeneratingAgenda && (
                        <div className="py-8 border-2 border-dashed border-blue-100 dark:border-blue-900/30 rounded-2xl flex flex-col items-center justify-center">
                             <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
                             <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Synthesizing Meeting...</p>
                        </div>
                    )}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Initiate Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
