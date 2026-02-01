
import React, { useState, useEffect } from 'react';
import { CloudDocument, User } from '../types';
import { getCloudDocuments, uploadCloudDocument, deleteCloudDocument } from '../services/supabase';
import { 
  Search, Trash2, FileText, Download, ShieldCheck, 
  Loader2, X, FileUp, HardDrive, Calendar, Tag, 
  ShieldAlert, Database
} from 'lucide-react';

interface DocumentCloudProps {
  user: User;
}

const CATEGORIES = [
  { id: 'ALL', label: 'Global Archive' },
  { id: 'POLICY', label: 'Policy' },
  { id: 'REPORT', label: 'Reports' },
  { id: 'CONTRACT', label: 'Contracts' },
  { id: 'LEGAL', label: 'Legal' }
];

export const DocumentCloud: React.FC<DocumentCloudProps> = ({ user }) => {
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<CloudDocument['category']>('POLICY');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getCloudDocuments();
      setDocuments(docs || []);
    } catch (err) {
      console.error("Vault Connectivity Failure", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowUploadModal(true);
      e.target.value = ''; 
    }
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const newDoc = await uploadCloudDocument(selectedFile, user.id, user.name, uploadCategory); 
      setDocuments(prev => [newDoc, ...prev]);
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (err) {
      alert("ARCHIVAL ERROR: Ensure database connectivity.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (e: React.MouseEvent, doc: CloudDocument) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = doc.url;
    link.setAttribute('download', doc.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (e: React.MouseEvent, doc: CloudDocument) => {
    e.stopPropagation();
    if (confirm(`PURGE PROTOCOL: Delete "${doc.name}"?`)) {
      setActionId(doc.id);
      try {
        const success = await deleteCloudDocument(doc.id);
        if (success) {
          setDocuments(prev => prev.filter(d => d.id !== doc.id));
        }
      } catch (err) {
        alert("Delete failed. Check database permissions.");
      } finally {
        setActionId(null);
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20 max-w-[1000px] mx-auto animate-in fade-in duration-500">
      
      {/* Search and Filter HUD */}
      <header className="px-4 md:px-0 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
               type="text" 
               placeholder="Scan index..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm dark:text-white"
             />
          </div>
          <label htmlFor="artifact-up" className="h-[44px] px-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-95">
             <FileUp size={16} className="mr-2"/> Upload
          </label>
          <input type="file" id="artifact-up" className="hidden" onChange={handleFileSelect} />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
           {CATEGORIES.map(cat => (
             <button
               key={cat.id}
               onClick={() => setCategoryFilter(cat.id)}
               className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                 categoryFilter === cat.id 
                 ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                 : 'bg-white dark:bg-slate-900/50 text-slate-400 border-slate-200 dark:border-white/5'
               }`}
             >
               {cat.label}
             </button>
           ))}
        </div>
      </header>

      {/* High-Fidelity List */}
      <div className="px-4 md:px-0 space-y-3">
         {isLoading ? (
            <div className="py-20 flex flex-col items-center opacity-50">
               <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
         ) : filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
               <div 
                 key={doc.id}
                 className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-3xl shadow-sm transition-all overflow-hidden"
               >
                  {/* Top Segment: Metadata */}
                  <div className="p-4 md:p-5 flex items-center space-x-4">
                     <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <FileText size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-1">
                           {doc.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                           <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <Calendar size={12} className="mr-1.5 text-blue-500" />
                              {new Date(doc.timestamp).toLocaleDateString()}
                           </div>
                           <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <Tag size={12} className="mr-1.5 text-blue-500" />
                              {doc.category}
                           </div>
                           <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <Database size={12} className="mr-1.5 text-blue-500" />
                              {doc.size}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Horizontal Separator */}
                  <div className="px-5"><div className="h-[1px] bg-slate-50 dark:bg-white/5 w-full"></div></div>

                  {/* Bottom Segment: Uploader & Controls */}
                  <div className="p-4 md:p-5 flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white border border-slate-100 dark:border-white/5">
                           {doc.uploadedByName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Uplinked By</p>
                           <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{doc.uploadedByName}</p>
                        </div>
                     </div>

                     <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => handleDownload(e, doc)}
                          className="w-11 h-11 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center transition-all active:scale-90"
                        >
                           <Download size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, doc)}
                          disabled={actionId === doc.id}
                          className="w-11 h-11 bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-500 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                        >
                           {actionId === doc.id ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />}
                        </button>
                     </div>
                  </div>
               </div>
            ))
         ) : (
            <div className="py-20 flex flex-col items-center opacity-30 text-center">
               <ShieldAlert size={48} className="mb-2 text-slate-400" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Vault Unoccupied</p>
            </div>
         )}
      </div>

      {/* Modal - Slightly smaller */}
      {showUploadModal && (
         <div className="fixed inset-0 bg-slate-950/90 z-[5000] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 border border-white/10 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">New Archive</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full"><X size={18}/></button>
             </div>
             
             <div className="bg-blue-600/5 p-6 rounded-2xl border border-blue-600/10 flex flex-col items-center mb-6">
                <FileText size={32} className="text-blue-600 mb-2" />
                <p className="text-xs font-black dark:text-white text-center truncate w-full px-2">{selectedFile?.name}</p>
             </div>

             <form onSubmit={handleConfirmUpload} className="space-y-6">
               <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.filter(c => c.id !== 'ALL').map(c => (
                     <button
                        key={c.id}
                        type="button"
                        onClick={() => setUploadCategory(c.id as any)}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                           uploadCategory === c.id 
                           ? 'bg-blue-600 text-white border-blue-500' 
                           : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/5'
                        }`}
                     >
                        {c.label}
                     </button>
                  ))}
               </div>
               <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center disabled:opacity-50"
               >
                  {isUploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <ShieldCheck size={16} className="mr-2"/>}
                  Finalize
               </button>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};
