const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Clear all active warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to clear warnings for')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const guildId = interaction.guild.id;

            const warnings = await DB.getWarnings(guildId, targetUser.id);

            if (warnings.length === 0) {
                await interaction.reply({ content: `${targetUser.tag} has no active warnings!`, flags: 1 << 6 });
                return;
            }

            await DB.clearWarnings(guildId, targetUser.id);
            await DB.logModAction(guildId, 'clear_warnings', interaction.user.id, targetUser.id, 'Warnings cleared');

            const embed = new EmbedBuilder()
                .setTitle('✅ Warnings Cleared')
                .setDescription(`All warnings for ${targetUser} have been cleared.`)
                .addFields(
                    { name: 'Cleared Warnings', value: `${warnings.length}`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Clear warnings error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
