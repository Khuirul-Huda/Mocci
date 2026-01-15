const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { MocciLogging } = require('./utils/moccilogger');
const dotenv = require('dotenv');
const anim = require('chalk-animation');
const fetch = require('node-fetch');
dotenv.config();


// ...existing code...
const commands = [];
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// Utility logging
const debug = (msg) => MocciLogging.log(msg, MocciLogging.DEBUG);
const log = (msg, int = MocciLogging.INFO) => MocciLogging.log(msg, int);

// Load commands modularly
const commandsPath = path.join(__dirname, 'interactions');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
        debug(`Registered command: ${command.data.name}`);
    } else {
        log(`Warning: Command at ${file} is missing required "data" or "execute" property.`, MocciLogging.WARN);
    }
}

// AI channel and memory paths
const aichannelsPath = path.join(__dirname, 'utils/aichannels.json');
const aimemoryPath = path.join(__dirname, 'utils/aimemory.json');

// Listen for messages in AI channels and auto-reply with AI
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    // Load AI channel config
    let aichannels = {};
    if (fs.existsSync(aichannelsPath)) {
        aichannels = JSON.parse(fs.readFileSync(aichannelsPath, 'utf8'));
    }
    const aiChannelId = aichannels[message.guild.id];
    if (!aiChannelId || message.channel.id !== aiChannelId) return;
    // Load memory
    let aimemory = {};
    if (fs.existsSync(aimemoryPath)) {
        aimemory = JSON.parse(fs.readFileSync(aimemoryPath, 'utf8'));
    }
        const memKey = `${message.guild.id}:${aiChannelId}`;
        if (!aimemory[memKey]) aimemory[memKey] = [];
        const now = Date.now();
        // Purge expired memory for all users and channels
        for (const key in aimemory) {
            aimemory[key] = aimemory[key].filter(m => (now - m.timestamp) <= 3600000);
        }
        // Add user message with timestamp and user id
        aimemory[memKey].push({ role: 'user', content: message.content, user: message.author.id, timestamp: now });
        // Only keep messages from the last hour and from this user
        aimemory[memKey] = aimemory[memKey].filter(m => m.user === message.author.id && (now - m.timestamp) <= 3600000);
    // Call AI
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return message.reply('AI API key is not configured.');
    let sentMsg;
    try {
        sentMsg = await message.reply('Thinking... Please wait.');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'xiaomi/mimo-v2-flash:free',
                messages: [
                  { role: 'system', content: 'You are MocciAI, a helpful, friendly, and informative Discord bot assistant. Always respond concisely and keep your answer under 2000 characters.' },
                  ...aimemory[memKey].map(m => ({ role: m.role, content: m.content }))
                ],
                reasoning: { enabled: false }
            })
        });
        const result = await response.json();
        const aiMsg = result.choices?.[0]?.message;
        if (!aiMsg) throw new Error('No AI response.');
        let reply = aiMsg.content;
        // Add AI message to memory with timestamp and user id
        aimemory[memKey].push({ role: 'assistant', content: aiMsg.content, user: message.author.id, timestamp: now });
        // Only keep messages from the last hour and from this user
        aimemory[memKey] = aimemory[memKey].filter(m => m.user === message.author.id && (now - m.timestamp) <= 3600000);
        fs.writeFileSync(aimemoryPath, JSON.stringify(aimemory, null, 2));
        await sentMsg.edit(reply.length > 2000 ? reply.slice(0, 1997) + '...' : reply);
    } catch (error) {
        if (sentMsg) {
            await sentMsg.edit('AI error: ' + error.message);
        } else {
            await message.reply('AI error: ' + error.message);
        }
    }
});



const TOKEN = process.env.BOT_TOKEN;
const TEST_GUILD_ID = process.env.TEST_GUILD_ID || '';
// ...existing code...

client.once(Events.ClientReady, async () => {
    log(`Bot ready as ${client.user.tag}`, MocciLogging.INFO);
    const CLIENT_ID = client.user.id;
    const rest = new REST({ version: '9' }).setToken(TOKEN);
    try {
        if (!TEST_GUILD_ID) {
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
            debug('Successfully registered application commands globally');
        } else {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), { body: commands });
            debug('Successfully registered application commands for development guild');
        }
    } catch (error) {
        log(`Failed to register commands: ${error}`, MocciLogging.CRITICAL);
    }
    log('Listening to interactions.....', MocciLogging.INFO);
    log('Bot activity can now be set dynamically by the owner using /setactivity.', MocciLogging.INFO);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    const user = interaction.user.tag;
    const channel = interaction.channel ? (interaction.channel.name || interaction.channel.id) : 'DM';
    const guild = interaction.guild ? interaction.guild.name : 'DM';
    log(`[CMD] /${interaction.commandName} by ${user} in [${guild}] #${channel}`);
    debug(`New Interaction: ${interaction.commandName}`);
    try {
        await command.execute(interaction);
    } catch (error) {
        log(`Error executing command ${interaction.commandName}: ${error}`, MocciLogging.CRITICAL);
        // Always send error as ephemeral (only sender can see)
        const errorMsg = { content: 'There was an error while executing this command!', flags: 1 << 6 };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
});

if (anim && anim.default && typeof anim.default.rainbow === 'function') {
    anim.default.rainbow('Logging in............');
} else if (typeof anim.rainbow === 'function') {
    anim.rainbow('Logging in............');
} else {
    console.log('Logging in............');
}

client.login(TOKEN);
