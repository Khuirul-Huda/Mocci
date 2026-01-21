const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hash')
        .setDescription('Generate hash from text')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to hash')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('algorithm')
                .setDescription('Hash algorithm')
                .setRequired(false)
                .addChoices(
                    { name: 'MD5', value: 'md5' },
                    { name: 'SHA1', value: 'sha1' },
                    { name: 'SHA256', value: 'sha256' },
                    { name: 'SHA512', value: 'sha512' }
                )
        ),
    async execute(interaction) {
        try {
            const text = interaction.options.getString('text');
            const algorithm = interaction.options.getString('algorithm') || 'sha256';

            const hash = crypto.createHash(algorithm).update(text).digest('hex');

            const embed = new EmbedBuilder()
                .setTitle(`🔐 ${algorithm.toUpperCase()} Hash`)
                .addFields(
                    { name: 'Input', value: `\`\`\`\n${text.slice(0, 500)}\n\`\`\``, inline: false },
                    { name: 'Hash', value: `\`\`\`\n${hash}\n\`\`\``, inline: false },
                    { name: 'Algorithm', value: algorithm.toUpperCase(), inline: true },
                    { name: 'Length', value: `${hash.length} characters`, inline: true }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: 1 << 6 });

        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
