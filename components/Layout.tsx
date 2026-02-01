
import React, { useState, useEffect } from 'react';
import { ViewType, User, RoleDefinition } from '../types';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Settings, 
  LogOut,
  Menu,
  Shield,
  Cloud,
  Eye,
  Bell,
  Search,
  ChevronRight,
  MoreHorizontal,
  LayoutGrid,
  X,
  Gavel,
  BrainCircuit,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';
import { getNotifications } from '../services/supabase';

interface LayoutProps {
  currentView: ViewType;
  user: User;
  userRoleDefinition?: RoleDefinition;
  isCrisisMode: boolean;
  isOffline: boolean;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  onToggleOffline: () => void;
  onToggleJiam: () => void;
  isJiamOpen: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, user, onNavigate, onLogout, onToggleJiam, isJiamOpen, children 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [scrolled, setScrolled] = useState(false);
  const [isShelfOpen, setIsShelfOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      if (user) {
        const notes = await getNotifications(user.id);
        setUnreadCount(notes.filter(n => !n.isRead).length);
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);
  
  const primaryNav = [
    { id: 'DASHBOARD' as ViewType, icon: LayoutDashboard, label: 'HUD' },
    { id: 'MEETINGS' as ViewType, icon: CalendarDays, label: 'Ops' },
    { id: 'ACTION_ITEMS' as ViewType, icon: CheckSquare, label: 'Tasks' },
    { id: 'DOCUMENT_CLOUD' as ViewType, icon: Cloud, label: 'Cloud' },
  ];

  const secondaryNav = [
    { id: 'FOIA_PORTAL' as ViewType, icon: Eye, label: 'FOIA' },
    { id: 'ADMIN' as ViewType, icon: Shield, label: 'Admin' },
    { id: 'SETTINGS' as ViewType, icon: Settings, label: 'Prefs' },
  ];

  const NavItem = ({ view, icon: Icon, label, isMobile = false, onClick }: { view: ViewType; icon: any; label: string; isMobile?: boolean; onClick?: () => void; key?: React.Key }) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        else {
          onNavigate(view);
          setIsShelfOpen(false);
        }
      }}
      className={`relative flex items-center transition-all duration-500 ease-out group ${
        isMobile 
          ? 'flex-col flex-1 py-2 justify-center' 
          : `w-full px-5 py-4 rounded-2xl mb-1.5 ${currentView === view ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200'}`
      }`}
    >
      <Icon size={isMobile ? 24 : 20} className={`${currentView === view ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
      <span className={`${isMobile ? 'text-[9px]' : 'text-xs ml-4'} font-black uppercase tracking-[0.2em] mt-1 ${!isMobile && !isSidebarOpen ? 'hidden' : ''}`}>
        {label}
      </span>
      {currentView === view && isMobile && <div className="absolute -top-1 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-500/30">
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="h-24 flex items-center px-6">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center flex-shrink-0">
              <Shield className="text-white" size={24} />
           </div>
           {isSidebarOpen && <span className="ml-4 text-2xl font-black tracking-tighter dark:text-white">SMAL</span>}
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar">
          <div className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-4 ${!isSidebarOpen && 'hidden'}`}>Primary</div>
          {primaryNav.map(item => <NavItem key={item.id} view={item.id} icon={item.icon} label={item.label} />)}
          
          <div className="mt-10">
             <div className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-4 ${!isSidebarOpen && 'hidden'}`}>System</div>
             {secondaryNav.map(item => <NavItem key={item.id} view={item.id} icon={item.icon} label={item.label} />)}
          </div>
        </nav>

        <div className="p-4">
           <button onClick={onLogout} className={`w-full flex items-center justify-center py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-2xl transition-all ${!isSidebarOpen && 'p-4'}`}>
              <LogOut size={20} />
              {isSidebarOpen && <span className="ml-3 font-black text-xs uppercase tracking-widest">End Session</span>}
           </button>
        </div>
      </aside>

      {/* Viewport Core */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        <header className={`h-16 md:h-24 flex items-center justify-between px-6 md:px-10 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm' : 'bg-transparent'}`}>
           <div className="flex items-center space-x-6">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-3 bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-90">
                 <Menu size={20} />
              </button>
              <h1 className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                {currentView.replace('_', ' ')}
              </h1>
           </div>
           
           <div className="flex items-center space-x-3 md:space-x-6">
              {/* Voice Protocol Toggle Switch */}
              <div className="hidden sm:flex items-center space-x-3 pr-4 border-r border-slate-200 dark:border-white/10">
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isJiamOpen ? 'text-blue-600' : 'text-slate-400'}`}>
                   Voice Protocol
                </span>
                <button 
                  onClick={onToggleJiam}
                  role="switch"
                  aria-checked={isJiamOpen}
                  aria-label="Toggle Jiam Voice Listening Mode"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ring-2 ring-transparent focus:ring-blue-500/20 ${isJiamOpen ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ${isJiamOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Jiam Orb Button with Pulsating Cue */}
              <div className="relative">
                {/* Subtle Visual Cue: Pulsating Light */}
                {isJiamOpen && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/30 scale-150"></div>
                )}
                {isJiamOpen && (
                  <div className="absolute -inset-2 rounded-full blur-xl bg-blue-500/20 animate-siri-pulse"></div>
                )}
                
                <button 
                  onClick={onToggleJiam}
                  aria-label={isJiamOpen ? "Close Jiam" : "Activate Jiam"}
                  aria-pressed={isJiamOpen}
                  className={`group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-500 active:scale-90 shadow-2xl overflow-hidden z-10 ${isJiamOpen ? 'bg-blue-600' : 'bg-slate-900 dark:bg-white'}`}
                >
                   {isJiamOpen ? <X size={20} className="text-white" /> : <Sparkles size={20} className="text-white dark:text-slate-900" />}
                   {isJiamOpen && <div className="absolute inset-0 siri-neural-orb animate-siri-liquid opacity-60"></div>}
                </button>
              </div>

              <button 
                onClick={() => {
                  if (currentView === 'NOTIFICATIONS') {
                    onNavigate('DASHBOARD');
                  } else {
                    onNavigate('NOTIFICATIONS');
                  }
                }}
                className={`p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl transition-all relative group ${currentView === 'NOTIFICATIONS' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:text-blue-500'}`}
              >
                 <Bell size={20} className="group-active:scale-90 transition-transform" />
                 {unreadCount > 0 && (
                   <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                 )}
              </button>
              
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-white/10 ml-2">
                 <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-4 md:p-10 pb-32 md:pb-10 relative">
           <div className="max-w-[1600px] mx-auto min-h-full">
              {children}
           </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 flex items-center px-4 pb-safe z-[60]">
           {primaryNav.map(item => <NavItem key={item.id} view={item.id} icon={item.icon} label={item.label} isMobile />)}
           <NavItem 
              view={currentView} 
              icon={isShelfOpen ? X : LayoutGrid} 
              label="Ext" 
              isMobile 
              onClick={() => setIsShelfOpen(!isShelfOpen)} 
           />
        </nav>

        {isShelfOpen && (
          <div className="md:hidden fixed inset-0 z-[55] flex flex-col justify-end animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsShelfOpen(false)}></div>
             <div className="relative bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 border-t border-white/10">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8"></div>
                
                <div className="grid grid-cols-3 gap-6">
                   {secondaryNav.map(item => (
                     <button 
                       key={item.id}
                       onClick={() => {
                          onNavigate(item.id);
                          setIsShelfOpen(false);
                       }}
                       className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 active:scale-95 transition-all"
                     >
                        <item.icon size={28} className={currentView === item.id ? 'text-blue-600' : 'text-slate-400'} />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-3 dark:text-slate-300">{item.label}</span>
                     </button>
                   ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                   <button onClick={onLogout} className="w-full flex items-center justify-center py-5 text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl font-black text-xs uppercase tracking-widest">
                      Terminate Session
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
