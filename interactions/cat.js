const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Get a random cat picture or fact')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What do you want?')
                .setRequired(false)
                .addChoices(
                    { name: '🖼️ Picture', value: 'picture' },
                    { name: '📝 Fact', value: 'fact' }
                )
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const type = interaction.options.getString('type') || 'picture';
            const embed = new EmbedBuilder()
                .setColor(0xff9900)
                .setTimestamp();
            
            if (type === 'picture') {
                const res = await fetch('https://api.thecatapi.com/v1/images/search');
                const data = await res.json();
                
                embed.setTitle('🐱 Random Cat')
                    .setImage(data[0].url)
                    .setFooter({ text: 'Powered by TheCatAPI' });
                    
            } else {
                const res = await fetch('https://catfact.ninja/fact');
                const data = await res.json();
                
                embed.setTitle('🐱 Cat Fact')
                    .setDescription(data.fact)
                    .setFooter({ text: 'Powered by CatFact.ninja' });
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Cat error:', error);
            const errorMsg = { content: 'Failed to fetch cat content. Meow! 😿', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
