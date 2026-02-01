
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MeetingList } from './components/MeetingList';
import { MeetingDetail } from './components/MeetingDetail';
import { ActionTracker } from './components/ActionTracker';
import { Login } from './components/Login';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminConsole } from './components/AdminConsole';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ToDoList } from './components/ToDoList';
import { DocumentCloud } from './components/DocumentCloud';
import { FoiaPortal } from './components/FoiaPortal';
import { JiamLive } from './components/JiamLive';
import { NotificationCenter } from './components/NotificationCenter';
import { AiTranscriber } from './components/AiTranscriber';
import { ViewType, Meeting, ActionItem, User, RoleDefinition, MeetingStatus } from './types';
import { 
  getMeetings, createMeeting, createToDo, 
  getUsers, getRoles, subscribeToSystem, 
  getCloudDocuments, deleteCloudDocument, updateUser,
  deleteMeeting
} from './services/supabase';
import { ShieldAlert, Key, Loader2, Sparkles, ExternalLink } from 'lucide-react';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isJiamOpen, setIsJiamOpen] = useState(false);
  const [isTranscriberOpen, setIsTranscriberOpen] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(false); 

  const checkApiKey = useCallback(async () => {
    // If the key is specifically undefined or placeholder, we need the picker
    const key = process.env.API_KEY;
    if (!key || key === 'undefined' || key === 'null' || key === '') {
       const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
       if (!hasKey) {
         setNeedsApiKey(true);
       } else {
         setNeedsApiKey(false);
       }
    } else {
      setNeedsApiKey(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [m, u, rl] = await Promise.all([
        getMeetings(),
        getUsers(),
        getRoles()
      ]);

      setMeetings(m);
      setAllUsers(u);
      setRoles(rl);
      
      const freshMe = u.find(user => user.id === currentUser.id);
      if (freshMe) setCurrentUser(freshMe);

    } catch (error) {
      console.error("Critical System Load Failure", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      loadData();
      const systemSub = subscribeToSystem(() => loadData());
      return () => { systemSub.unsubscribe(); };
    }
  }, [currentUser, loadData]);

  const currentUserRoleDef = useMemo(() => roles.find(r => r.id === currentUser?.role), [roles, currentUser?.role]);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    setSelectedMeeting(null);
  };

  const handleSelectMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('MEETINGS');
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    try {
      await updateUser(currentUser.id, updates);
      await loadData();
    } catch (err) {
      console.error("Profile Synchronization Failure:", err);
      throw err;
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteMeeting(id);
      await loadData();
    } catch (err) {
      console.error("Protocol Purge Failure:", err);
      alert("System could not purge meeting node. Check network protocol.");
    }
  };

  const handleOpenKeyPicker = async () => {
    try {
      await (window as any).aistudio?.openSelectKey();
      // Assume success and proceed to prevent race condition
      setNeedsApiKey(false);
    } catch (err) {
      console.error("Key Selection Protocol Failed:", err);
    }
  };

  const handleJiamAction = async (actionName: string, args: any) => {
    if (!currentUser) return;
    try {
      if (actionName === 'create_meeting') {
        const newMtg: Meeting = {
          id: `m${Date.now()}`,
          title: args.title || 'Jiam Neural Protocol',
          date: args.date || new Date().toISOString().split('T')[0],
          startTime: args.startTime || '10:00',
          endTime: '11:00',
          location: args.location || 'Briefing Node 01',
          status: MeetingStatus.SCHEDULED,
          organizerId: currentUser.id,
          qrCodeUrl: '',
          agenda: [],
          attendees: [currentUser.id]
        };
        await createMeeting(newMtg);
      } 
      else if (actionName === 'create_todo') {
        await createToDo({
          id: `t${Date.now()}`,
          userId: currentUser.id,
          text: args.text,
          isCompleted: false,
          priority: args.priority || 'MEDIUM',
          timestamp: new Date().toISOString()
        });
        setCurrentView('TODO');
      }
    } catch (err) {
      console.error("Jiam Action Failure:", err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('DASHBOARD');
    setSelectedMeeting(null);
  };

  if (needsApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
        </div>

        <div className="glass-panel w-full max-w-xl rounded-[4rem] p-12 shadow-2xl border border-white/10 text-center relative z-10 animate-in fade-in zoom-in-95 duration-1000">
           <div className="w-24 h-24 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center mb-10 shadow-2xl shadow-blue-600/20 relative">
              <Key size={40} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-40 animate-pulse"></div>
           </div>
           
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Neural Link Required</h1>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed mb-12">
             The sovereign intelligence layer requires a validated API key from a paid GCP project to authorize AI operations.
           </p>

           <div className="space-y-4">
              <button 
                onClick={handleOpenKeyPicker}
                className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center group"
              >
                <Sparkles size={18} className="mr-3 text-blue-600 group-hover:rotate-12 transition-transform" />
                Activate Neural Key
              </button>

              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors py-4"
              >
                Protocol Documentation <ExternalLink size={12} className="ml-2" />
              </a>
           </div>

           <div className="mt-12 pt-12 border-t border-white/5 flex items-center justify-center space-x-6 opacity-30">
              <ShieldAlert size={16} className="text-slate-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">Security Node: Localhost // Offline Key Storage</span>
           </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={(user) => setCurrentUser(user)} />;
  
  return (
    <Layout 
      currentView={currentView} 
      user={currentUser} 
      userRoleDefinition={currentUserRoleDef}
      isCrisisMode={isCrisisMode}
      isOffline={isOffline}
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
      onToggleOffline={() => setIsOffline(!isOffline)}
      onToggleJiam={() => setIsJiamOpen(!isJiamOpen)}
      isJiamOpen={isJiamOpen}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {currentView === 'DASHBOARD' && (
          <Dashboard 
            meetings={meetings} 
            actions={actions} 
            attendance={[]} 
            onOpenTranscriber={() => setIsTranscriberOpen(true)}
          />
        )}
        {currentView === 'MEETINGS' && !selectedMeeting && (
          <MeetingList 
            meetings={meetings} 
            canManage={true} 
            currentUser={currentUser} 
            allUsers={allUsers}
            onSelectMeeting={handleSelectMeeting} 
            onCreateMeeting={async (m) => { await createMeeting(m); loadData(); }} 
            onUpdateMeeting={loadData} 
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}
        {currentView === 'MEETINGS' && selectedMeeting && <MeetingDetail meeting={selectedMeeting} canEdit={true} onBack={() => setSelectedMeeting(null)} onUpdateMeeting={loadData} onAddAction={() => loadData()} isOffline={isOffline} />}
        {currentView === 'ACTION_ITEMS' && <ActionTracker actions={actions} />}
        {currentView === 'DOCUMENT_CLOUD' && <DocumentCloud user={currentUser} />}
        {currentView === 'FOIA_PORTAL' && <FoiaPortal />}
        {currentView === 'KNOWLEDGE_BASE' && <KnowledgeBase />}
        {currentView === 'TODO' && <ToDoList userId={currentUser.id} />}
        {currentView === 'NOTIFICATIONS' && <NotificationCenter userId={currentUser.id} onNavigate={handleNavigate} />}
        {currentView === 'SETTINGS' && (
          <ProfileSettings 
            user={currentUser} 
            onUpdateProfile={handleUpdateProfile} 
            currentTheme={theme} 
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            onLogout={handleLogout}
          />
        )}
        {currentView === 'ADMIN' && <AdminConsole users={allUsers} rooms={[]} roles={roles} actions={actions} onAddUser={async () => {}} onUpdateUser={async (id, u) => { await updateUser(id, u); loadData(); }} onAddRoom={async () => {}} onUpdateRoom={async () => {}} onDeleteRoom={async () => {}} onAddRole={async () => {}} onUpdateRole={async () => {}} onDeleteRole={async () => {}} />}
      </div>

      <AiTranscriber 
        isOpen={isTranscriberOpen} 
        onClose={() => setIsTranscriberOpen(false)} 
        userId={currentUser.id}
      />

      <JiamLive 
        user={currentUser}
        isOpen={isJiamOpen}
        onClose={() => setIsJiamOpen(false)}
        onNavigate={handleNavigate}
        onActionTriggered={handleJiamAction}
      />
    </Layout>
  );
};

export default App;
