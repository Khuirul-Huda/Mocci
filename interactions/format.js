const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Simple code formatters for common languages
function formatJavaScript(code) {
    // Basic formatting: add spaces and line breaks
    return code
        .replace(/\{/g, ' {\n  ')
        .replace(/\}/g, '\n}')
        .replace(/;/g, ';\n')
        .replace(/\n\s*\n/g, '\n');
}

function formatJSON(code) {
    try {
        return JSON.stringify(JSON.parse(code), null, 2);
    } catch (e) {
        throw new Error('Invalid JSON');
    }
}

function formatSQL(code) {
    return code
        .replace(/\bSELECT\b/gi, 'SELECT')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bJOIN\b/gi, '\nJOIN')
        .replace(/\bON\b/gi, '\n  ON')
        .replace(/\bAND\b/gi, '\n  AND')
        .replace(/\bOR\b/gi, '\n  OR')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('format')
        .setDescription('Format code (basic formatting)')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code to format')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Programming language')
                .setRequired(false)
                .addChoices(
                    { name: 'JavaScript', value: 'javascript' },
                    { name: 'JSON', value: 'json' },
                    { name: 'SQL', value: 'sql' }
                )
        ),
    async execute(interaction) {
        try {
            const code = interaction.options.getString('code');
            const language = interaction.options.getString('language') || 'javascript';

            let formatted;
            let lang = language;

            switch (language) {
                case 'json':
                    formatted = formatJSON(code);
                    lang = 'json';
                    break;
                case 'sql':
                    formatted = formatSQL(code);
                    lang = 'sql';
                    break;
                case 'javascript':
                default:
                    formatted = formatJavaScript(code);
                    lang = 'javascript';
                    break;
            }

            const embed = new EmbedBuilder()
                .setTitle('✨ Code Formatted')
                .setDescription(`\`\`\`${lang}\n${formatted.slice(0, 3000)}\n\`\`\``)
                .setColor(0x5865F2)
                .setFooter({ text: `Language: ${language} | Note: This is basic formatting` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: 1 << 6 });

        } catch (error) {
            await interaction.reply({ content: `Error formatting code: ${error.message}`, flags: 1 << 6 });
        }
    }
};
