const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Get a random inspirational quote'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const res = await fetch('https://api.quotify.top/random');
            if (!res.ok) throw new Error('API error');
            
            const data = await res.json();
            // Quotify returns an array for multiple, or an object for single
            const quote = Array.isArray(data) ? data[0] : data;
            
            if (!quote || !quote.text) throw new Error('No quote received from API.');
            
            const embed = new EmbedBuilder()
                .setTitle('💡 Quote of the Day')
                .setDescription(`"${quote.text}"`)
                .setFooter({ text: `— ${quote.author || 'Unknown'}` })
                .setColor('Random');
                
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Quote command error:', error);
            const errorMessage = { content: `Failed to fetch quote. Please try again later.`, flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMessage).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMessage).catch(() => {});
            }
        }
    }
};
