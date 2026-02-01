
import React, { useState } from 'react';
import { 
  UploadCloud, FileAudio, FileText, CheckCircle, 
  Loader2, Play, Wand2, Download, Languages, 
  ArrowRight, X, Globe, Clipboard, Sparkles,
  ShieldCheck
} from 'lucide-react';
import { transcribeAndTranslateAudio } from '../services/geminiService';
import { saveTranslationArtifact } from '../services/supabase';

interface AiTranscriberProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' }
];

export const AiTranscriber: React.FC<AiTranscriberProps> = ({ isOpen, onClose, userId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState('fr');
  const [targetLang, setTargetLang] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ transcription: string, translation: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const sourceName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      const data = await transcribeAndTranslateAudio(file, sourceName, targetName);
      setResult(data);
      
      // Save artifact to database archive
      await saveTranslationArtifact(
        userId, 
        file.name, 
        sourceName, 
        targetName, 
        data.transcription, 
        data.translation
      );
    } catch (e) {
      alert("Something went wrong with the translation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <Languages size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Voice Translator</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Turn speech into text and other languages</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors text-slate-400">
              <X size={24} />
           </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Settings */}
              <div className="lg:col-span-5 space-y-8">
                 
                 <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Pick your audio file</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 text-center hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer relative group">
                       <input 
                         type="file" 
                         accept="audio/*" 
                         onChange={handleFileChange}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                       <div className="relative z-0">
                          {file ? (
                             <div className="space-y-2">
                                <FileAudio size={48} className="mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-black dark:text-white uppercase truncate px-4">{file.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                             </div>
                          ) : (
                             <div className="space-y-3">
                                <UploadCloud size={48} className="mx-auto text-slate-300 dark:text-slate-700 group-hover:-translate-y-2 transition-transform" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select a recording</p>
                                <p className="text-[9px] text-slate-400">MP3, WAV, or M4A files</p>
                             </div>
                          )}
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Choose languages</label>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <div className="flex items-center justify-between mb-4 px-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Original Language</span>
                             <Globe size={14} className="text-blue-500" />
                          </div>
                          <select 
                             value={sourceLang}
                             onChange={(e) => setSourceLang(e.target.value)}
                             className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl outline-none text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-white/5 dark:text-white"
                          >
                             {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                          </select>
                       </div>

                       <div className="flex justify-center -my-2 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                             <ArrowRight size={18} />
                          </div>
                       </div>

                       <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <div className="flex items-center justify-between mb-4 px-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Translate To</span>
                             <Sparkles size={14} className="text-indigo-500" />
                          </div>
                          <select 
                             value={targetLang}
                             onChange={(e) => setTargetLang(e.target.value)}
                             className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl outline-none text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-white/5 dark:text-white"
                          >
                             {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                          </select>
                       </div>
                    </div>
                 </section>

                 <button 
                   onClick={handleProcess}
                   disabled={!file || isProcessing}
                   className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
                 >
                    {isProcessing ? (
                       <><Loader2 className="animate-spin mr-3" size={18}/> Converting...</>
                    ) : (
                       <><Play className="mr-3" size={18}/> Start Translating</>
                    )}
                 </button>

              </div>

              {/* Right Column: Result */}
              <div className="lg:col-span-7">
                 <div className="h-full min-h-[500px] bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center">
                          <CheckCircle className="mr-2 text-emerald-500" size={16} /> Results
                       </h3>
                       {result && (
                          <div className="flex space-x-2">
                             <button onClick={() => copyToClipboard(result.translation)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl hover:text-blue-500 transition-colors shadow-sm" title="Copy results"><Clipboard size={16}/></button>
                             <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl hover:text-blue-500 transition-colors shadow-sm" title="Download text"><Download size={16}/></button>
                          </div>
                       )}
                    </div>

                    {!result && !isProcessing && (
                       <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                          <Languages size={64} className="mb-4 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-xs leading-relaxed">Ready. Pick a recording and languages to get started.</p>
                       </div>
                    )}

                    {isProcessing && (
                       <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                          <div className="relative">
                             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
                             <Loader2 size={48} className="animate-spin text-blue-600 relative z-10" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Listening and analyzing...</p>
                       </div>
                    )}

                    {result && (
                       <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <section>
                             <div className="flex items-center space-x-2 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Original Text ({LANGUAGES.find(l => l.code === sourceLang)?.name})</h4>
                             </div>
                             <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-white/5 font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                {result.transcription}
                             </div>
                          </section>

                          <section>
                             <div className="flex items-center space-x-2 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Translated Text ({LANGUAGES.find(l => l.code === targetLang)?.name})</h4>
                             </div>
                             <div className="p-6 bg-white dark:bg-indigo-900/5 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20 font-bold text-sm leading-relaxed text-slate-800 dark:text-white shadow-sm">
                                {result.translation}
                             </div>
                          </section>
                       </div>
                    )}
                 </div>
              </div>

           </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
           <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Voice Tool Version 1.0</span>
           <div className="flex items-center space-x-2">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Secure Process</span>
           </div>
        </footer>
      </div>
    </div>
  );
};
