const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a simple poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Poll question')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Comma-separated options (max 10)')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const question = interaction.options.getString('question');
            const optionsRaw = interaction.options.getString('options');
            const options = optionsRaw.split(',').map(opt => opt.trim()).filter(Boolean).slice(0, 10);
            if (options.length < 2) {
                await interaction.reply({ content: 'Please provide at least 2 options (comma separated).', flags: 1 << 6 });
                return;
            }
            const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
            const description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`📊 ${question}`)
                .setDescription(description)
                .setColor('Random')
                .addFields(
                  { name: 'How to Vote', value: 'React with the emoji that matches your choice below.' },
                  { name: 'Poll Info', value: `Poll created by: <@${interaction.user.id}>\nVoting is open until the poll is closed by a moderator or the channel is cleared.` }
                )
                .setFooter({ text: `Options: ${options.length} | Max: 10` });
            await interaction.reply({ embeds: [embed] });
            const pollMsg = await interaction.fetchReply();
            for (let i = 0; i < options.length; i++) {
                await pollMsg.react(emojis[i]);
            }
        } catch (error) {
            await interaction.reply({ content: `Failed to create poll. Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
