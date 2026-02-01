
import React, { useState, useEffect } from 'react';
import { ApiToken } from '../types';
import { getApiTokens, generateApiToken } from '../services/mockFirebase';
import { Server, Plus, Copy, RefreshCw } from 'lucide-react';

export const DeveloperPortal = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);

  useEffect(() => {
    getApiTokens().then(setTokens);
  }, []);

  const handleGenerate = async () => {
     const newToken = await generateApiToken("New Integration", "External Service");
     setTokens([...tokens, newToken]);
  };

  return (
    <div className="space-y-6">
       <div className="bg-slate-900 dark:bg-slate-950 text-white p-8 rounded-xl flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold flex items-center mb-2"><Server className="mr-3"/> OpenGov Interoperability API</h2>
             <p className="text-slate-400">Manage access tokens for cross-ministry integrations (HR, Finance, Calendars).</p>
          </div>
          <button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
             <Plus size={18} className="mr-2" /> Generate Token
          </button>
       </div>

       <div className="grid gap-4">
          {tokens.map(token => (
             <div key={token.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                   <h4 className="font-bold text-slate-800 dark:text-white">{token.name}</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Service: {token.service} • Last Used: {token.lastUsed}</p>
                </div>
                <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                   <code className="text-sm font-mono text-slate-600 dark:text-slate-300">{token.token.substring(0, 15)}...</code>
                   <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"><Copy size={16}/></button>
                   <button className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"><RefreshCw size={16}/></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};
