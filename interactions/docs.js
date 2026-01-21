const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Search programming documentation')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Documentation source')
                .setRequired(false)
                .addChoices(
                    { name: 'MDN (JavaScript/Web)', value: 'mdn' },
                    { name: 'Python', value: 'python' },
                    { name: 'Discord.js', value: 'discordjs' },
                    { name: 'Node.js', value: 'node' }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const query = interaction.options.getString('query');
            const source = interaction.options.getString('source') || 'mdn';

            let url, results;

            if (source === 'mdn') {
                // Search MDN
                url = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.documents && data.documents.length > 0) {
                    const doc = data.documents[0];
                    const embed = new EmbedBuilder()
                        .setTitle(`📚 MDN: ${doc.title}`)
                        .setURL(`https://developer.mozilla.org${doc.mdn_url}`)
                        .setDescription(doc.summary || 'No description available')
                        .setColor(0x0066CC)
                        .setFooter({ text: 'MDN Web Docs' })
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.editReply({ content: 'No results found on MDN.' });
                }

            } else if (source === 'python') {
                // Python docs link
                const searchUrl = `https://docs.python.org/3/search.html?q=${encodeURIComponent(query)}`;
                const embed = new EmbedBuilder()
                    .setTitle(`🐍 Python Documentation: ${query}`)
                    .setURL(searchUrl)
                    .setDescription(`Click the link above to search Python docs for "${query}"`)
                    .setColor(0x3776AB)
                    .setFooter({ text: 'Python 3 Documentation' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else if (source === 'discordjs') {
                // Discord.js docs
                const djsUrl = `https://discord.js.org/#/docs/discord.js/stable/search?query=${encodeURIComponent(query)}`;
                const embed = new EmbedBuilder()
                    .setTitle(`💬 Discord.js Documentation: ${query}`)
                    .setURL(djsUrl)
                    .setDescription(`Click the link above to search Discord.js docs for "${query}"`)
                    .setColor(0x5865F2)
                    .setFooter({ text: 'Discord.js Documentation' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else if (source === 'node') {
                // Node.js docs
                const nodeUrl = `https://nodejs.org/api/${query.toLowerCase()}.html`;
                const embed = new EmbedBuilder()
                    .setTitle(`📗 Node.js Documentation: ${query}`)
                    .setURL(nodeUrl)
                    .setDescription(`Click the link above for Node.js docs on "${query}"`)
                    .setColor(0x339933)
                    .setFooter({ text: 'Node.js Documentation' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            await interaction.editReply({ content: `Error searching documentation: ${error.message}` });
        }
    }
};
