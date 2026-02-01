
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MeetingMinutes, ComplianceIssue, ExecutiveBrief, CrisisPlan, LegislativeLink } from "../types";

const getValidApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key === 'null' || key === '') {
    throw new Error("API_KEY_MISSING");
  }
  return key;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * decode converts a base64 encoded string into a Uint8Array of raw bytes.
 */
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * decodeAudioData decodes a Uint8Array of raw PCM audio data into an AudioBuffer.
 * This is required as Gemini TTS returns raw PCM audio without a standard container header.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Updated: Model to gemini-3-flash-preview for basic text task
export const generateMeetingAgenda = async (prompt: string, existingItems: string[] = []): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    contents: `Generate a structured meeting agenda based on this prompt: "${prompt}". Existing items to consider: ${JSON.stringify(existingItems)}`
  });
  return JSON.parse(response.text || '[]');
};

// Updated: Model to gemini-3-flash-preview
export const queryKnowledgeWithGrounding = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
      text: response.text || "No results found.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Grounding Error:", error);
    return { text: "Search grounding is currently unavailable. Please try again later.", sources: [] };
  }
};

export const generateCabinetBriefingAudio = async (briefingText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const prompt = `TTS the following executive briefing as a professional conversation between two high-level officials, Joe (Senior Advisor) and Jane (Chief of Staff). 
  Joe provides the technical details and Jane provides the strategic context.
  
  Briefing Content:
  ${briefingText}`;

  try {
    // Corrected responseModalities property name (fixed potential typo responseModalalities)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Joe',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              },
              {
                speaker: 'Jane',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
              }
            ]
          }
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (error) {
    console.warn("Multi-speaker TTS failed, falling back to single speaker.", error);
    try {
      // Fix: Ensured correct spelling of responseModalities in fallback block as well
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Briefing Summary: ${briefingText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });
      return fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch (fallbackError) {
      console.error("Critical TTS Failure:", fallbackError);
      throw new Error("AUDIO_SYNTHESIS_FAILED");
    }
  }
};

export const generateAudioBriefing = generateCabinetBriefingAudio;

// Updated: Model to gemini-3-pro-preview for complex reasoning task
export const generateMeetingMinutes = async (transcript: string, customInstruction: string = "", language: string = "English"): Promise<MeetingMinutes> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: `As a Senior Government Secretary, analyze this transcript and produce official structured minutes. 
    Language: ${language}. 
    
    TRANSCRIPT:
    "${transcript}" 

    ${customInstruction ? `SPECIAL DIRECTIVE: "${customInstruction}"` : ""}
    
    CRITICAL INSTRUCTION FOR ACTION ITEMS:
    1. Identify every task, commitment, or follow-up mentioned.
    2. Extract the name of the assignee as mentioned (e.g., "John", "Director Smith").
    3. If a deadline is mentioned (e.g., "by Friday", "by Oct 20th"), convert it to YYYY-MM-DD. If no year is mentioned, assume 2025.
    4. Determine priority (CRITICAL, HIGH, MEDIUM, LOW) based on the tone and impact of the task.
    
    Extract: Summary, Key Points, Decisions, Resolutions, and Action Items.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
          resolutions: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                assigneeId: { type: Type.STRING, description: "Name of the person responsible" },
                deadline: { type: Type.STRING, description: "YYYY-MM-DD format" },
                priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW", "CRITICAL"] }
              },
              required: ["description", "priority"]
            }
          }
        },
        required: ["summary", "keyPoints", "decisions", "resolutions", "actionItems"]
      }
    }
  });
  return JSON.parse(response.text || '{}') as MeetingMinutes;
};

// Updated: Model to gemini-3-flash-preview
export const transcribeAndTranslateAudio = async (file: File, sourceLang: string, targetLang: string): Promise<{ transcription: string, translation: string }> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const base64Data = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: `Transcribe this audio accurately in its original language (${sourceLang}). 
                Then, translate that transcription into ${targetLang}.
                Return your response as a JSON object with two fields: 'transcription' and 'translation'.` },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcription: { type: Type.STRING },
          translation: { type: Type.STRING }
        },
        required: ["transcription", "translation"]
      }
    }
  });
  return JSON.parse(response.text || '{"transcription": "", "translation": ""}');
};

// Updated: Model to gemini-3-pro-preview
export const verifyDocumentAuthenticity = async (fileName: string, fileData: string): Promise<{verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'INCONCLUSIVE', reasoning: string}> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      { text: `Analyze this government document artifact: "${fileName}". The following is the base64 encoded data content (truncated or header). 
      Assess its institutional authenticity. Look for markers of official government formatting, internal consistency, and potential signs of digital tampering or non-standard authorship.
      
      Artifact Context:
      ${fileData.substring(0, 5000)} 
      
      Return a verdict and detailed reasoning.` },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ["AUTHENTIC", "SUSPICIOUS", "INCONCLUSIVE"] },
          reasoning: { type: Type.STRING }
        },
        required: ["verdict", "reasoning"]
      }
    }
  });
  return JSON.parse(response.text || '{"verdict": "INCONCLUSIVE", "reasoning": "Synthesis failed."}');
};

// Updated: Model to gemini-3-flash-preview
export const transcribeAudio = async (file: File): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const base64Data = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: "Transcribe this audio file accurately." },
      ],
    },
  });
  return response.text || "";
};

// Updated: Model to gemini-3-flash-preview
export const generateDailyPlan = async (prompt: string): Promise<{text: string, priority: string}[]> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Daily plan for: "${prompt}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] }
          },
          required: ["text", "priority"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

// Updated: Model to gemini-3-pro-preview
export const generateCrisisPlan = async (incident: string): Promise<CrisisPlan> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Crisis plan for: "${incident}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          communicationDraft: { type: Type.STRING },
          stakeholdersToNotify: { type: Type.ARRAY, items: { type: Type.STRING } },
          severityLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
        },
        required: ["immediateActions", "communicationDraft", "stakeholdersToNotify", "severityLevel"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// Updated: Model to gemini-3-flash-preview
export const queryKnowledgeBase = async (query: string, context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getValidApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Context: ${context}\nQuestion: ${query}`,
  });
  return response.text || "No synthesis available.";
};
