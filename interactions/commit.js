const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commit')
        .setDescription('Generate commit message using AI')
        .addStringOption(option =>
            option.setName('changes')
                .setDescription('Describe what changed in the code')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Commit type')
                .setRequired(false)
                .addChoices(
                    { name: 'feat (new feature)', value: 'feat' },
                    { name: 'fix (bug fix)', value: 'fix' },
                    { name: 'docs (documentation)', value: 'docs' },
                    { name: 'style (formatting)', value: 'style' },
                    { name: 'refactor (code refactoring)', value: 'refactor' },
                    { name: 'test (adding tests)', value: 'test' },
                    { name: 'chore (maintenance)', value: 'chore' }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply({ flags: 1 << 6 });

        try {
            const changes = interaction.options.getString('changes');
            const type = interaction.options.getString('type') || 'auto';
            const apiKey = process.env.OPENROUTER_API_KEY;

            if (!apiKey) {
                await interaction.editReply({ content: 'AI API key is not configured.' });
                return;
            }

            const prompt = type === 'auto' 
                ? `Generate a concise git commit message (max 50 chars) for these changes: ${changes}`
                : `Generate a concise git commit message starting with '${type}:' (max 50 chars) for: ${changes}`;

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
                            content: 'You are a git commit message expert. Generate clear, concise commit messages following conventional commits format. Keep messages under 50 characters. Only output the commit message, nothing else.' 
                        },
                        { role: 'user', content: prompt }
                    ],
                    reasoning: { enabled: false }
                })
            });

            const result = await response.json();
            const commitMsg = result.choices?.[0]?.message?.content?.trim();

            if (!commitMsg) throw new Error('No AI response.');

            const embed = new EmbedBuilder()
                .setTitle('💬 Generated Commit Message')
                .addFields(
                    { name: 'Your Changes', value: `\`\`\`\n${changes.slice(0, 500)}\n\`\`\``, inline: false },
                    { name: 'Suggested Commit', value: `\`\`\`bash\ngit commit -m "${commitMsg}"\n\`\`\``, inline: false }
                )
                .setColor(0x00FF00)
                .setFooter({ text: 'Tip: Edit the message if needed before committing' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `Error generating commit message: ${error.message}` });
        }
    }
};
