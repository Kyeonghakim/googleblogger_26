-- Initial Schema for YouTube Blogger

-- Table for storing draft blog posts
CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    source_video_url TEXT,
    source_video_id TEXT UNIQUE,
    content_type TEXT,
    seo_keywords TEXT,
    status TEXT DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Table for application settings
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
);

-- Table for tracking publication history
CREATE TABLE IF NOT EXISTS publish_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draft_id INTEGER NOT NULL,
    blogger_post_id TEXT,
    published_at INTEGER NOT NULL,
    FOREIGN KEY (draft_id) REFERENCES drafts(id)
);

-- Index for drafts status
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);

-- Index for publish_history draft_id
CREATE INDEX IF NOT EXISTS idx_publish_history_draft_id ON publish_history(draft_id);
