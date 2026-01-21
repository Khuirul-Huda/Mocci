const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advice')
        .setDescription('Get random life advice'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const res = await fetch('https://api.adviceslip.com/advice');
            const data = await res.json();
            
            const embed = new EmbedBuilder()
                .setTitle('💡 Random Advice')
                .setDescription(`"${data.slip.advice}"`)
                .setColor(0x00ff88)
                .setFooter({ text: `Advice #${data.slip.id} • AdviceSlip API` })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Advice error:', error);
            const errorMsg = { content: 'Failed to fetch advice. Here\'s some: Try again later! 😄', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
