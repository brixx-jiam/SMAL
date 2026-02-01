
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { Loader2, X, Mic, Activity, BrainCircuit, Sparkles } from 'lucide-react';
import { User, ViewType } from '../types';
import React, { useState, useEffect, useRef } from 'react';

interface JiamLiveProps {
  user: User;
  onNavigate: (view: ViewType) => void;
  onActionTriggered: (action: string, data: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export const JiamLive: React.FC<JiamLiveProps> = ({ user, onNavigate, onActionTriggered, isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isJiamThinking, setIsJiamThinking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, OUTPUT_SAMPLE_RATE);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const stopSession = () => {
    setIsActive(false);
    setIsJiamThinking(false);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (processorRef.current) processorRef.current.disconnect();
    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setTranscript('');
    onClose();
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are Jiam, the Sovereign Intelligence layer. Persona: Senior Apple Engineer with 50 years experience. Critical thinker, minimalist, strategic advisor. You are currently in a voice conversation mode. Be concise, brilliant, and proactive.`,
          tools: [{
            functionDeclarations: [
              { 
                name: 'navigate_app', 
                description: 'Switch application views immediately.',
                parameters: { 
                  type: Type.OBJECT, 
                  properties: { 
                    view: { 
                      type: Type.STRING,
                      enum: ['DASHBOARD', 'MEETINGS', 'ACTION_ITEMS', 'DOCUMENT_CLOUD', 'FOIA_PORTAL', 'SETTINGS', 'ADMIN']
                    } 
                  }, 
                  required: ['view'] 
                } 
              },
              { 
                name: 'create_meeting', 
                description: 'Insert a new meeting record.',
                parameters: { 
                  type: Type.OBJECT, 
                  properties: { 
                    title: { type: Type.STRING },
                    date: { type: Type.STRING },
                    location: { type: Type.STRING }
                  }, 
                  required: ['title'] 
                } 
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then((session) => session.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              // Optionally show AI response text
            }
            if (message.serverContent?.inputTranscription) {
              setTranscript(message.serverContent.inputTranscription.text);
              setIsJiamThinking(true);
            }
            
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'navigate_app') {
                  onNavigate(fc.args.view as ViewType);
                } else {
                  onActionTriggered(fc.name, fc.args);
                }
                sessionPromise.then((session) => session.sendToolResponse({ 
                  functionResponses: { id: fc.id, name: fc.name, response: { status: 'DONE' } } 
                }));
              }
            }
            
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsJiamThinking(false);
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              const now = audioContextRef.current.currentTime;
              const startTime = Math.max(now, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.turnComplete) setIsJiamThinking(false);
          },
          onerror: stopSession,
          onclose: stopSession
        }
      });
    } catch (err) { setIsConnecting(false); }
  };

  useEffect(() => {
    if (isOpen && !isActive && !isConnecting) startSession();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[6000] flex flex-col items-center pb-8 md:pb-12 pointer-events-none animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-visible">
      
      {/* Subtle Bottom Vignette */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none blur-3xl rounded-t-[5rem]"></div>
      
      {/* Interaction Interface Container */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center pointer-events-auto">
        
        {/* Holographic Transcription Trace */}
        <div className="mb-6 text-center h-20 flex items-end justify-center px-4 w-full">
          {transcript && (
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 px-6 py-3 rounded-3xl shadow-2xl animate-in zoom-in-90 slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
               <p className="text-white text-xs md:text-sm font-black tracking-tight leading-tight">
                 {transcript}
               </p>
            </div>
          )}
          {!transcript && !isJiamThinking && isActive && (
             <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Neural Uplink Active</p>
          )}
          {isJiamThinking && (
             <div className="flex items-center space-x-2 text-blue-400">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-150"></div>
             </div>
          )}
        </div>

        {/* The Neural Orb */}
        <div className="relative group cursor-pointer" onClick={stopSession}>
          {isActive && (
            <>
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-neural-expand"></div>
              <div className="absolute inset-0 bg-purple-500/5 rounded-full animate-neural-expand delay-700"></div>
            </>
          )}

          <div className="relative w-32 h-32 md:w-40 md:h-40 animate-orb-float">
             <div className={`absolute -inset-8 rounded-full bg-blue-500/10 blur-[50px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
             <div className={`absolute inset-0 siri-neural-orb orb-shadow transition-all duration-1000 ${isActive ? 'scale-100 opacity-100 animate-siri-liquid' : 'scale-50 opacity-0'}`}></div>
             <div className="absolute inset-0 glass-sphere rounded-full shadow-inner"></div>

             <div className="absolute inset-0 flex items-center justify-center">
                {isConnecting ? (
                  <Loader2 size={24} className="text-white animate-spin opacity-40" />
                ) : isJiamThinking ? (
                  <BrainCircuit size={28} className="text-white animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-pulse"></div>
                )}
             </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
           <div className="flex items-center space-x-3 opacity-40 hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Tap to dismiss</span>
              <div className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-90" onClick={stopSession}>
                 <X size={12} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
