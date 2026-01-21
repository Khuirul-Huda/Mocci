const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stackoverflow')
        .setDescription('Search Stack Overflow questions')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const query = interaction.options.getString('query');
            const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                await interaction.editReply({ content: 'No questions found on Stack Overflow.' });
                return;
            }

            const question = data.items[0];
            const embed = new EmbedBuilder()
                .setTitle(question.title.length > 256 ? question.title.slice(0, 253) + '...' : question.title)
                .setURL(question.link)
                .setColor(0xF48024)
                .addFields(
                    { name: 'Score', value: `${question.score}`, inline: true },
                    { name: 'Answers', value: `${question.answer_count}`, inline: true },
                    { name: 'Views', value: `${question.view_count}`, inline: true },
                    { name: 'Status', value: question.is_answered ? '✅ Answered' : '❌ Unanswered', inline: true }
                );

            if (question.tags && question.tags.length > 0) {
                embed.addFields({ name: 'Tags', value: question.tags.map(t => `\`${t}\``).join(' '), inline: false });
            }

            if (data.items.length > 1) {
                const others = data.items.slice(1, 4).map((q, i) => 
                    `${i + 2}. [${q.title.slice(0, 80)}${q.title.length > 80 ? '...' : ''}](${q.link}) (Score: ${q.score})`
                ).join('\n');
                embed.addFields({ name: 'Other Results', value: others, inline: false });
            }

            embed.setFooter({ text: `Asked on ${new Date(question.creation_date * 1000).toLocaleDateString()}` });
            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `Error searching Stack Overflow: ${error.message}` });
        }
    }
};
