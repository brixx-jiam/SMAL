import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <ShieldAlert size={48} className="text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
      <p className="text-slate-500 max-w-md">
        You do not have sufficient permissions to view this section. 
        This event has been logged in the security audit trail.
      </p>
    </div>
  );
};