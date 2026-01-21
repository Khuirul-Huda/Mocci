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
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
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

const DB = require('./utils/db');

// XP cooldown map
const xpCooldowns = new Map();

// Listen for messages in AI channels and auto-reply with AI
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    
    // XP System - Award XP for messages (with cooldown)
    const cooldownKey = `${message.guild.id}-${message.author.id}`;
    const lastXP = xpCooldowns.get(cooldownKey);
    const now = Date.now();
    
    if (!lastXP || now - lastXP > 60000) { // 1 minute cooldown
        xpCooldowns.set(cooldownKey, now);
        
        try {
            const xpGain = Math.floor(Math.random() * 15) + 10; // 10-25 XP per message
            const result = await DB.addXP(message.guild.id, message.author.id, xpGain);
            
            // Level up notification
            if (result.leveledUp) {
                const levelUpEmbed = new (require('discord.js').EmbedBuilder)()
                    .setTitle('🎉 Level Up!')
                    .setDescription(`Congratulations ${message.author}! You've reached **Level ${result.level}**!`)
                    .setColor(0xffd700)
                    .setTimestamp();
                
                await message.channel.send({ embeds: [levelUpEmbed] });
            }
        } catch (error) {
            // Silently ignore table not found errors (PGRST205)
            if (error.code !== 'PGRST205') {
                console.error('XP error:', error);
            }
        }
    }

    // AFK System - Check for mentions
    if (message.mentions.users.size > 0) {
        for (const [userId, user] of message.mentions.users) {
            if (user.bot) continue;
            
            try {
                const afkData = await DB.getAFK(userId);
                if (afkData) {
                    const afkTime = new Date(afkData.set_at);
                    const duration = Math.floor((now - afkTime.getTime()) / 1000 / 60);
                    await message.reply(`💤 ${user.username} is currently AFK: ${afkData.message}\n*AFK for ${duration} minutes*`);
                }
            } catch (error) {
                // Silently ignore table not found errors
                if (error.code !== 'PGRST205') {
                    console.error('AFK check error:', error);
                }
            }
        }
    }

    // Remove AFK status if user sends a message
    try {
        const afkData = await DB.getAFK(message.author.id);
        if (afkData) {
            await DB.removeAFK(message.author.id);
            await message.reply(`Welcome back! Your AFK status has been removed.`).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        }
    } catch (error) {
        // Silently ignore table not found errors
        if (error.code !== 'PGRST205') {
            console.error('AFK removal error:', error);
        }
    }
    
    // Load AI channel config from Supabase
    try {
        const aiChannelId = await DB.getAIChannel(message.guild.id);
        if (!aiChannelId || message.channel.id !== aiChannelId) return;
    } catch (error) {
        // Silently ignore table not found errors
        if (error.code !== 'PGRST205') {
            console.error('AI channel check error:', error);
        }
        return;
    }
    
    // Call AI
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return message.reply('AI API key is not configured.');
    
    let sentMsg;
    try {
        sentMsg = await message.reply('Thinking... Please wait.');
        
        // Clean old memory periodically
        await DB.cleanOldAIMemory(3600000);
        
        // Get conversation history from Supabase
        const memory = await DB.getAIMemory(message.guild.id, aiChannelId, message.author.id, 3600000);
        
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
                  ...memory.map(m => ({ role: m.role, content: m.content })),
                  { role: 'user', content: message.content }
                ],
                reasoning: { enabled: false }
            })
        });
        
        const result = await response.json();
        const aiMsg = result.choices?.[0]?.message;
        if (!aiMsg) throw new Error('No AI response.');
        
        let reply = aiMsg.content;
        
        // Save messages to Supabase
        await DB.saveAIMessage(message.guild.id, aiChannelId, message.author.id, 'user', message.content);
        await DB.saveAIMessage(message.guild.id, aiChannelId, message.author.id, 'assistant', aiMsg.content);
        
        await sentMsg.edit(reply.length > 2000 ? reply.slice(0, 1997) + '...' : reply);
    } catch (error) {
        console.error('AI error:', error);
        if (sentMsg) {
            await sentMsg.edit('AI error: ' + error.message);
        } else {
            await message.reply('AI error: ' + error.message);
        }
    }
});

// Starboard - Reaction listener
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    
    // Fetch partial messages
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    if (reaction.emoji.name === '⭐') {
        const message = reaction.message;
        if (!message.guild) return;

        const starboardChannelId = client.starboardChannels?.get(message.guild.id);
        if (!starboardChannelId) return;

        try {
            await DB.addStar(
                message.guild.id,
                message.id,
                message.channel.id,
                message.author.id,
                message.content
            );

            const starData = await DB.getStarboardMessage(message.id);
            const starboardChannel = message.guild.channels.cache.get(starboardChannelId);

            if (starboardChannel && starData.star_count >= 3) { // Require 3 stars
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                    .setDescription(message.content || '[No content]')
                    .addFields(
                        { name: 'Source', value: `[Jump to message](${message.url})`, inline: true },
                        { name: 'Channel', value: `${message.channel}`, inline: true },
                        { name: 'Stars', value: `⭐ ${starData.star_count}`, inline: true }
                    )
                    .setColor(0xffd700)
                    .setTimestamp(message.createdAt);

                if (message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    if (attachment.contentType?.startsWith('image')) {
                        embed.setImage(attachment.url);
                    }
                }

                if (starData.starboard_message_id) {
                    // Update existing starboard message
                    try {
                        const starboardMsg = await starboardChannel.messages.fetch(starData.starboard_message_id);
                        await starboardMsg.edit({ embeds: [embed] });
                    } catch {}
                } else {
                    // Create new starboard message
                    const starboardMsg = await starboardChannel.send({ embeds: [embed] });
                    await DB.updateStarboardMessageId(message.id, starboardMsg.id);
                }
            }
        } catch (error) {
            // Silently ignore table not found errors
            if (error.code !== 'PGRST205') {
                console.error('Starboard error:', error);
            }
        }
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }

    if (reaction.emoji.name === '⭐') {
        const message = reaction.message;
        if (!message.guild) return;

        try {
            await DB.removeStar(message.id);
        } catch (error) {
            // Silently ignore table not found errors
            if (error.code !== 'PGRST205') {
                console.error('Starboard remove error:', error);
            }
        }
    }
});

// Welcome System - Member join listener
client.on(Events.GuildMemberAdd, async (member) => {
    const welcomeModule = require('./interactions/welcome');
    await welcomeModule.sendWelcomeMessage(client, member.guild, member);
});

const TOKEN = process.env.BOT_TOKEN;
const TEST_GUILD_ID = process.env.TEST_GUILD_ID || '';
const { initializeSchema } = require('./utils/schema-init');
const { restoreActivity } = require('./interactions/setactivity');
// ...existing code...

client.once(Events.ClientReady, async () => {
    log(`Bot ready as ${client.user.tag}`, MocciLogging.INFO);
    
    // Auto-initialize database schema if needed
    try {
        await initializeSchema();
    } catch (error) {
        log(`Schema initialization check failed: ${error.message}`, MocciLogging.WARN);
    }
    
    // Restore bot activity from database
    try {
        await restoreActivity(client);
    } catch (error) {
        // Silently ignore - activity restoration is optional
    }
    
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
        
        // Only send error message if interaction hasn't been handled
        try {
            const errorMsg = { content: 'There was an error while executing this command!', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg);
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg);
            }
            // If already replied, don't send anything (command handled its own error)
        } catch (replyError) {
            // Silently fail if we can't send the error message
            console.error('Failed to send error message:', replyError.message);
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
