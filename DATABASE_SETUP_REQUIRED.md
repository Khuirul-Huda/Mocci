# 🚨 IMPORTANT: DATABASE SETUP REQUIRED

## ⚠️ READ THIS FIRST!

**Your Mocci Discord Bot will NOT work until you create the database tables!**

The bot includes auto-detection of missing tables, but **CANNOT create them automatically** due to Supabase security restrictions.

## 📋 What You Need to Do

### Step 1: Check if Tables Exist
```bash
npm start
```

If you see this message, tables are missing:
```
❌ CRITICAL: DATABASE TABLES MISSING!
⚠️  Missing tables: snippets, user_levels, warnings, ...
🛑 THE BOT CANNOT FUNCTION WITHOUT THESE TABLES!
```

### Step 2: Create Tables Manually

1. **Open Supabase Dashboard**
   - Go to your project at https://app.supabase.com

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Copy the Schema**
   - Open `supabase-schema.sql` in your code editor
   - Select ALL (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

4. **Paste and Run**
   - Paste into Supabase SQL Editor (Ctrl+V / Cmd+V)
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success. No rows returned"

5. **Verify Tables Created**
   - Go to "Database" → "Tables" in Supabase
   - You should see 16+ tables

6. **Restart the Bot**
   ```bash
   npm start
   ```
   - Should now see: `✅ All required tables exist`

## 🎯 Expected Tables

After running the schema, you should have:

**Core Features:**
- `snippets` - Code snippet storage
- `ai_channels` - AI conversation channels  
- `ai_memory` - AI conversation history
- `user_preferences` - User settings
- `leetcode_cache` - Cached problems

**New Features:**
- `user_levels` - XP and leveling system
- `warnings` - User warnings
- `server_logs` - Moderation logs
- `starboard` - Starred messages
- `giveaways` - Active giveaways
- `welcome_config` - Welcome messages
- `afk_status` - AFK statuses
- `reminders` - User reminders
- `custom_commands` - Server custom commands
- `suggestions` - User suggestions
- `auto_roles` - Auto role assignment
- `reaction_roles` - Reaction role system

## ❌ Common Mistakes

### "The bot started, so tables exist, right?"
**NO!** The bot will start even without tables, but features won't work.

### "I ran `npm run init-schema`, am I done?"
**NO!** That script only *checks* for tables. You must run the SQL manually.

### "Can't the bot just create the tables?"
**NO!** Supabase security prevents table creation via the public API key.

### "I copied part of the schema, is that enough?"
**NO!** You must copy **ALL** 270 lines from `supabase-schema.sql`.

## ✅ How to Verify Success

1. **Check Supabase Dashboard**
   - Database → Tables should show 16+ tables

2. **Check Bot Startup**
   ```
   🔍 Checking database schema...
   ✅ All required tables exist
   ```

3. **Test a Command**
   ```
   /rank
   ```
   - Should show your rank card (not an error)

## 🆘 Still Having Issues?

### Error: "PGRST205 - Table not found"
- Tables not created yet
- Run the schema in SQL Editor

### Error: "Cannot connect to database"
- Check `.env` file has correct SUPABASE_URL and SUPABASE_KEY
- Verify Supabase project is active

### Tables exist but bot says they're missing
- Wait 30 seconds for Supabase cache to refresh
- Restart the bot

### Bot crashes on startup
- Check Canvas dependencies are installed
- See `docs/CANVAS_TROUBLESHOOTING.md`

## 📚 Additional Help

- **Full setup guide:** `README.md`
- **Quick start:** `QUICKSTART.md`
- **Database auto-init docs:** `docs/DATABASE_AUTO_INIT.md`
- **Canvas issues:** `docs/CANVAS_TROUBLESHOOTING.md`

---

**Remember:** The 5 minutes to set up the database is a ONE-TIME task.  
After that, your bot will work perfectly! 🚀
