const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server XP leaderboard')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number')
                .setRequired(false)
                .setMinValue(1)
        ),
    async execute(interaction) {
        try {
            const page = interaction.options.getInteger('page') || 1;
            const perPage = 10;
            const guildId = interaction.guild.id;

            const allUsers = await DB.getLeaderboard(guildId, 100);
            const totalPages = Math.ceil(allUsers.length / perPage);
            const startIdx = (page - 1) * perPage;
            const endIdx = startIdx + perPage;
            const pageUsers = allUsers.slice(startIdx, endIdx);

            if (pageUsers.length === 0) {
                await interaction.reply({ content: 'No users on this page!', flags: 1 << 6 });
                return;
            }

            const leaderboardText = await Promise.all(
                pageUsers.map(async (user, idx) => {
                    const position = startIdx + idx + 1;
                    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `**${position}.**`;
                    
                    try {
                        const member = await interaction.guild.members.fetch(user.user_id);
                        return `${medal} ${member.user.username} - Level ${user.level} (${user.xp} XP)`;
                    } catch {
                        return `${medal} Unknown User - Level ${user.level} (${user.xp} XP)`;
                    }
                })
            );

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${interaction.guild.name} Leaderboard`)
                .setDescription(leaderboardText.join('\n'))
                .setColor(0xffd700)
                .setFooter({ text: `Page ${page}/${totalPages} • Total Members: ${allUsers.length}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Leaderboard error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
