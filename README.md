
# Mocci Discord Bot

**Your Ultimate Programming Companion** 🚀

Multipurpose Discord bot for developers, built with Discord.js v14+ and Supabase. Mocci combines powerful coding tools, AI assistance, community features, and moderation to create the ultimate server experience.

## ✨ Features

### 💻 Code Execution & Analysis
- **/run** - Execute code in 11+ languages (Python, JavaScript, Java, C++, Go, Rust, etc.)
- **/explain** - AI-powered code explanation
- **/format** - Format/prettify code (JavaScript, JSON, SQL)
- **/regex** - Test regex patterns with live matching
- **/leetcode** - Random LeetCode problems for practice
- **/cron** - Cron expression helper and explainer

### 📚 Documentation & Search
- **/docs** - Quick documentation lookup (MDN, Python, Discord.js, Node.js)
- **/npm** - Search NPM packages with full details
- **/pypi** - Search Python packages on PyPI
- **/github** - Search GitHub repositories and users
- **/stackoverflow** - Find Stack Overflow solutions

### 🛠️ Developer Tools
- **/json** - Format, minify, and validate JSON
- **/base64** - Encode/decode Base64
- **/hash** - Generate MD5, SHA1, SHA256, SHA512 hashes
- **/uuid** - Generate UUIDs (v4)
- **/paste** - Create temporary code pastes (7-day expiry)
- **/snippet** - Save and manage personal code snippets (Supabase-backed)
- **/commit** - AI-generated git commit messages

### 🎖️ Leveling & XP System
- **/rank** - View your rank card with beautiful graphics
- **/leaderboard** - Server XP leaderboard
- **Automatic XP** - Earn XP for chatting (with anti-spam cooldown)
- **Level Up Notifications** - Celebrate achievements

### ⚖️ Moderation System
- **/warn** - Warn users with reason tracking
- **/warnings** - View user warning history
- **/clearwarnings** - Clear all warnings for a user
- **/modlogs** - Complete moderation action logs

### 🎉 Community Features
- **/starboard** - Highlight best messages (⭐ reaction-based)
- **/giveaway** - Host giveaways with automatic winner selection
- **/welcome** - Beautiful welcome messages with dynamic images
- **/afk** - Set AFK status with auto-response

### 🤖 AI Features
- **/ai** - Chat with MocciAI assistant
- **AI Channel** - Set a channel for continuous AI conversations with 1-hour memory per user (Supabase-backed)

### 📊 Server Information
- **/serverstats** - Detailed server statistics
- **/serverinfo** - Server information
- **/userinfo** - User information
- **/about** - Bot information and system stats
- **/dbstatus** - Check database connection status

### 🎮 Fun & Entertainment (All FREE - No API Keys!)
- **/joke** - Random jokes (7 categories including Programming)
- **/cat** - Random cat pictures or facts
- **/dog** - Random dog pictures or facts
- **/meme** - Random memes from Reddit
- **/anime** - Random anime quotes or pictures
- **/advice** - Random life advice
- **/trivia** - Trivia questions with multiple categories
- **/8ball** - Ask the magic 8-ball
- **/quote** - Random inspirational quotes
- **/weather** - Weather information
- **/poll** - Create interactive polls
- **/random** - Random number generator
- **/enchant** - Minecraft enchanting table text

### 🖼️ Media Commands
- **/avatar** - Get user avatars
- **/screenshot** - Take website screenshots

### ⚙️ Admin/Owner Commands
- **/setactivity** - Change bot activity with persistence (supports streaming, images, and more!)
- **/setaichannel** - Set AI conversation channel (server owner)
- **/reload** - Hot-reload commands without restart (owner only)

## Requirements
- Node.js 18+ or Bun 1.0+
- npm or bun
- Supabase account (free tier works great!)
- **System dependencies for Canvas** (required for rank cards and welcome images):
  - Ubuntu/Debian: `build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
  - macOS: `pkg-config cairo pango libpng jpeg giflib librsvg pixman` (via Homebrew)
  - Windows: GTK for Windows

## Setup

### 1. Clone and Install
```bash
# Clone this repository
git clone <repo-url>
cd Mocci

# Install system dependencies for Canvas (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Or use the automated script
./scripts/setup-canvas.sh

# Install Node.js dependencies
npm install
# or
bun install

# Rebuild Canvas (if needed)
npm rebuild canvas
```

> 💡 **Troubleshooting Canvas?** See [docs/CANVAS_TROUBLESHOOTING.md](docs/CANVAS_TROUBLESHOOTING.md)

### 2. Set Up Supabase Database

> **🚨 CRITICAL: You MUST run the database schema manually!**  
> The bot will detect missing tables but **CANNOT create them automatically**.

**Option A: Automatic Check + Manual Setup (Recommended)**
```bash
# Start the bot - it will check for missing tables
npm start

# If tables are missing, you'll see clear instructions
# Then follow the manual setup steps below
```

**Option B: Manual Setup (Required for first-time setup)**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** in your Supabase dashboard (left sidebar)
4. Click **"New query"**
5. Open `supabase-schema.sql` from this project
6. **Copy ALL contents** (all 270 lines) → Paste in SQL Editor
7. Click **"Run"** (Ctrl+Enter)
8. Wait for "Success. No rows returned"
9. Go to **Project Settings → API** and copy:
   - Project URL
   - anon/public key

> 💡 **The bot will NOT work until you run the schema!** Features like XP, warnings, starboard, etc. require database tables.

### 3. Configure Environment Variables
```bash
# Copy the sample environment file
cp sample.env .env

# Edit .env and fill in:
```

Required variables:
- `BOT_TOKEN` - Your Discord bot token
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key

Optional variables:
- `OPENROUTER_API_KEY` - For AI features (/ai, /explain, /commit)
- `OPENWEATHER_API_KEY` - For weather command
- `TEST_GUILD_ID` - Guild ID for development commands
- `OWNER_USER_ID` - Your Discord user ID for owner-only commands
- `DEBUG` - Set to `1` or `true` for debug logs

### 4. Run the Bot
```bash
# Production
npm start

# Development (with Bun)
bun run dev
```

## Database
Mocci uses **Supabase (PostgreSQL)** for storing:
- Personal code snippets
- AI conversation memory (per user, 1-hour retention)
- AI channel configurations
- User preferences & levels
- Warnings & moderation logs
- Starboard messages
- Giveaways & welcome configurations
- AFK status
- LeetCode problem cache

**🔄 Auto Schema Initialization:**
The bot automatically checks for required database tables on startup. If any tables are missing, it will guide you through the setup process or you can run:
```bash
npm run init-schema
```

See `supabase-schema.sql` for the complete database schema.

## 🚀 Proposed Features
Check out `PROPOSED_FEATURES.md` for **12+ additional features** you can implement:
- 🎖️ Leveling & XP System
- ⏰ Reminders
- 🎨 Custom Commands
- ⚖️ Moderation & Warnings
- ⭐ Starboard
- 🎁 Giveaways
- 💡 Suggestions System
- 🎭 Reaction Roles
- And more!

All features are designed to work with Supabase and require no external paid APIs!

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR.

## Credits
- animenbo.com

---
Licensed under ISC.
