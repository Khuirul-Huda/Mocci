-- Mocci Discord Bot - Supabase Database Schema
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CODE SNIPPETS ====================
CREATE TABLE IF NOT EXISTS snippets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at BIGINT NOT NULL,
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_snippets_user ON snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_created ON snippets(created_at DESC);

-- ==================== LEETCODE CACHE ====================
CREATE TABLE IF NOT EXISTS leetcode_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    content TEXT NOT NULL,
    cached_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leetcode_difficulty ON leetcode_cache(difficulty);

-- ==================== AI CHANNELS ====================
CREATE TABLE IF NOT EXISTS ai_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_channels_guild ON ai_channels(guild_id);

-- ==================== AI MEMORY ====================
CREATE TABLE IF NOT EXISTS ai_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_memory_lookup ON ai_memory(guild_id, channel_id, user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_memory_timestamp ON ai_memory(timestamp);

-- ==================== USER PREFERENCES ====================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON user_preferences(user_id);

-- ==================== NEW FEATURES TABLES ====================

-- User Levels & XP System
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    messages_count INTEGER DEFAULT 0,
    last_xp_gain BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_levels_guild ON user_levels(guild_id, level DESC, xp DESC);
CREATE INDEX IF NOT EXISTS idx_levels_user ON user_levels(guild_id, user_id);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    guild_id TEXT,
    channel_id TEXT NOT NULL,
    message TEXT NOT NULL,
    remind_at BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(remind_at) WHERE completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id, completed);

-- Custom Commands (per server)
CREATE TABLE IF NOT EXISTS custom_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    trigger TEXT NOT NULL,
    response TEXT NOT NULL,
    created_by TEXT NOT NULL,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(guild_id, trigger)
);

CREATE INDEX IF NOT EXISTS idx_custom_cmds_guild ON custom_commands(guild_id);

-- Server Logs (moderation actions)
CREATE TABLE IF NOT EXISTS server_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    log_type TEXT NOT NULL,
    moderator_id TEXT,
    target_id TEXT,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_guild ON server_logs(guild_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_type ON server_logs(guild_id, log_type);

-- Warnings System
CREATE TABLE IF NOT EXISTS warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(guild_id, user_id, active);

-- Starboard (star messages)
CREATE TABLE IF NOT EXISTS starboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    message_id TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT,
    star_count INTEGER DEFAULT 1,
    starboard_message_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_starboard_guild ON starboard(guild_id, star_count DESC);
CREATE INDEX IF NOT EXISTS idx_starboard_message ON starboard(message_id);

-- Giveaways
CREATE TABLE IF NOT EXISTS giveaways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    host_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    winner_count INTEGER DEFAULT 1,
    ends_at BIGINT NOT NULL,
    ended BOOLEAN DEFAULT FALSE,
    winners TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giveaways_active ON giveaways(ends_at) WHERE ended = FALSE;
CREATE INDEX IF NOT EXISTS idx_giveaways_guild ON giveaways(guild_id, ended);

-- Suggestions
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    message_id TEXT,
    staff_response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_guild ON suggestions(guild_id, status, created_at DESC);

-- Auto Roles (role assignment on join)
CREATE TABLE IF NOT EXISTS auto_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(guild_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_auto_roles_guild ON auto_roles(guild_id);

-- Reaction Roles
CREATE TABLE IF NOT EXISTS reaction_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    role_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reaction_roles_message ON reaction_roles(message_id);

-- Temporary Voice Channels
CREATE TABLE IF NOT EXISTS temp_voice_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    channel_id TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temp_voice_guild ON temp_voice_channels(guild_id);
CREATE INDEX IF NOT EXISTS idx_temp_voice_owner ON temp_voice_channels(owner_id);

-- Welcome Messages
CREATE TABLE IF NOT EXISTS welcome_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    message_template TEXT NOT NULL,
    embed_enabled BOOLEAN DEFAULT FALSE,
    embed_color TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Afk Status
CREATE TABLE IF NOT EXISTS afk_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    message TEXT NOT NULL,
    set_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_afk_user ON afk_status(user_id);

-- Bot Settings (for persistent bot configuration)
CREATE TABLE IF NOT EXISTS bot_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_settings_key ON bot_settings(setting_key);

-- ==================== ROW LEVEL SECURITY (Optional) ====================
-- Uncomment if you want to enable RLS for additional security

-- ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- ==================== CLEANUP FUNCTION ====================
-- Automatic cleanup of old AI memory (run daily via Supabase cron)
CREATE OR REPLACE FUNCTION cleanup_old_ai_memory()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_memory 
    WHERE timestamp < (EXTRACT(EPOCH FROM NOW()) * 1000 - 3600000);
END;
$$ LANGUAGE plpgsql;
