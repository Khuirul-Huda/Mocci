# ⚡ Quick Start Guide

Get Mocci up and running in **5 minutes**!

## Step 1: Install Dependencies (30 seconds)

```bash
bun install
# or
npm install
```

## Step 2: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign Up (free)
2. Click **"New Project"**
3. Name it: `mocci-bot`
4. Choose a region close to you
5. Set a database password (save it!)
6. Click **"Create new project"**
7. Wait ~1 minute for setup

## Step 3: Get API Credentials (30 seconds)

1. In Supabase Dashboard, click **Settings** (gear icon)
2. Click **API**
3. Copy:
   - **Project URL** 
   - **anon public key**

## Step 4: Create Database Tables (1 minute)

> **🚨 CRITICAL STEP - DO NOT SKIP!**  
> The bot will NOT work without database tables!

**You MUST run the SQL schema manually:**

1. Click **SQL Editor** in Supabase sidebar (left side)
2. Click **"New query"** button (green button, top right)
3. Open `supabase-schema.sql` from this project in your code editor
4. **Select ALL** (Ctrl+A) and **Copy** (Ctrl+C)
5. **Paste** into the SQL Editor in Supabase (Ctrl+V)
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" ✅
8. Go to **Database → Tables** to verify tables were created

**Expected result:** You should see 16+ tables including:
- `snippets`, `user_levels`, `warnings`, `starboard`, `giveaways`, etc.

> 💡 **Why manual?** Supabase security prevents auto-creation via API.  
> The bot will detect missing tables and remind you, but cannot create them.

## Step 5: Configure Environment (30 seconds)

```bash
# Copy the template
cp sample.env .env

# Edit .env and add:
```

**Required:**
```env
BOT_TOKEN=your_discord_bot_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJxxxxxxxxxxxxx
```

**Optional:**
```env
OPENROUTER_API_KEY=sk-or-xxxxx  # For AI features
OPENWEATHER_API_KEY=xxxxx       # For weather
OWNER_USER_ID=your_discord_id   # For owner commands
```

## Step 6: Run the Bot! (10 seconds)

```bash
bun run dev
# or
npm start
```

You should see:
```
✓ Successfully logged in as YourBot#1234
✓ Successfully registered application commands
```

## Step 7: Test It! (30 seconds)

In Discord, try these commands:

### Basic Test
```
/help
```
Should show the command list!

### Snippet Test
```
/snippet save name:test language:javascript code:console.log("hello")
/snippet list
```
Should save and show your snippet!

### AI Test (if you have OPENROUTER_API_KEY)
```
/setaichannel channel:#your-channel
```
Then send a message in that channel - bot should respond!

---

## ✅ Success!

If all commands work, you're done! 🎉

---

## 🚨 Troubleshooting

### Bot doesn't start
- Check your `BOT_TOKEN` in `.env`
- Make sure bot has proper permissions

### "SUPABASE_URL must be set"
- Check `.env` file exists
- Make sure variables are set
- Restart the bot

### Commands return errors
- Did you run `supabase-schema.sql`?
- Check Supabase Dashboard → Logs → API
- Verify API key is correct

### /snippet doesn't work
- Go to Supabase → Table Editor
- Verify `snippets` table exists
- Check for error messages

---

## 📚 Next Steps

### Explore Features
- `/run` - Execute code in 11+ languages
- `/docs` - Search documentation
- `/github` - Search GitHub
- `/regex` - Test regex patterns
- `/paste` - Share code snippets
- See `/help` for all 30+ commands!

### Add More Features
Check `PROPOSED_FEATURES.md` for 12 awesome features you can add:
- Leveling & XP System
- Reminders
- Custom Commands
- Giveaways
- And more!

All database tables are already created and ready to use!

---

## 📖 Documentation

- **`README.md`** - Full documentation
- **`MIGRATION.md`** - Detailed setup guide
- **`PROPOSED_FEATURES.md`** - Feature ideas
- **`SUPABASE_MIGRATION_SUMMARY.md`** - What changed

---

**Happy botting!** 🤖✨
