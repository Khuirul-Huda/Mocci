const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActivityType } = require('discord.js');
const DB = require('../utils/db');

const activityTypes = {
    playing: ActivityType.Playing,
    streaming: ActivityType.Streaming,
    listening: ActivityType.Listening,
    watching: ActivityType.Watching,
    competing: ActivityType.Competing,
    custom: ActivityType.Custom
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setactivity')
        .setDescription('Set the bot\'s activity (owner only)')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Activity text')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Activity type')
                .setRequired(true)
                .addChoices(
                    { name: '🎮 Playing', value: 'playing' },
                    { name: '📺 Streaming', value: 'streaming' },
                    { name: '🎵 Listening', value: 'listening' },
                    { name: '👀 Watching', value: 'watching' },
                    { name: '🏆 Competing', value: 'competing' },
                    { name: '✨ Custom', value: 'custom' }
                )
        )
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Streaming URL (only for streaming type)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Large image URL for rich presence')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const ownerId = process.env.OWNER_USER_ID;
            if (interaction.user.id !== ownerId) {
                await interaction.editReply({ content: '❌ Only the bot owner can use this command.' });
                return;
            }

            const text = interaction.options.getString('text');
            const typeStr = interaction.options.getString('type');
            const streamUrl = interaction.options.getString('url');
            const imageUrl = interaction.options.getString('image');

            const type = activityTypes[typeStr];
            if (type === undefined) {
                await interaction.editReply({ content: '❌ Invalid activity type.' });
                return;
            }

            // Validate streaming URL if streaming type is selected
            if (typeStr === 'streaming' && !streamUrl) {
                await interaction.editReply({ 
                    content: '❌ Streaming type requires a URL. Please provide a Twitch or YouTube URL.' 
                });
                return;
            }

            // Set the activity
            const activityOptions = { type };
            
            if (typeStr === 'streaming' && streamUrl) {
                activityOptions.url = streamUrl;
            }

            await interaction.client.user.setActivity(text, activityOptions);

            // Save to database for persistence
            await DB.saveBotActivity(text, typeStr, streamUrl, imageUrl);

            // Build response
            let response = `✅ Activity set to: **${typeStr.toUpperCase()}** ${text}`;
            if (streamUrl) response += `\n🔗 URL: ${streamUrl}`;
            if (imageUrl) response += `\n🖼️ Image: ${imageUrl} (saved for future use)`;
            response += `\n\n💾 Activity saved and will persist across restarts!`;

            await interaction.editReply({ content: response });

        } catch (error) {
            console.error('Set activity error:', error);
            const errorMsg = { content: `❌ Failed to set activity: ${error.message}` };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply({ ...errorMsg, flags: 1 << 6 }).catch(() => {});
            }
        }
    }
};

// Helper function to restore activity on bot startup
async function restoreActivity(client) {
    try {
        const savedActivity = await DB.getBotActivity();
        if (!savedActivity) return;

        const { text, type, stream_url } = savedActivity;
        const activityType = activityTypes[type];
        
        if (activityType === undefined) return;

        const options = { type: activityType };
        if (type === 'streaming' && stream_url) {
            options.url = stream_url;
        }

        await client.user.setActivity(text, options);
        console.log(`✅ Restored activity: ${type.toUpperCase()} ${text}`);
    } catch (error) {
        // Silently ignore - activity restoration is optional
        if (error.code !== 'PGRST205') {
            console.error('Failed to restore activity:', error.message);
        }
    }
}

module.exports.restoreActivity = restoreActivity;
