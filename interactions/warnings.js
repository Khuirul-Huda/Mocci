const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check warnings for')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('show_inactive')
                .setDescription('Show inactive/cleared warnings')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const showInactive = interaction.options.getBoolean('show_inactive') || false;
            const guildId = interaction.guild.id;

            const warnings = await DB.getWarnings(guildId, targetUser.id, !showInactive);

            if (warnings.length === 0) {
                await interaction.reply({ content: `${targetUser.tag} has no ${showInactive ? '' : 'active '}warnings!`, flags: 1 << 6 });
                return;
            }

            const warningList = await Promise.all(
                warnings.slice(0, 10).map(async (warn, idx) => {
                    let modName = 'Unknown';
                    try {
                        const mod = await interaction.client.users.fetch(warn.moderator_id);
                        modName = mod.tag;
                    } catch {}

                    const date = new Date(warn.created_at).toLocaleDateString();
                    const status = warn.active ? '🔴 Active' : '⚪ Cleared';
                    return `**${idx + 1}.** ${status}\n**Reason:** ${warn.reason}\n**Moderator:** ${modName}\n**Date:** ${date}`;
                })
            );

            const embed = new EmbedBuilder()
                .setTitle(`⚠️ Warnings for ${targetUser.tag}`)
                .setDescription(warningList.join('\n\n'))
                .setColor(0xff9900)
                .setFooter({ text: `Total warnings: ${warnings.length}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Warnings error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
