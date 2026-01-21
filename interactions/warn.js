const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            const guildId = interaction.guild.id;

            if (targetUser.bot) {
                await interaction.reply({ content: 'You cannot warn bots!', flags: 1 << 6 });
                return;
            }

            if (targetUser.id === interaction.user.id) {
                await interaction.reply({ content: 'You cannot warn yourself!', flags: 1 << 6 });
                return;
            }

            await DB.addWarning(guildId, targetUser.id, interaction.user.id, reason);
            const warnings = await DB.getWarnings(guildId, targetUser.id);

            const embed = new EmbedBuilder()
                .setTitle('⚠️ User Warned')
                .setDescription(`${targetUser} has been warned.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Total Warnings', value: `${warnings.length}`, inline: true }
                )
                .setColor(0xff9900)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Try to DM the user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('⚠️ You have been warned')
                    .setDescription(`You have been warned in **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: interaction.user.tag, inline: true },
                        { name: 'Total Warnings', value: `${warnings.length}`, inline: true }
                    )
                    .setColor(0xff9900)
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (err) {
                // User has DMs disabled
            }

        } catch (error) {
            console.error('Warn error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
