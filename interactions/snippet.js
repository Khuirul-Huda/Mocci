const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snippet')
        .setDescription('Manage your code snippets')
        .addSubcommand(subcommand =>
            subcommand
                .setName('save')
                .setDescription('Save a code snippet')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Snippet name')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Programming language')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('Code snippet')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Snippet description')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Get a saved snippet')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Snippet name')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all your snippets')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a snippet')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Snippet name')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            if (subcommand === 'save') {
                const name = interaction.options.getString('name');
                const language = interaction.options.getString('language');
                const code = interaction.options.getString('code');
                const description = interaction.options.getString('description') || '';

                await DB.saveSnippet(userId, name, language, code, description);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Snippet Saved')
                    .setDescription(`Snippet **${name}** has been saved successfully!`)
                    .addFields(
                        { name: 'Language', value: language, inline: true },
                        { name: 'Characters', value: `${code.length}`, inline: true }
                    )
                    .setColor(0x00FF00)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });

            } else if (subcommand === 'get') {
                const name = interaction.options.getString('name');
                const snippet = await DB.getSnippet(userId, name);

                if (snippet) {
                    const embed = new EmbedBuilder()
                        .setTitle(`📋 Snippet: ${snippet.name}`)
                        .setDescription(snippet.description || 'No description')
                        .addFields(
                            { name: 'Language', value: snippet.language, inline: true },
                            { name: 'Created', value: new Date(snippet.created_at).toLocaleDateString(), inline: true },
                            { name: 'Code', value: `\`\`\`${snippet.language}\n${snippet.code.slice(0, 1500)}\n\`\`\``, inline: false }
                        )
                        .setColor(0x5865F2)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], flags: 1 << 6 });
                } else {
                    await interaction.reply({ content: `Snippet **${name}** not found.`, flags: 1 << 6 });
                }

            } else if (subcommand === 'list') {
                const snippets = await DB.listSnippets(userId);

                if (snippets.length === 0) {
                    await interaction.reply({ content: 'You have no saved snippets. Use `/snippet save` to create one!', flags: 1 << 6 });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle('📚 Your Code Snippets')
                    .setDescription(snippets.map((s, i) => 
                        `${i + 1}. **${s.name}** (${s.language})\n   ${s.description || 'No description'}`
                    ).join('\n\n').slice(0, 4000))
                    .setColor(0x5865F2)
                    .setFooter({ text: `Total: ${snippets.length} snippet(s)` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });

            } else if (subcommand === 'delete') {
                const name = interaction.options.getString('name');
                await DB.deleteSnippet(userId, name);
                await interaction.reply({ content: `✅ Snippet **${name}** has been deleted.`, flags: 1 << 6 });
            }

        } catch (error) {
            console.error('Snippet error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
