const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
const { randomUUID } = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('json')
        .setDescription('JSON utilities')
        .addSubcommand(subcommand =>
            subcommand
                .setName('format')
                .setDescription('Format/prettify JSON')
                .addStringOption(option =>
                    option.setName('json')
                        .setDescription('JSON string to format')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('minify')
                .setDescription('Minify JSON')
                .addStringOption(option =>
                    option.setName('json')
                        .setDescription('JSON string to minify')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('validate')
                .setDescription('Validate JSON')
                .addStringOption(option =>
                    option.setName('json')
                        .setDescription('JSON string to validate')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const jsonStr = interaction.options.getString('json');

        try {
            const parsed = JSON.parse(jsonStr);

            if (subcommand === 'format') {
                const formatted = JSON.stringify(parsed, null, 2);
                const embed = new EmbedBuilder()
                    .setTitle('✅ Formatted JSON')
                    .setDescription(`\`\`\`json\n${formatted.slice(0, 3000)}\n\`\`\``)
                    .setColor(0x00FF00)
                    .setFooter({ text: `Size: ${formatted.length} characters` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });

            } else if (subcommand === 'minify') {
                const minified = JSON.stringify(parsed);
                const embed = new EmbedBuilder()
                    .setTitle('✅ Minified JSON')
                    .setDescription(`\`\`\`json\n${minified.slice(0, 3000)}\n\`\`\``)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: 'Original Size', value: `${jsonStr.length} chars`, inline: true },
                        { name: 'Minified Size', value: `${minified.length} chars`, inline: true },
                        { name: 'Reduction', value: `${((1 - minified.length / jsonStr.length) * 100).toFixed(1)}%`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });

            } else if (subcommand === 'validate') {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Valid JSON')
                    .setDescription('JSON is valid!')
                    .setColor(0x00FF00)
                    .addFields({ name: 'Type', value: Array.isArray(parsed) ? 'Array' : typeof parsed, inline: true })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });
            }

        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Invalid JSON')
                .setDescription(`\`\`\`\n${error.message}\n\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: 1 << 6 });
        }
    }
};
