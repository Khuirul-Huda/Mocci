const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paste')
        .setDescription('Create a temporary code paste')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code to paste')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Programming language (for syntax highlighting)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Paste title')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const code = interaction.options.getString('code');
            const language = interaction.options.getString('language') || 'text';
            const title = interaction.options.getString('title') || 'Untitled';

            // Use dpaste.com API (free, no auth required)
            const response = await fetch('https://dpaste.com/api/v2/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'content': code,
                    'syntax': language,
                    'title': title,
                    'expiry_days': 7
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create paste');
            }

            const pasteUrl = await response.text();

            const embed = new EmbedBuilder()
                .setTitle('📋 Paste Created')
                .setDescription(`Your code has been uploaded successfully!`)
                .addFields(
                    { name: 'URL', value: pasteUrl.trim(), inline: false },
                    { name: 'Language', value: language, inline: true },
                    { name: 'Expires', value: '7 days', inline: true },
                    { name: 'Size', value: `${code.length} characters`, inline: true }
                )
                .setColor(0x00FF00)
                .setFooter({ text: 'Paste expires in 7 days' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `Error creating paste: ${error.message}` });
        }
    }
};
