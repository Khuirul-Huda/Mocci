const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Show information about this server'),
    async execute(interaction) {
        try {
            const { guild } = interaction;
            if (!guild) {
                await interaction.reply({ content: 'This command can only be used in a server.', flags: 1 << 6 });
                return;
            }
            const owner = await guild.fetchOwner();
            const embed = new EmbedBuilder()
                .setTitle(`Server Info: ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Owner', value: owner.user.tag, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: 'Members', value: `${guild.memberCount}`, inline: true },
                    { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                    { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true }
                )
                .setColor('Random')
                .setFooter({ text: `Server ID: ${guild.id}` })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to fetch server info.', flags: 1 << 6 });
        }
    }
};
