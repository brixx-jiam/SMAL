
import React, { useState, useEffect } from 'react';
import { Loader2, Mail, Lock, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('admin@gov.smal'); 
  const [name, setName] = useState('');
  const [password, setPassword] = useState('password123'); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase.from('users').select('*').eq('email', email).single();
      if (dbError || !data) throw new Error("Credentials not recognized in Sovereign database node.");
      onLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: regError } = await supabase.from('users').insert([{
        id: `u_${Date.now()}`,
        name: name,
        email: email,
        role: 'STAFF', 
        department: 'Self Registered Node'
      }]).select().single();

      if (regError) throw regError;
      onLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background Neural Effects */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="glass-panel w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-1000 relative z-10 backdrop-blur-3xl bg-slate-900/60">
        
        <div className="p-12 text-center">
          <div className="w-28 h-28 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl border border-white/10 overflow-hidden bg-white ring-8 ring-blue-500/5 group">
            <img src="https://files.catbox.moe/a27w5a.jpeg" alt="Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">SMAL</h1>
          <p className="text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase opacity-80">
            {isRegistering ? 'Provision Official Node' : 'Institutional Protocol Auth'}
          </p>
        </div>

        <div className="px-12 pb-16">
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-900/40 text-rose-200 text-[10px] font-black uppercase tracking-widest p-5 rounded-2xl border border-rose-800 text-center animate-shake leading-relaxed shadow-lg">
                <AlertCircle size={14} className="mx-auto mb-2 text-rose-400" />
                {error}
              </div>
            )}
            
            {isRegistering && (
              <div className="group animate-in slide-in-from-left-4">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-2">Official Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-black/40 p-5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="NOMINEE FULL NAME"
                  required
                />
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-2">Institutional ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 block w-full rounded-2xl border border-white/5 bg-black/40 p-5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="admin@gov.smal"
                  required
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="group animate-in slide-in-from-right-4">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-2">Sovereign Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-600" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-14 block w-full rounded-2xl border border-white/5 bg-black/40 p-5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="PROTOCOL KEY"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-5 px-6 rounded-2xl shadow-2xl text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 transition-all uppercase tracking-[0.3em] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isRegistering ? 'Request Node Provision' : 'Initiate Secure Uplink')}
            </button>
          </form>

          <div className="mt-8 flex flex-col space-y-5">
             <button 
               onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
               className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
             >
               {isRegistering ? 'Existing Node? Authenticate' : 'New Personnel? Provision Node'}
             </button>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 text-center">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.5em] opacity-50">Sovereign Core v4.0.1 // encrypted</span>
        </div>
      </div>
    </div>
  );
};
