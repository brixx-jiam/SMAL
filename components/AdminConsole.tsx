import React, { useState } from 'react';
import { User, MeetingRoom, RoleDefinition, ActionItem } from '../types';
import { Shield, Plus, Search, Edit2, Ban, CheckCircle, Mail, Building, User as UserIcon, X, Save, Users as UsersIcon, LayoutGrid, Lock, FileCheck, Server, CheckSquare, Trash2 } from 'lucide-react';
import { RoomManagement } from './RoomManagement';
import { RoleManagement } from './RoleManagement';
import { AuditLogViewer } from './AuditLogViewer';
import { DeveloperPortal } from './DeveloperPortal';

interface AdminConsoleProps {
  users: User[];
  rooms: MeetingRoom[];
  roles: RoleDefinition[];
  actions?: ActionItem[]; // Optional prop for backward compatibility
  onAddUser: (user: User) => Promise<void>;
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  onAddRoom: (room: MeetingRoom) => Promise<void>;
  onUpdateRoom: (roomId: string, updates: Partial<MeetingRoom>) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
  onAddRole: (role: RoleDefinition) => Promise<void>;
  onUpdateRole: (roleId: string, updates: Partial<RoleDefinition>) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onUpdateAction?: (actionId: string, updates: Partial<ActionItem>) => Promise<void>;
  onDeleteAction?: (actionId: string) => Promise<void>;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ 
  users, rooms, roles, actions = [],
  onAddUser, onUpdateUser, 
  onAddRoom, onUpdateRoom, onDeleteRoom,
  onAddRole, onUpdateRole, onDeleteRole,
  onUpdateAction, onDeleteAction
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROOMS' | 'ROLES' | 'AUDIT' | 'API' | 'ACTIONS'>('USERS');
  
  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    department: '',
    role: 'STAFF', 
    isActive: true,
    avatar: 'https://via.placeholder.com/150'
  });

  // Action Management State
  const [actionSearchTerm, setActionSearchTerm] = useState('');
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionFormData, setActionFormData] = useState<Partial<ActionItem>>({
    description: '',
    assigneeId: '',
    deadline: '',
    priority: 'MEDIUM',
    status: 'NEW'
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActions = actions.filter(a => 
    a.description.toLowerCase().includes(actionSearchTerm.toLowerCase()) ||
    a.assigneeId.toLowerCase().includes(actionSearchTerm.toLowerCase()) ||
    a.meetingId.toLowerCase().includes(actionSearchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        department: '',
        role: 'STAFF',
        isActive: true,
        avatar: 'https://ui-avatars.com/api/?background=random'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await onUpdateUser(editingUser.id, formData);
    } else {
      await onAddUser({
        ...formData as User,
        id: `u${Date.now()}`,
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenActionModal = (action: ActionItem) => {
    setEditingAction(action);
    setActionFormData(action);
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAction && onUpdateAction) {
      await onUpdateAction(editingAction.id, actionFormData);
      setIsActionModalOpen(false);
    }
  };

  const handleDeleteAction = async (action: ActionItem) => {
     if (confirm("Are you sure you want to delete this action item?") && onDeleteAction) {
        await onDeleteAction(action.id);
     }
  };

  const toggleUserStatus = async (user: User) => {
    if (confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.name}?`)) {
      await onUpdateUser(user.id, { isActive: !user.isActive });
    }
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || userId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
             <Shield className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
             Administrative Console
           </h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage personnel, roles, and system resources.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto no-scrollbar">
         <button onClick={() => setActiveTab('USERS')} className={`pb-4 flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'USERS' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
           <UsersIcon size={18} className="mr-2" /> Users
         </button>
         <button onClick={() => setActiveTab('ROLES')} className={`pb-4 flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ROLES' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
           <Lock size={18} className="mr-2" /> Roles
         </button>
         <button onClick={() => setActiveTab('ROOMS')} className={`pb-4 flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ROOMS' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
           <LayoutGrid size={18} className="mr-2" /> Rooms
         </button>
         <button onClick={() => setActiveTab('ACTIONS')} className={`pb-4 flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ACTIONS' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
           <CheckSquare size={18} className="mr-2" /> Action Items
         </button>
         <button onClick={() => setActiveTab('AUDIT')} className={`pb-4 flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'AUDIT' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
           <FileCheck size={18} className="mr-2" /> Audit Logs
         </button>
         <button onClick={() => setActiveTab('API')} className={`pb-4 flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'API' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
           <Server size={18} className="mr-2" /> Interoperability
         </button>
      </div>

      {activeTab === 'ROOMS' && <RoomManagement rooms={rooms} onAddRoom={onAddRoom} onUpdateRoom={onUpdateRoom} onDeleteRoom={onDeleteRoom} />}
      {activeTab === 'ROLES' && <RoleManagement roles={roles} onAddRole={onAddRole} onUpdateRole={onUpdateRole} onDeleteRole={onDeleteRole} />}
      {activeTab === 'AUDIT' && <AuditLogViewer />}
      {activeTab === 'API' && <DeveloperPortal />}

      {activeTab === 'ACTIONS' && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Action Item Management</h3>
                 <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search description, assignee..."
                      value={actionSearchTerm}
                      onChange={(e) => setActionSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
             </div>

             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-900">
                         <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assignee</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Deadline</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                         {filteredActions.length > 0 ? (
                           filteredActions.map((action) => (
                             <tr key={action.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white max-w-xs truncate" title={action.description}>{action.description}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{getUserName(action.assigneeId)}</td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      action.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                      action.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                   }`}>
                                      {action.status.replace('_', ' ')}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                      action.priority === 'HIGH' || action.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
                                      action.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                      'bg-blue-50 text-blue-600 border border-blue-100'
                                   }`}>{action.priority}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{action.deadline}</td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex justify-end space-x-2">
                                      <button onClick={() => handleOpenActionModal(action)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"><Edit2 size={16} /></button>
                                      <button onClick={() => handleDeleteAction(action)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                                   </div>
                                </td>
                             </tr>
                           ))
                         ) : (
                           <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">No action items found.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
         </div>
      )}

      {/* Action Item Edit Modal */}
      {isActionModalOpen && editingAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Action Item</h3>
               <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                    value={actionFormData.description} 
                    onChange={e => setActionFormData({...actionFormData, description: e.target.value})} 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white resize-none h-24" 
                    required 
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                  <select 
                    value={actionFormData.assigneeId} 
                    onChange={e => setActionFormData({...actionFormData, assigneeId: e.target.value})} 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 dark:text-white"
                  >
                     {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                     ))}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                     <select 
                       value={actionFormData.status} 
                       onChange={e => setActionFormData({...actionFormData, status: e.target.value as any})} 
                       className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 dark:text-white"
                     >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="COMPLETED">Completed</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                     <select 
                       value={actionFormData.priority} 
                       onChange={e => setActionFormData({...actionFormData, priority: e.target.value as any})} 
                       className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 dark:text-white"
                     >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                  <input 
                    type="date" 
                    value={actionFormData.deadline} 
                    onChange={e => setActionFormData({...actionFormData, deadline: e.target.value})} 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 dark:text-white"
                  />
               </div>
               <div className="flex justify-end space-x-3 mt-6 pt-2">
                  <button type="button" onClick={() => setIsActionModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"><Save size={16} className="mr-2"/> Save Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Personnel Directory</h3>
            <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-sm transition-colors font-medium text-sm">
              <Plus size={18} className="mr-2" /> Add User
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User Profile</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role & Dept</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-600 object-cover" src={user.avatar} alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center"><Mail size={12} className="mr-1" /> {user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.department}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full w-fit mt-1 border border-slate-200 dark:border-slate-600">{getRoleName(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${user.isActive ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>{user.isActive ? 'Active' : 'Deactivated'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button onClick={() => handleOpenModal(user)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => toggleUserStatus(user)} className={`${user.isActive ? 'text-slate-400 hover:text-red-600 dark:hover:text-red-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'} transition-colors`}>{user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingUser ? 'Edit User Profile' : 'Register New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                   <input type="text" required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                   <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 dark:text-white"><option value="">Select Role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};