
import { createClient } from '@supabase/supabase-js';
import { Meeting, User, RoleDefinition, ToDoItem, CloudDocument, Permission, Notification, FoiaRequest, AttendanceRecord } from '../types';

const supabaseUrl = 'https://aqieqobhgzucdunecfsg.supabase.co';
const supabaseKey = 'sb_publishable_ZbAT-gPj8jNThx3EfvZY4g_R09a0yM9';
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Unified Schema Mappers ---

const mapMeetingToDb = (m: Partial<Meeting>) => ({
  id: m.id,
  title: m.title,
  date: m.date,
  start_time: m.startTime,
  end_time: m.endTime,
  location: m.location,
  status: m.status,
  organizer_id: m.organizerId,
  agenda: m.agenda,
  attendees: m.attendees,
  transcript: m.transcript,
  minutes: m.minutes,
  current_cost: m.currentCost,
  legislative_links: m.legislativeLinks
});

const mapDbToMeeting = (m: any): Meeting => ({
  id: m.id,
  title: m.title,
  date: m.date,
  startTime: m.start_time,
  endTime: m.end_time,
  location: m.location,
  status: m.status,
  organizerId: m.organizer_id,
  qrCodeUrl: m.qr_code_url || '',
  agenda: m.agenda || [],
  attendees: m.attendees || [],
  transcript: m.transcript,
  minutes: m.minutes,
  currentCost: parseFloat(m.current_cost || "0"),
  legislativeLinks: m.legislative_links || []
});

// --- Core Database Operations ---

export const getMeetings = async (): Promise<Meeting[]> => {
  const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: false });
  if (error) return [];
  return (data || []).map(mapDbToMeeting);
};

export const createMeeting = async (m: Meeting) => {
  const { error } = await supabase.from('meetings').insert([mapMeetingToDb(m)]);
  if (error) throw error;
};

export const updateMeeting = async (id: string, updates: any) => {
  const { error } = await supabase.from('meetings').update(mapMeetingToDb(updates)).eq('id', id);
  if (error) throw error;
};

export const deleteMeeting = async (id: string) => {
  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) throw error;
};

// --- Attendance Operations ---

export const markAttendanceRecord = async (record: Partial<AttendanceRecord>) => {
  const { error } = await supabase.from('attendance_records').insert([{
    meeting_id: record.meetingId,
    user_id: record.userId,
    status: record.status,
    method: record.method,
    timestamp: new Date().toISOString(),
    verification_hash: (record as any).verificationHash || null
  }]);
  if (error) throw error;
};

export const getAttendance = async (meetingId: string) => {
  const { data, error } = await supabase.from('attendance_records').select('*').eq('meeting_id', meetingId);
  if (error) return [];
  return (data || []).map(r => ({ 
    id: r.id,
    meetingId: r.meeting_id, 
    userId: r.user_id,
    timestamp: r.timestamp,
    method: r.method,
    status: r.status,
    verifiedLocation: r.verified_location
  }));
};

// --- FOIA Operations ---

export const getFoiaRequests = async (): Promise<FoiaRequest[]> => {
  const { data, error } = await supabase.from('foia_requests').select('*').order('request_date', { ascending: false });
  if (error) return [];
  return data.map(r => ({
    id: r.id,
    requesterName: r.requester_name,
    organization: r.organization,
    meetingId: r.meeting_id,
    status: r.status,
    requestDate: r.request_date,
    dueDate: r.due_date,
    publicLink: r.public_link
  }));
};

// --- Translation Hub Operations ---

export const saveTranslationArtifact = async (userId: string, fileName: string, sourceLang: string, targetLang: string, transcription: string, translation: string) => {
  const { error } = await supabase.from('voice_translations').insert([{
    user_id: userId,
    file_name: fileName,
    source_language: sourceLang,
    target_language: targetLang,
    original_transcription: transcription,
    translated_text: translation
  }]);
  if (error) throw error;
};

export const getTranslationHistory = async (userId: string) => {
  const { data, error } = await supabase.from('voice_translations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return [];
  return data;
};

// --- Personnel Operations ---

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return [];
  return (data || []).map(u => ({ ...u, isActive: u.is_active, hourlyRate: parseFloat(u.hourly_rate || "0") }));
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.department) dbUpdates.department = updates.department;
  if (updates.avatar) dbUpdates.avatar = updates.avatar;
  if (updates.role) dbUpdates.role = updates.role;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.hourlyRate !== undefined) dbUpdates.hourly_rate = updates.hourlyRate;
  
  const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
  if (error) throw error;
};

export const getRoles = async (): Promise<RoleDefinition[]> => {
  const { data: roles } = await supabase.from('roles').select('*');
  const { data: perms } = await supabase.from('role_permissions').select('*');
  return (roles || []).map(role => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.is_system,
    permissions: (perms || []).filter(p => p.role_id === role.id).map(p => p.permission_id as Permission)
  }));
};

// --- Cloud Document Operations ---

export const getCloudDocuments = async (): Promise<CloudDocument[]> => {
  const { data, error } = await supabase.from('cloud_documents').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Cloud Access Protocol Denied:", error);
    return [];
  }
  return (data || []).map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.mime_type,
    size: `${((doc.size_bytes || 0) / (1024 * 1024)).toFixed(2)} MB`,
    url: doc.url || '', 
    uploadedBy: doc.uploaded_by,
    uploadedByName: doc.uploaded_by_name || 'Authorized Node',
    timestamp: doc.created_at,
    category: doc.category || 'OTHER',
    isSecured: doc.is_secured ?? true
  }));
};

export const uploadCloudDocument = async (file: File, userId: string, userName: string, category: string): Promise<CloudDocument> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const payload: any = {
        name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        url: base64, 
        uploaded_by: userId,
        uploaded_by_name: userName,
        category: category,
        is_secured: true
      };
      const { data, error } = await supabase.from('cloud_documents').insert([payload]).select().single();
      if (error) reject(error);
      else resolve({
          id: data.id, 
          name: data.name, 
          type: data.mime_type, 
          size: `${(data.size_bytes / (1024*1024)).toFixed(2)} MB`,
          url: data.url, 
          uploadedBy: data.uploaded_by, 
          uploadedByName: data.uploaded_by_name || 'System Node',
          timestamp: data.created_at, 
          category: data.category, 
          isSecured: data.is_secured
      });
    };
    reader.onerror = () => reject(new Error("Local artifact read failure."));
    reader.readAsDataURL(file);
  });
};

export const deleteCloudDocument = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('cloud_documents').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// --- Utilities ---

export const createToDo = async (t: Partial<ToDoItem>) => {
  const { error } = await supabase.from('todos').insert([{
    user_id: t.userId, text: t.text, priority: t.priority
  }]);
  if (error) throw error;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
  if (error) return [];
  return (data || []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as any,
    timestamp: n.timestamp,
    isRead: n.is_read,
    userId: n.user_id
  }));
};

export const markNotificationRead = async (id: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
};

export const markNotificationUnread = async (id: string) => {
  await supabase.from('notifications').update({ is_read: false }).eq('id', id);
};

export const deleteNotification = async (id: string) => {
  await supabase.from('notifications').delete().eq('id', id);
};

export const subscribeToSystem = (cb: () => void) => {
  const channel = supabase.channel('system-changes').on('postgres_changes', { event: '*', schema: 'public' }, cb).subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
};
