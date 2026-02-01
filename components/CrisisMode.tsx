
import React, { useState } from 'react';
import { Siren, PhoneCall, Radio, AlertTriangle, Zap, Loader2, Send } from 'lucide-react';
import { generateCrisisPlan } from '../services/geminiService';
import { CrisisPlan } from '../types';

interface CrisisModeProps {
  onExit: () => void;
}

export const CrisisMode: React.FC<CrisisModeProps> = ({ onExit }) => {
  const [incident, setIncident] = useState('');
  const [plan, setPlan] = useState<CrisisPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!incident) return;
    setLoading(true);
    try {
      const generatedPlan = await generateCrisisPlan(incident);
      setPlan(generatedPlan);
    } catch (e) {
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50 min-h-full p-8 border-l-8 border-red-600">
       <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h1 className="text-4xl font-black text-red-700 tracking-tight flex items-center uppercase">
                   <Siren className="mr-4 h-10 w-10 animate-pulse" />
                   Emergency Operations Center
                </h1>
                <p className="text-red-600 font-medium mt-2">Protocol Red • Immediate Action Required</p>
             </div>
             <button onClick={onExit} className="text-sm text-red-800 underline hover:text-red-950 font-bold bg-white/50 px-4 py-2 rounded">De-escalate Protocol</button>
          </div>

          {/* AI Response Generator */}
          <div className="bg-white border-2 border-red-200 p-6 rounded-xl shadow-lg mb-8">
             <h3 className="font-bold text-red-800 mb-4 flex items-center text-lg"><Zap className="mr-2 text-yellow-500 fill-yellow-500"/> AI Crisis Response Generator</h3>
             <div className="flex gap-4 mb-4">
                <input 
                  type="text" 
                  value={incident}
                  onChange={(e) => setIncident(e.target.value)}
                  placeholder="Describe the incident (e.g., 'Cyberattack on Finance Server', 'Flood in East Wing')..."
                  className="flex-1 p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-red-900 placeholder-red-300"
                />
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !incident}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                   {loading ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2" size={18}/>}
                   Generate Plan
                </button>
             </div>

             {plan && (
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                   <div className="flex justify-between items-start mb-4 border-b border-red-200 pb-2">
                      <h4 className="font-bold text-red-900 text-lg">Recommended Action Plan</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${
                         plan.severityLevel === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 
                         plan.severityLevel === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                         SEVERITY: {plan.severityLevel}
                      </span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <h5 className="font-bold text-red-800 text-sm uppercase mb-2">Immediate Actions</h5>
                         <ul className="list-disc list-inside space-y-1 text-red-900 text-sm">
                            {plan.immediateActions.map((action, i) => <li key={i}>{action}</li>)}
                         </ul>
                      </div>
                      <div>
                         <h5 className="font-bold text-red-800 text-sm uppercase mb-2">Stakeholders to Notify</h5>
                         <div className="flex flex-wrap gap-2">
                            {plan.stakeholdersToNotify.map((s, i) => (
                               <span key={i} className="bg-white border border-red-200 px-2 py-1 rounded text-xs font-bold text-red-700">{s}</span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="mt-6">
                      <h5 className="font-bold text-red-800 text-sm uppercase mb-2">Draft Public Communication</h5>
                      <div className="bg-white p-4 rounded-lg border border-red-200 text-sm text-red-900 italic font-serif">
                         "{plan.communicationDraft}"
                      </div>
                   </div>
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-white border-2 border-red-200 p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-red-800 mb-4 flex items-center"><Radio className="mr-2"/> Live Crisis Stream</h3>
                <div className="bg-black h-48 rounded-lg flex items-center justify-center text-red-500 font-mono">
                   [SECURE VIDEO FEED LINK ESTABLISHED]
                </div>
             </div>
             <div className="bg-white border-2 border-red-200 p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-red-800 mb-4 flex items-center"><PhoneCall className="mr-2"/> Rapid Response Unit</h3>
                <button className="w-full bg-red-600 text-white font-bold py-4 rounded-lg mb-4 hover:bg-red-700 shadow-md">
                   INITIATE EMERGENCY MEETING (ALL HANDS)
                </button>
                <div className="grid grid-cols-2 gap-2">
                   <button className="bg-red-100 text-red-800 py-2 rounded font-medium hover:bg-red-200">Broadcast SMS</button>
                   <button className="bg-red-100 text-red-800 py-2 rounded font-medium hover:bg-red-200">Lockdown System</button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
