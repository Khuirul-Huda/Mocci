const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription('Get a random dog picture or fact')
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
                .setColor(0x00aaff)
                .setTimestamp();
            
            if (type === 'picture') {
                const res = await fetch('https://dog.ceo/api/breeds/image/random');
                const data = await res.json();
                
                embed.setTitle('🐶 Random Dog')
                    .setImage(data.message)
                    .setFooter({ text: 'Powered by Dog CEO API' });
                    
            } else {
                const res = await fetch('https://dogapi.dog/api/v2/facts');
                const data = await res.json();
                
                embed.setTitle('🐶 Dog Fact')
                    .setDescription(data.data[0].attributes.body)
                    .setFooter({ text: 'Powered by DogAPI' });
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Dog error:', error);
            const errorMsg = { content: 'Failed to fetch dog content. Woof! 🐕', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
