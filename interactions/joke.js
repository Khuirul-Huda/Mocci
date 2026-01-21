const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a random joke')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Joke category')
                .setRequired(false)
                .addChoices(
                    { name: 'Any', value: 'Any' },
                    { name: 'Programming', value: 'Programming' },
                    { name: 'Misc', value: 'Misc' },
                    { name: 'Dark', value: 'Dark' },
                    { name: 'Pun', value: 'Pun' },
                    { name: 'Spooky', value: 'Spooky' },
                    { name: 'Christmas', value: 'Christmas' }
                )
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const category = interaction.options.getString('category') || 'Any';
            const res = await fetch(`https://v2.jokeapi.dev/joke/${category}?safe-mode`);
            
            if (!res.ok) throw new Error('Failed to fetch joke');
            
            const data = await res.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😂 ' + (data.category || 'Joke'))
                .setColor(0xff9900)
                .setFooter({ text: `Type: ${data.type} | Safe mode enabled` });
            
            if (data.type === 'single') {
                embed.setDescription(data.joke);
            } else {
                embed.addFields(
                    { name: '❓ Setup', value: data.setup },
                    { name: '💡 Delivery', value: data.delivery }
                );
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Joke error:', error);
            const errorMsg = { content: 'Failed to fetch joke. Please try again later.', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
