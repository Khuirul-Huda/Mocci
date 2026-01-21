const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explain')
        .setDescription('Get AI explanation of code')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code to explain')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Programming language')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const code = interaction.options.getString('code');
            const language = interaction.options.getString('language') || 'unknown';
            const apiKey = process.env.OPENROUTER_API_KEY;

            if (!apiKey) {
                await interaction.editReply({ content: 'AI API key is not configured.', flags: 1 << 6 });
                return;
            }

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'xiaomi/mimo-v2-flash:free',
                    messages: [
                        { 
                            role: 'system', 
                            content: 'You are a code explainer. Explain code clearly and concisely in under 1500 characters. Break down what the code does, mention key concepts, and explain any complex parts.' 
                        },
                        { 
                            role: 'user', 
                            content: `Explain this ${language} code:\n\n${code}` 
                        }
                    ],
                    reasoning: { enabled: false }
                })
            });

            const result = await response.json();
            const explanation = result.choices?.[0]?.message?.content;

            if (!explanation) throw new Error('No AI response.');

            const embed = new EmbedBuilder()
                .setTitle('📖 Code Explanation')
                .addFields(
                    { name: 'Code', value: `\`\`\`${language}\n${code.slice(0, 1000)}\n\`\`\``, inline: false },
                    { name: 'Explanation', value: explanation.slice(0, 1500), inline: false }
                )
                .setColor(0x5865F2)
                .setFooter({ text: 'Powered by MocciAI' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `Error explaining code: ${error.message}` });
        }
    }
};
