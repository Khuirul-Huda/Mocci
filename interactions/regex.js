const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('regex')
        .setDescription('Test regex patterns')
        .addStringOption(option =>
            option.setName('pattern')
                .setDescription('Regex pattern (without delimiters)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to test against')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('flags')
                .setDescription('Regex flags (g, i, m, s, u, y)')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const pattern = interaction.options.getString('pattern');
            const text = interaction.options.getString('text');
            const flags = interaction.options.getString('flags') || 'g';

            let regex;
            try {
                regex = new RegExp(pattern, flags);
            } catch (error) {
                await interaction.reply({ 
                    content: `❌ Invalid regex pattern: ${error.message}`, 
                    flags: 1 << 6 
                });
                return;
            }

            const matches = [];
            const groups = [];
            let match;

            // Get all matches
            while ((match = regex.exec(text)) !== null) {
                matches.push(match[0]);
                if (match.length > 1) {
                    groups.push(match.slice(1));
                }
                if (!flags.includes('g')) break;
            }

            const embed = new EmbedBuilder()
                .setTitle('🔍 Regex Tester')
                .setColor(matches.length > 0 ? 0x00FF00 : 0xFF0000)
                .addFields(
                    { name: 'Pattern', value: `\`/${pattern}/${flags}\``, inline: false },
                    { name: 'Test String', value: `\`\`\`\n${text.slice(0, 1000)}\n\`\`\``, inline: false },
                    { name: 'Match Count', value: `${matches.length}`, inline: true }
                );

            if (matches.length > 0) {
                const matchDisplay = matches.slice(0, 10).map((m, i) => `${i + 1}. \`${m}\``).join('\n');
                embed.addFields({ 
                    name: '✅ Matches', 
                    value: matchDisplay + (matches.length > 10 ? `\n... and ${matches.length - 10} more` : ''), 
                    inline: false 
                });

                if (groups.length > 0) {
                    const groupDisplay = groups.slice(0, 5).map((g, i) => 
                        `${i + 1}. ${g.map(x => `\`${x}\``).join(', ')}`
                    ).join('\n');
                    embed.addFields({ 
                        name: '📦 Capture Groups', 
                        value: groupDisplay + (groups.length > 5 ? `\n... and ${groups.length - 5} more` : ''), 
                        inline: false 
                    });
                }
            } else {
                embed.addFields({ name: '❌ Result', value: 'No matches found', inline: false });
            }

            // Add helpful info
            embed.setFooter({ text: 'Flags: g=global, i=case-insensitive, m=multiline, s=dotAll, u=unicode, y=sticky' });
            embed.setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
