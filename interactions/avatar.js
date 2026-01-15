const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to get avatar of')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user') || interaction.user;
            const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });
            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s Avatar`)
                .setImage(avatarUrl)
                .setColor('Random');
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to fetch avatar.', flags: 1 << 6 });
        }
    }
};
