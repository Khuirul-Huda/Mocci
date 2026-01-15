const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActivityType } = require('discord.js');

const activityTypes = {
    playing: ActivityType.Playing,
    streaming: ActivityType.Streaming,
    listening: ActivityType.Listening,
    watching: ActivityType.Watching,
    competing: ActivityType.Competing
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
                .setDescription('Activity type (playing, streaming, listening, watching, competing)')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'playing' },
                    { name: 'Streaming', value: 'streaming' },
                    { name: 'Listening', value: 'listening' },
                    { name: 'Watching', value: 'watching' },
                    { name: 'Competing', value: 'competing' }
                )
        ),
    async execute(interaction) {
        try {
            const ownerId = process.env.OWNER_USER_ID;
            if (interaction.user.id !== ownerId) {
                await interaction.reply({ content: 'Only the bot owner can use this command.', flags: 1 << 6 });
                return;
            }
            const text = interaction.options.getString('text');
            const typeStr = interaction.options.getString('type');
            const type = activityTypes[typeStr];
            if (!type) {
                await interaction.reply({ content: 'Invalid activity type.', flags: 1 << 6 });
                return;
            }
            await interaction.client.user.setActivity(text, { type });
            await interaction.reply({ content: `Activity set to: ${typeStr.toUpperCase()} ${text}` });
        } catch (error) {
            await interaction.reply({ content: `Failed to set activity. Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
