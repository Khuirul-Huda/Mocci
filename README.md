
# Mocci Discord Bot

Multipurpose Discord bot for fun and utility, built with Discord.js v14+.

## Features
- Slash commands: /about, /help, /random, /enchant, /screenshot
- Modern codebase, modular structure, and best practices

## Requirements
- Node.js 18+
- npm or bun

## Setup
1. Clone this repository
2. Install dependencies:
	 ```bash
	 npm install
	 # or
	 bun install
	 ```
3. Copy `.env` template:
	 ```bash
	 cp sample.env .env
	 ```
4. Edit `.env` and fill in your Discord bot token and (optionally) test guild ID.

## Usage
- **Production:**
	```bash
	npm start
	```
- **Development (hot reload):**
	```bash
	npm run dev
	```
- **Lint:**
	```bash
	npm run lint
	```
- **Format:**
	```bash
	npm run format
	```

## Environment Variables
- `BOT_TOKEN` (required): Your Discord bot token
- `TEST_GUILD_ID` (optional): Guild ID for development commands
- `DEBUG` (optional): Set to `1` or `true` for debug logs

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR.

## Credits
- animenbo.com

---
Licensed under ISC.
