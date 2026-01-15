const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Show all public info about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check (leave blank for yourself)')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user') || interaction.user;
            const createdAt = user.createdAt;
            const now = new Date();
            const ageMs = now - createdAt;
            const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
            const isBot = user.bot ? 'Yes' : 'No';
            let memberInfo = '';
            if (interaction.guild) {
                const member = await interaction.guild.members.fetch(user.id).catch(() => null);
                if (member) {
                    memberInfo = `\n**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n**Nickname:** ${member.nickname || 'None'}\n**Roles:** ${member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'None'}`;
                }
            }
            const embed = new EmbedBuilder()
                .setTitle(`${user.username}#${user.discriminator} (${user.id})`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor('Random')
                .addFields(
                    { name: 'Username', value: user.username, inline: true },
                    { name: 'Tag', value: `#${user.discriminator}`, inline: true },
                    { name: 'User ID', value: user.id, inline: false },
                    { name: 'Bot?', value: isBot, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(createdAt.getTime() / 1000)}:F>\n**${ageDays} days ago**`, inline: false },
                );
            if (memberInfo) embed.addFields({ name: 'Server Info', value: memberInfo });
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `Failed to fetch user info. Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
