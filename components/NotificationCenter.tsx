
import React, { useState, useEffect } from 'react';
import { Notification, ViewType } from '../types';
import { getNotifications, markNotificationRead, markNotificationUnread, deleteNotification } from '../services/supabase';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, Mail, MailOpen, X, ArrowLeft, ExternalLink, Eye } from 'lucide-react';

interface NotificationCenterProps {
  userId: string;
  onNavigate: (view: ViewType) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ALERT'>('ALL');

  const fetchNotifications = async () => {
    const data = await getNotifications(userId);
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(interval);
  }, [userId]);

  const handleSelect = async (note: Notification) => {
    setSelectedNotification(note);
    if (!note.isRead) {
      await markNotificationRead(note.id);
      setNotifications(prev => prev.map(n => n.id === note.id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkUnread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedNotification) {
      await markNotificationUnread(selectedNotification.id);
      setNotifications(prev => prev.map(n => n.id === selectedNotification.id ? { ...n, isRead: false } : n));
      setSelectedNotification(null); // Return to list view
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedNotification) {
      await deleteNotification(selectedNotification.id);
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      setSelectedNotification(null);
    }
  };

  const handleViewResource = () => {
    if (!selectedNotification) return;
    
    // Intelligent Navigation based on notification content
    const text = (selectedNotification.title + (selectedNotification.message || '')).toLowerCase();
    
    if (text.includes('meeting') || text.includes('invite') || text.includes('schedule')) {
      onNavigate('MEETINGS');
    } else if (text.includes('action') || text.includes('task') || text.includes('deadline')) {
      onNavigate('ACTION_ITEMS');
    } else if (text.includes('security') || text.includes('audit') || text.includes('system')) {
      onNavigate('ADMIN');
    } else if (text.includes('profile') || text.includes('user')) {
      onNavigate('SETTINGS');
    } else {
      onNavigate('DASHBOARD');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'ALERT') return n.type === 'ALERT';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <AlertTriangle size={20} className="text-red-500" />;
      case 'SUCCESS': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] relative">
      
      {/* Left List Pane */}
      <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 absolute md:relative inset-0 z-10 bg-white dark:bg-slate-800 ${
        selectedNotification ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center flex-shrink-0">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <Bell size={18} className="mr-2 text-slate-500 dark:text-slate-400" /> Notifications
          </h2>
          <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
            <button 
              onClick={() => setFilter('ALL')} 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('UNREAD')} 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Unread
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 no-scrollbar bg-white dark:bg-slate-800">
          {filteredNotifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400 dark:text-slate-500">
              <p>No notifications found.</p>
            </div>
          ) : (
            filteredNotifications.map(note => (
              <div 
                key={note.id}
                onClick={() => handleSelect(note)}
                className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  selectedNotification?.id === note.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-400' : ''
                } ${!note.isRead ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}
              >
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0">
                    {getIcon(note.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={`text-sm truncate pr-2 ${!note.isRead ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                        {note.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{note.message}</p>
                  </div>
                  {!note.isRead && (
                    <div className="ml-2 mt-2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className={`w-full md:w-2/3 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col transition-transform duration-300 absolute md:relative inset-0 z-20 bg-white dark:bg-slate-800 ${
        selectedNotification ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        {selectedNotification ? (
          <>
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-start flex-shrink-0">
               <div className="flex items-start">
                 <button onClick={() => setSelectedNotification(null)} className="md:hidden mr-3 mt-1 text-slate-600 dark:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                   <ArrowLeft size={20} />
                 </button>
                 <div>
                   <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedNotification.title}</h3>
                   <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2 space-x-3">
                     <span className="flex items-center"><Clock size={12} className="mr-1"/> {new Date(selectedNotification.timestamp).toLocaleString()}</span>
                     <span className={`px-2 py-0.5 rounded-full border ${
                        selectedNotification.type === 'ALERT' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900' : 
                        selectedNotification.type === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-red-900' : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-red-900'
                     } uppercase font-bold text-[10px]`}>
                       {selectedNotification.type}
                     </span>
                   </div>
                 </div>
               </div>
               <div className="flex space-x-2">
                 <button 
                   onClick={handleDelete}
                   className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" 
                   title="Delete Notification"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white dark:bg-slate-800">
               <div className="prose prose-slate dark:prose-invert max-w-none">
                 <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                   {selectedNotification.message}
                 </p>
               </div>
               
               <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                     <button 
                       onClick={handleViewResource}
                       className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center border border-blue-100 dark:border-blue-800"
                     >
                        <ExternalLink size={16} className="mr-2" />
                        View Related Resource
                     </button>
                     <button 
                        onClick={handleMarkUnread}
                        className="px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700"
                     >
                        <Mail size={16} className="mr-2" />
                        Mark as Unread
                     </button>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 hidden md:flex">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <MailOpen size={32} />
            </div>
            <p className="font-medium">Select a notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
