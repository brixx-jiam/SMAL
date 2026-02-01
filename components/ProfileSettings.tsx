
import React, { useState } from 'react';
import { User } from '../types';
import { 
  Save, Loader2, User as UserIcon, Building, AlertCircle, 
  CheckCircle, Camera, Upload, Moon, Sun, Shield, LogOut 
} from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  user, onUpdateProfile, currentTheme, onToggleTheme, onLogout 
}) => {
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await onUpdateProfile({ name, department, avatar });
      setMessage({ type: 'success', text: 'Institutional profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Operational failure: Could not commit changes to sovereign node.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Artifact too large (Max 5MB).' });
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Artifact reading failure.' });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* Theme Card */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-8 flex justify-between items-center">
           <div>
             <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center uppercase tracking-tight">
               {currentTheme === 'dark' ? <Moon size={20} className="mr-3 text-indigo-400"/> : <Sun size={20} className="mr-3 text-amber-500"/>}
               Visual Interface
             </h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sovereign OS Appearance Protocol</p>
           </div>
           
           <button 
             onClick={onToggleTheme}
             className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors focus:outline-none ring-4 ring-blue-500/0 focus:ring-blue-500/20 ${currentTheme === 'dark' ? 'bg-blue-600' : 'bg-slate-200'}`}
           >
             <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${currentTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Personnel Node Identity</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Memory Profile</p>
        </div>
        
        <div className="p-8">
          {message && (
            <div className={`mb-8 p-5 rounded-2xl flex items-center animate-in slide-in-from-top-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} className="mr-3" /> : <AlertCircle size={18} className="mr-3" />}
              <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10 mb-10 items-center md:items-start">
             <div className="flex flex-col items-center space-y-4 shrink-0">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                  <img 
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=020617&color=fff`} 
                    alt="Avatar Preview" 
                    className="relative w-40 h-40 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-2xl object-cover transition-transform group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=020617&color=fff` }}
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white"
                  >
                     {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Camera size={32} />}
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
                
                <div className="flex flex-col items-center">
                   <label 
                     htmlFor="avatar-upload"
                     className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center"
                   >
                     <Upload size={14} className="mr-2" /> Change Artifact
                   </label>
                   <span className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest">JPG, PNG (MAX 5MB)</span>
                </div>
             </div>
             
             <div className="flex-1 w-full space-y-6">
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Official Nominee</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <UserIcon size={18} className="text-slate-400" />
                     </div>
                     <input
                       type="text"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required
                       className="pl-12 block w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-4 text-sm font-black dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Assigned Directorate</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Building size={18} className="text-slate-400" />
                     </div>
                     <input
                       type="text"
                       value={department}
                       onChange={(e) => setDepartment(e.target.value)}
                       required
                       className="pl-12 block w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-4 text-sm font-black dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                     />
                   </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex justify-end">
                   <button
                     type="submit"
                     disabled={isSaving || isUploading}
                     className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                   >
                     {isSaving ? (
                       <>
                         <Loader2 size={16} className="animate-spin mr-3" />
                         Syncing Profile...
                       </>
                     ) : (
                       <>
                         <Save size={16} className="mr-3" />
                         Commit Changes
                       </>
                     )}
                   </button>
                 </div>
               </form>
             </div>
          </div>

          <div className="bg-blue-600/5 rounded-3xl p-6 border border-blue-600/10 flex items-start space-x-4">
             <Shield size={20} className="text-blue-500 shrink-0" />
             <div>
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Audit Protocol Notice</h4>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tight">
                  All modifications to personnel identity records are logged immutably in the sovereign audit trail. Verification from an authorized Super Admin node may be required for high-tier elevations.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Logout Card */}
      <div className="bg-rose-500/5 dark:bg-rose-500/10 rounded-3xl p-8 border border-rose-500/20 shadow-xl transition-all hover:border-rose-500/40 group">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
               <h3 className="text-lg font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight flex items-center justify-center sm:justify-start">
                  <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  Terminate Session
               </h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Safely disconnect this node from the sovereign cloud.</p>
            </div>
            <button 
               onClick={onLogout}
               className="w-full sm:w-auto px-10 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
            >
               Sign Out
            </button>
         </div>
      </div>
    </div>
  );
};
