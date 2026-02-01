
import React, { useState } from 'react';
import { RoleDefinition, Permission } from '../types';
import { PERMISSIONS_LIST } from '../constants';
import { Shield, Plus, Edit2, Trash2, X, Save, Lock, AlertCircle, Check } from 'lucide-react';

interface RoleManagementProps {
  roles: RoleDefinition[];
  onAddRole: (role: RoleDefinition) => Promise<void>;
  onUpdateRole: (roleId: string, updates: Partial<RoleDefinition>) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ roles, onAddRole, onUpdateRole, onDeleteRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  
  const [formData, setFormData] = useState<Partial<RoleDefinition>>({
    name: '',
    description: '',
    permissions: [],
    isSystem: false
  });

  const handleOpenModal = (role?: RoleDefinition) => {
    if (role) {
      setEditingRole(role);
      setFormData(JSON.parse(JSON.stringify(role))); // Deep copy
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
        isSystem: false
      });
    }
    setIsModalOpen(true);
  };

  const togglePermission = (permId: Permission) => {
    const currentPerms = formData.permissions || [];
    if (currentPerms.includes(permId)) {
      setFormData({ ...formData, permissions: currentPerms.filter(p => p !== permId) });
    } else {
      setFormData({ ...formData, permissions: [...currentPerms, permId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingRole) {
      await onUpdateRole(editingRole.id, formData);
    } else {
      await onAddRole({
        ...formData as RoleDefinition,
        id: `role_${Date.now()}`,
        isSystem: false
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (role: RoleDefinition) => {
    if (role.isSystem) {
      alert("System roles cannot be deleted.");
      return;
    }
    if (confirm(`Are you sure you want to delete the role "${role.name}"? Users assigned to this role may lose access.`)) {
      await onDeleteRole(role.id);
    }
  };

  // Group permissions for the UI
  const groupedPermissions = PERMISSIONS_LIST.reduce((acc, perm) => {
    if (!acc[perm.group]) acc[perm.group] = [];
    acc[perm.group].push(perm);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS_LIST>);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Role Management</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Define user roles and customize system permissions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm font-medium"
        >
          <Plus size={16} className="mr-2" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">{role.name}</h4>
                  {role.isSystem && (
                    <div title="System Role">
                      <Lock size={12} className="text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{role.description}</p>
              </div>
              <div className="flex space-x-1">
                 <button 
                  onClick={() => handleOpenModal(role)} 
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                >
                   <Edit2 size={16} />
                 </button>
                 {!role.isSystem && (
                   <button 
                    onClick={() => handleDelete(role)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                  >
                     <Trash2 size={16} />
                   </button>
                 )}
              </div>
            </div>
            
            <div className="p-5 flex-1">
              <h5 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Permissions</h5>
              <div className="flex flex-wrap gap-2">
                {role.permissions.slice(0, 6).map(perm => (
                  <span key={perm} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                    {PERMISSIONS_LIST.find(p => p.id === perm)?.label || perm}
                  </span>
                ))}
                {role.permissions.length > 6 && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                    +{role.permissions.length - 6} more
                  </span>
                )}
                {role.permissions.length === 0 && (
                   <span className="text-xs text-slate-400 italic">No specific permissions</span>
                )}
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
               <span>ID: {role.id}</span>
               <span className={role.isSystem ? "text-amber-600 dark:text-amber-500 font-medium" : "text-slate-400"}>
                 {role.isSystem ? "System Default" : "Custom Role"}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingRole ? 'Customize Role' : 'Create New Role'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <form id="roleForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="e.g. Compliance Officer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="Role responsibilities..."
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center">
                    <Shield size={16} className="mr-2 text-purple-600 dark:text-purple-400" />
                    Permission Set
                  </h4>
                  
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([group, permissions]) => (
                      <div key={group}>
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">{group}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissions.map(perm => {
                            const isChecked = (formData.permissions || []).includes(perm.id);
                            return (
                              <label key={perm.id} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${
                                isChecked ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                              }`}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                                  isChecked ? 'bg-purple-600 border-purple-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                                }`}>
                                  {isChecked && <Check size={12} className="text-white" />}
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm.id)}
                                />
                                <span className={`text-sm ${isChecked ? 'text-purple-900 dark:text-purple-300 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                                  {perm.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
               <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                 {formData.isSystem && (
                   <span className="flex items-center text-amber-600 dark:text-amber-500">
                     <Lock size={12} className="mr-1" />
                     System Role (Name Locked)
                   </span>
                 )}
               </div>
               <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="roleForm"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center shadow-sm"
                >
                  <Save size={18} className="mr-2" />
                  Save Role
                </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
