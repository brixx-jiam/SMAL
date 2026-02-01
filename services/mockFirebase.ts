
import { supabase } from "./supabase";
import { Meeting, ActionItem, AttendanceRecord, User, RoleDefinition, ToDoItem, CloudDocument, Permission } from "../types";

// Unified Object Mappers (JS CamelCase -> DB SnakeCase)
const mapMeetingToDb = (m: Partial<Meeting>) => ({
  id: m.id,
  title: m.title,
  date: m.date,
  start_time: m.startTime,
  end_time: m.endTime,
  location: m.location,
  status: m.status,
  organizer_id: m.organizerId,
  qr_code_url: m.qrCodeUrl,
  agenda: m.agenda,
  attendees: m.attendees,
  transcript: m.transcript,
  minutes: m.minutes,
  minute_history: m.minuteHistory,
  current_cost: m.currentCost,
  legislative_links: m.legislativeLinks
});

const mapToDoToDb = (t: Partial<ToDoItem>) => ({
  id: t.id,
  user_id: t.userId,
  text: t.text,
  is_completed: t.isCompleted,
  priority: t.priority,
  timestamp: t.timestamp
});

// Real-time Event Hub
type Listener = () => void;
let globalListeners: Listener[] = [];

const notifyAll = () => globalListeners.forEach(cb => cb());

export const subscribeToSystem = (cb: () => void) => {
  globalListeners.push(cb);
  return { unsubscribe: () => { globalListeners = globalListeners.filter(l => l !== cb); } };
};

export const getMeetings = async (): Promise<Meeting[]> => { 
  const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: false });
  if (error) return [];
  return (data || []).map(m => ({
    id: m.id,
    title: m.title,
    date: m.date,
    startTime: m.start_time,
    endTime: m.end_time,
    location: m.location,
    status: m.status,
    organizerId: m.organizer_id,
    qrCodeUrl: m.qr_code_url,
    agenda: m.agenda,
    attendees: m.attendees,
    transcript: m.transcript,
    minutes: m.minutes,
    minuteHistory: m.minute_history,
    currentCost: parseFloat(m.current_cost || "0"),
    legislativeLinks: m.legislative_links
  }));
};

export const createMeeting = async (m: Meeting) => { 
  await supabase.from('meetings').insert([mapMeetingToDb(m)]); 
  notifyAll();
};

export const getToDos = async (userId: string): Promise<ToDoItem[]> => {
  const { data, error } = await supabase.from('todos').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
  if (error) return [];
  return (data || []).map(t => ({
    id: t.id,
    userId: t.user_id,
    text: t.text,
    isCompleted: t.is_completed,
    priority: t.priority,
    timestamp: t.timestamp
  }));
};

export const createToDo = async (t: ToDoItem) => {
  await supabase.from('todos').insert([mapToDoToDb(t)]);
  notifyAll();
};

// Added bulkCreateToDos to support batch task creation from AI planning.
export const bulkCreateToDos = async (tasks: ToDoItem[]) => {
  const dbTasks = tasks.map(mapToDoToDb);
  await supabase.from('todos').insert(dbTasks);
  notifyAll();
};

export const updateToDo = async (id: string, updates: any) => {
  await supabase.from('todos').update(mapToDoToDb(updates)).eq('id', id);
  notifyAll();
};

export const deleteToDo = async (id: string) => {
  await supabase.from('todos').delete().eq('id', id);
  notifyAll();
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

export const getUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('users').select('*');
  return (data || []).map(u => ({ ...u, isActive: u.is_active, hourlyRate: parseFloat(u.hourly_rate || "0") }));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  if (!data) return undefined;
  return { ...data, isActive: data.is_active, hourlyRate: parseFloat(data.hourly_rate || "0") };
};

export const getActionItems = async (): Promise<ActionItem[]> => {
  const { data } = await supabase.from('action_items').select('*');
  return (data || []).map(a => ({
    id: a.id,
    meetingId: a.meeting_id,
    description: a.description,
    assigneeId: a.assignee_id,
    deadline: a.deadline,
    priority: a.priority,
    status: a.status
  }));
};

export const getCloudDocuments = async (): Promise<CloudDocument[]> => {
  const { data } = await supabase.from('cloud_documents').select('*').order('created_at', { ascending: false });
  return (data || []).map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.mime_type,
    size: `${((doc.size_bytes || 0) / (1024 * 1024)).toFixed(2)} MB`,
    url: doc.content, 
    uploadedBy: doc.uploaded_by,
    uploadedByName: doc.uploaded_by_name,
    timestamp: doc.created_at,
    category: doc.category as any,
    isSecured: doc.is_secured
  }));
};

export const uploadCloudDocument = async (file: File, userId: string, userName: string, category: CloudDocument['category']): Promise<CloudDocument> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dbRow = {
        name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        content: reader.result as string,
        uploaded_by: userId,
        uploaded_by_name: userName,
        category: category,
        is_secured: true
      };
      const { data, error } = await supabase.from('cloud_documents').insert([dbRow]).select().single();
      if (error) reject(error);
      else resolve({
        id: data.id, name: data.name, type: data.mime_type, size: `${(data.size_bytes / (1024 * 1024)).toFixed(2)} MB`,
        url: data.content, uploadedBy: data.uploaded_by, uploadedByName: data.uploaded_by_name,
        timestamp: data.created_at, category: data.category as any, isSecured: data.is_secured
      });
    };
    reader.readAsDataURL(file);
  });
};

export const deleteCloudDocument = async (id: string, currentUserId: string): Promise<boolean> => {
  const { error } = await supabase.from('cloud_documents').delete().eq('id', id);
  return !error;
};

export const getAttendance = async (meetingId: string) => {
  const { data } = await supabase.from('attendance_records').select('*').eq('meeting_id', meetingId);
  return (data || []).map(r => ({ ...r, meetingId: r.meeting_id, userId: r.user_id }));
};

export const updateMeeting = async (id: string, u: any) => { 
  await supabase.from('meetings').update(mapMeetingToDb(u)).eq('id', id); 
  notifyAll();
};

export const deleteMeeting = async (id: string) => { 
  await supabase.from('meetings').delete().eq('id', id); 
  notifyAll();
};

// ... Utility placeholders
export const getRooms = async () => [];
export const updateUser = async (id: string, u: any) => {};
export const deleteActionItem = async (id: string) => {};
export const updateActionItem = async (id: string, u: any) => {};
export const createRole = async (r: any) => {};
export const updateRole = async (id: string, u: any) => {};
export const deleteRole = async (id: string) => {};
export const distributeMinutes = async (meetingId: string) => {};
export const uploadFile = async (f: File, u: string) => ({ id: '1', name: f.name, type: f.type, url: '', uploadedBy: u, timestamp: '' });
export const sendActionReminder = async (id: string, u: string) => {};
export const generateApiToken = async (n: string, s: string) => ({} as any);
export const getApiTokens = async () => [];
export const getAuditLogs = async () => [];
export const checkInUser = async (r: any) => {};
export const getNotifications = async (u: string) => [];
export const markNotificationRead = async (i: string) => {};
export const markNotificationUnread = async (i: string) => {};
export const deleteNotification = async (i: string) => {};
export const searchKnowledgeBase = async (q: string) => ({ meetings: [], actions: [] });
export const approveMeetingStep = async (m: string, s: string, u: string) => {};
