const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64')
        .setDescription('Encode or decode Base64')
        .addSubcommand(subcommand =>
            subcommand
                .setName('encode')
                .setDescription('Encode text to Base64')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to encode')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('decode')
                .setDescription('Decode Base64 to text')
                .addStringOption(option =>
                    option.setName('base64')
                        .setDescription('Base64 string to decode')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'encode') {
                const text = interaction.options.getString('text');
                const encoded = Buffer.from(text).toString('base64');

                const embed = new EmbedBuilder()
                    .setTitle('🔒 Base64 Encoded')
                    .addFields(
                        { name: 'Input', value: `\`\`\`\n${text.slice(0, 1000)}\n\`\`\``, inline: false },
                        { name: 'Output', value: `\`\`\`\n${encoded.slice(0, 1000)}\n\`\`\``, inline: false }
                    )
                    .setColor(0x5865F2)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });

            } else if (subcommand === 'decode') {
                const base64 = interaction.options.getString('base64');
                const decoded = Buffer.from(base64, 'base64').toString('utf8');

                const embed = new EmbedBuilder()
                    .setTitle('🔓 Base64 Decoded')
                    .addFields(
                        { name: 'Input', value: `\`\`\`\n${base64.slice(0, 1000)}\n\`\`\``, inline: false },
                        { name: 'Output', value: `\`\`\`\n${decoded.slice(0, 1000)}\n\`\`\``, inline: false }
                    )
                    .setColor(0x5865F2)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });
            }

        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
