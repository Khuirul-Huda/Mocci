const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class DB {
    // ========== Snippets ==========
    static async saveSnippet(userId, name, language, code, description = '') {
        const { data, error } = await supabase
            .from('snippets')
            .upsert({
                user_id: userId,
                name,
                language,
                code,
                description,
                created_at: Date.now()
            }, {
                onConflict: 'user_id,name'
            });
        
        if (error) throw error;
        return data;
    }

    static async getSnippet(userId, name) {
        const { data, error } = await supabase
            .from('snippets')
            .select('*')
            .eq('user_id', userId)
            .eq('name', name)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async listSnippets(userId) {
        const { data, error } = await supabase
            .from('snippets')
            .select('name, language, description, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }

    static async deleteSnippet(userId, name) {
        const { error } = await supabase
            .from('snippets')
            .delete()
            .eq('user_id', userId)
            .eq('name', name);
        
        if (error) throw error;
        return true;
    }

    // ========== LeetCode Cache ==========
    static async cacheLeetCodeProblem(problemId, title, difficulty, content) {
        const { data, error } = await supabase
            .from('leetcode_cache')
            .upsert({
                problem_id: problemId,
                title,
                difficulty,
                content,
                cached_at: Date.now()
            }, {
                onConflict: 'problem_id'
            });
        
        if (error) throw error;
        return data;
    }

    static async getLeetCodeProblem(problemId) {
        const { data, error } = await supabase
            .from('leetcode_cache')
            .select('*')
            .eq('problem_id', problemId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async getRandomLeetCode(difficulty = null) {
        let query = supabase
            .from('leetcode_cache')
            .select('*');
        
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) return null;
        return data[Math.floor(Math.random() * data.length)];
    }

    // ========== AI Channels ==========
    static async setAIChannel(guildId, channelId) {
        const { data, error } = await supabase
            .from('ai_channels')
            .upsert({
                guild_id: guildId,
                channel_id: channelId
            }, {
                onConflict: 'guild_id'
            });
        
        if (error) throw error;
        return data;
    }

    static async getAIChannel(guildId) {
        const { data, error } = await supabase
            .from('ai_channels')
            .select('channel_id')
            .eq('guild_id', guildId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data?.channel_id || null;
    }

    // ========== AI Memory ==========
    static async saveAIMessage(guildId, channelId, userId, role, content) {
        const { data, error } = await supabase
            .from('ai_memory')
            .insert({
                guild_id: guildId,
                channel_id: channelId,
                user_id: userId,
                role,
                content,
                timestamp: Date.now()
            });
        
        if (error) throw error;
        return data;
    }

    static async getAIMemory(guildId, channelId, userId, maxAge = 3600000) {
        const cutoffTime = Date.now() - maxAge;
        
        const { data, error } = await supabase
            .from('ai_memory')
            .select('role, content, timestamp')
            .eq('guild_id', guildId)
            .eq('channel_id', channelId)
            .eq('user_id', userId)
            .gt('timestamp', cutoffTime)
            .order('timestamp', { ascending: true });
        
        if (error) throw error;
        return data || [];
    }

    static async cleanOldAIMemory(maxAge = 3600000) {
        const cutoffTime = Date.now() - maxAge;
        
        const { error } = await supabase
            .from('ai_memory')
            .delete()
            .lt('timestamp', cutoffTime);
        
        if (error) throw error;
        return true;
    }

    // ========== User Preferences ==========
    static async getUserPreference(userId, key) {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('value')
            .eq('user_id', userId)
            .eq('key', key)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data?.value || null;
    }

    static async setUserPreference(userId, key, value) {
        const { data, error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                key,
                value
            }, {
                onConflict: 'user_id,key'
            });
        
        if (error) throw error;
        return data;
    }

    // ========== Leveling & XP ==========
    static async addXP(guildId, userId, xp) {
        const { data: current } = await supabase
            .from('user_levels')
            .select('*')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .single();

        const newXP = (current?.xp || 0) + xp;
        const newLevel = Math.floor(0.1 * Math.sqrt(newXP));
        const oldLevel = current?.level || 1;

        const { data, error } = await supabase
            .from('user_levels')
            .upsert({
                guild_id: guildId,
                user_id: userId,
                xp: newXP,
                level: newLevel,
                messages_count: (current?.messages_count || 0) + 1,
                last_xp_gain: Date.now()
            }, {
                onConflict: 'guild_id,user_id'
            })
            .select()
            .single();

        if (error) throw error;
        return { ...data, leveledUp: newLevel > oldLevel, oldLevel };
    }

    static async getUserLevel(guildId, userId) {
        const { data, error } = await supabase
            .from('user_levels')
            .select('*')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || { xp: 0, level: 1, messages_count: 0 };
    }

    static async getLeaderboard(guildId, limit = 10) {
        const { data, error } = await supabase
            .from('user_levels')
            .select('*')
            .eq('guild_id', guildId)
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    // ========== Warnings & Moderation ==========
    static async addWarning(guildId, userId, moderatorId, reason) {
        const { data, error } = await supabase
            .from('warnings')
            .insert({
                guild_id: guildId,
                user_id: userId,
                moderator_id: moderatorId,
                reason,
                active: true
            })
            .select()
            .single();

        if (error) throw error;
        
        // Log the action
        await this.logModAction(guildId, 'warn', moderatorId, userId, reason);
        
        return data;
    }

    static async getWarnings(guildId, userId, activeOnly = true) {
        let query = supabase
            .from('warnings')
            .select('*')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (activeOnly) {
            query = query.eq('active', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async clearWarnings(guildId, userId) {
        const { error } = await supabase
            .from('warnings')
            .update({ active: false })
            .eq('guild_id', guildId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }

    static async logModAction(guildId, logType, moderatorId, targetId, reason, metadata = {}) {
        const { data, error } = await supabase
            .from('server_logs')
            .insert({
                guild_id: guildId,
                log_type: logType,
                moderator_id: moderatorId,
                target_id: targetId,
                reason,
                metadata
            });

        if (error) throw error;
        return data;
    }

    static async getModLogs(guildId, targetId = null, limit = 20) {
        let query = supabase
            .from('server_logs')
            .select('*')
            .eq('guild_id', guildId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (targetId) {
            query = query.eq('target_id', targetId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    // ========== Starboard ==========
    static async addStar(guildId, messageId, channelId, authorId, content) {
        const { data: existing } = await supabase
            .from('starboard')
            .select('*')
            .eq('message_id', messageId)
            .single();

        if (existing) {
            const { data, error } = await supabase
                .from('starboard')
                .update({ star_count: existing.star_count + 1 })
                .eq('message_id', messageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('starboard')
                .insert({
                    guild_id: guildId,
                    message_id: messageId,
                    channel_id: channelId,
                    author_id: authorId,
                    content,
                    star_count: 1
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    static async removeStar(messageId) {
        const { data: existing } = await supabase
            .from('starboard')
            .select('*')
            .eq('message_id', messageId)
            .single();

        if (existing && existing.star_count > 1) {
            const { data, error } = await supabase
                .from('starboard')
                .update({ star_count: existing.star_count - 1 })
                .eq('message_id', messageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else if (existing) {
            const { error } = await supabase
                .from('starboard')
                .delete()
                .eq('message_id', messageId);

            if (error) throw error;
            return null;
        }
    }

    static async getStarboardMessage(messageId) {
        const { data, error } = await supabase
            .from('starboard')
            .select('*')
            .eq('message_id', messageId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async getTopStarred(guildId, limit = 10) {
        const { data, error } = await supabase
            .from('starboard')
            .select('*')
            .eq('guild_id', guildId)
            .order('star_count', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    static async updateStarboardMessageId(messageId, starboardMessageId) {
        const { error } = await supabase
            .from('starboard')
            .update({ starboard_message_id: starboardMessageId })
            .eq('message_id', messageId);

        if (error) throw error;
        return true;
    }

    // ========== Giveaways ==========
    static async createGiveaway(guildId, channelId, hostId, prize, winnerCount, endsAt) {
        const { data, error } = await supabase
            .from('giveaways')
            .insert({
                guild_id: guildId,
                channel_id: channelId,
                host_id: hostId,
                prize,
                winner_count: winnerCount,
                ends_at: endsAt,
                ended: false
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateGiveawayMessageId(giveawayId, messageId) {
        const { error } = await supabase
            .from('giveaways')
            .update({ message_id: messageId })
            .eq('id', giveawayId);

        if (error) throw error;
        return true;
    }

    static async endGiveaway(giveawayId, winners) {
        const { data, error } = await supabase
            .from('giveaways')
            .update({ 
                ended: true,
                winners: winners
            })
            .eq('id', giveawayId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getActiveGiveaways(guildId = null) {
        let query = supabase
            .from('giveaways')
            .select('*')
            .eq('ended', false)
            .lte('ends_at', Date.now());

        if (guildId) {
            query = query.eq('guild_id', guildId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async getGiveaway(giveawayId) {
        const { data, error } = await supabase
            .from('giveaways')
            .select('*')
            .eq('id', giveawayId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async getGiveawayByMessageId(messageId) {
        const { data, error } = await supabase
            .from('giveaways')
            .select('*')
            .eq('message_id', messageId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // ========== Welcome System ==========
    static async setWelcomeConfig(guildId, channelId, messageTemplate, embedEnabled = false, embedColor = null) {
        const { data, error } = await supabase
            .from('welcome_config')
            .upsert({
                guild_id: guildId,
                channel_id: channelId,
                message_template: messageTemplate,
                embed_enabled: embedEnabled,
                embed_color: embedColor
            }, {
                onConflict: 'guild_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getWelcomeConfig(guildId) {
        const { data, error } = await supabase
            .from('welcome_config')
            .select('*')
            .eq('guild_id', guildId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async deleteWelcomeConfig(guildId) {
        const { error } = await supabase
            .from('welcome_config')
            .delete()
            .eq('guild_id', guildId);

        if (error) throw error;
        return true;
    }

    // ========== AFK System ==========
    static async setAFK(userId, message) {
        const { data, error } = await supabase
            .from('afk_status')
            .upsert({
                user_id: userId,
                message
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getAFK(userId) {
        const { data, error } = await supabase
            .from('afk_status')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async removeAFK(userId) {
        const { error } = await supabase
            .from('afk_status')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }

    // ========== Bot Settings ==========
    static async saveBotActivity(activityText, activityType, streamUrl = null, imageUrl = null) {
        const { data, error } = await supabase
            .from('bot_settings')
            .upsert({
                setting_key: 'activity',
                setting_value: JSON.stringify({
                    text: activityText,
                    type: activityType,
                    stream_url: streamUrl,
                    image_url: imageUrl,
                    updated_at: Date.now()
                })
            }, {
                onConflict: 'setting_key'
            });

        if (error) throw error;
        return data;
    }

    static async getBotActivity() {
        const { data, error } = await supabase
            .from('bot_settings')
            .select('*')
            .eq('setting_key', 'activity')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;
        
        try {
            return JSON.parse(data.setting_value);
        } catch {
            return null;
        }
    }
}

module.exports = DB;
