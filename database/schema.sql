
-- SMAL - Smart Meeting & Attendance Logger
-- INTEGRATED SOVEREIGN CORE SCHEMA v5.2 (IDEMPOTENT & CASCADING)

-- 1. Personnel Infrastructure
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT REFERENCES roles(id) ON DELETE SET NULL,
    department TEXT,
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    hourly_rate NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Institutional Archive (Meetings)
CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location TEXT,
    status TEXT DEFAULT 'SCHEDULED',
    organizer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    qr_code_url TEXT,
    agenda JSONB DEFAULT '[]',
    attendees JSONB DEFAULT '[]', 
    transcript TEXT,
    minutes JSONB,
    minute_history JSONB DEFAULT '[]',
    current_cost NUMERIC(12, 2) DEFAULT 0.00,
    legislative_links JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Traceability (Attendance & Actions)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    method TEXT CHECK (method IN ('QR', 'MANUAL', 'NFC', 'GEOFENCE', 'FACE_ID', 'BIOMETRIC', 'BLOCKCHAIN')),
    status TEXT CHECK (status IN ('PRESENT', 'LATE', 'EXCUSED')),
    verified_location TEXT,
    verification_hash TEXT 
);

CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    deadline DATE,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transparency & FOIA Management
CREATE TABLE IF NOT EXISTS foia_requests (
    id TEXT PRIMARY KEY, 
    requester_name TEXT NOT NULL,
    organization TEXT,
    meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('PENDING', 'REDACTION_NEEDED', 'APPROVED', 'RELEASED', 'REJECTED')) DEFAULT 'PENDING',
    request_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    public_link TEXT, 
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Neural Translation Hub Archive
CREATE TABLE IF NOT EXISTS voice_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    original_transcription TEXT,
    translated_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Meeting Approval Chain
CREATE TABLE IF NOT EXISTS meeting_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    label TEXT NOT NULL,
    role_required TEXT REFERENCES roles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    signed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    signed_by_name TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    signature_hash TEXT,
    UNIQUE(meeting_id, step_id)
);

-- 7. Initial Seed Data
INSERT INTO roles (id, name, description, is_system) VALUES 
('ADMIN', 'Super Admin Sovereign', 'Full access to system protocols and neural layers.', true),
('MINISTER', 'Cabinet Minister', 'High-tier strategic decision maker.', true),
('DIRECTOR', 'Departmental Director', 'Managerial oversight of directorate nodes.', true),
('SECRETARIAT', 'Official Secretariat', 'Responsible for official minutes and record keeping.', true),
('STAFF', 'Personnel Node', 'Standard institutional participant.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role, department, avatar, hourly_rate) VALUES 
('u_admin_01', 'Super Admin Sovereign', 'admin@gov.smal', 'ADMIN', 'Executive Office', 'https://files.catbox.moe/a27w5a.jpeg', 250.00)
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    avatar = EXCLUDED.avatar,
    hourly_rate = EXCLUDED.hourly_rate
WHERE users.email = 'admin@gov.smal';

-- Audit Logging Bypass
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE action_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE foia_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE voice_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_approvals DISABLE ROW LEVEL SECURITY;
