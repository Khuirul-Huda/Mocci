const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modlogs')
        .setDescription('View moderation logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Filter by user')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of logs to show (max 25)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25)
        ),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const limit = interaction.options.getInteger('limit') || 10;
            const guildId = interaction.guild.id;

            const logs = await DB.getModLogs(guildId, targetUser?.id, limit);

            if (logs.length === 0) {
                await interaction.reply({ content: 'No moderation logs found!', flags: 1 << 6 });
                return;
            }

            const logList = await Promise.all(
                logs.map(async (log) => {
                    let modName = 'Unknown';
                    let targetName = 'Unknown';

                    try {
                        const mod = await interaction.client.users.fetch(log.moderator_id);
                        modName = mod.tag;
                    } catch {}

                    try {
                        const target = await interaction.client.users.fetch(log.target_id);
                        targetName = target.tag;
                    } catch {}

                    const date = new Date(log.created_at).toLocaleString();
                    const actionEmoji = {
                        'warn': '⚠️',
                        'kick': '👢',
                        'ban': '🔨',
                        'unban': '🔓',
                        'mute': '🔇',
                        'unmute': '🔊',
                        'clear_warnings': '✅'
                    };

                    return `${actionEmoji[log.log_type] || '📝'} **${log.log_type.toUpperCase()}** | ${targetName}\n**Moderator:** ${modName}\n**Reason:** ${log.reason || 'No reason provided'}\n**Date:** ${date}`;
                })
            );

            const embed = new EmbedBuilder()
                .setTitle('📋 Moderation Logs')
                .setDescription(logList.join('\n\n'))
                .setColor(0x5865f2)
                .setFooter({ text: `Showing ${logs.length} log(s)` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Modlogs error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
