
-- SMAL - Smart Meeting & Attendance Logger
-- Migration: Support for FOIA, Translation Hub, and Approval Protocols

-- 1. FOIA Request Management Table
CREATE TABLE IF NOT EXISTS foia_requests (
    id TEXT PRIMARY KEY,
    requester_name TEXT NOT NULL,
    organization TEXT,
    meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('PENDING', 'REDACTION_NEEDED', 'APPROVED', 'RELEASED', 'REJECTED')) DEFAULT 'PENDING',
    request_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    public_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Neural Translation Hub Archive
-- Stores history of voice transcriptions and translations
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

-- 3. Meeting Approval Chain
-- Tracks multi-step sign-offs for official minutes
CREATE TABLE IF NOT EXISTS meeting_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    label TEXT NOT NULL,
    role_required TEXT REFERENCES roles(id),
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    signed_by TEXT REFERENCES users(id),
    signed_by_name TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    signature_hash TEXT,
    UNIQUE(meeting_id, step_id)
);

-- 4. Compliance Issue Tracking
CREATE TABLE IF NOT EXISTS compliance_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    severity TEXT CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
    description TEXT NOT NULL,
    policy_reference TEXT,
    decision_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed Data for FOIA Portal Demo
INSERT INTO foia_requests (id, requester_name, organization, status, request_date, due_date) VALUES 
('FOIA-2025-001', 'Sarah Jenkins', 'Public Policy Center', 'PENDING', '2025-05-10', '2025-05-24'),
('FOIA-2025-002', 'National Press', 'Press Corps', 'RELEASED', '2025-05-08', '2025-05-22'),
('FOIA-2025-003', 'Independent Auditor', 'Transparency Int', 'REDACTION_NEEDED', '2025-05-12', '2025-05-26')
ON CONFLICT (id) DO NOTHING;

-- 6. Grant Permissions (Bypass RLS for institutional demo nodes)
ALTER TABLE foia_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE voice_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_issues DISABLE ROW LEVEL SECURITY;
