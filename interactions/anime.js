const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Get random anime quotes or pictures')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What do you want?')
                .setRequired(false)
                .addChoices(
                    { name: '💬 Quote', value: 'quote' },
                    { name: '🖼️ Picture', value: 'picture' }
                )
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const type = interaction.options.getString('type') || 'quote';
            const embed = new EmbedBuilder()
                .setColor(0xff6b9d)
                .setTimestamp();
            
            if (type === 'quote') {
                const res = await fetch('https://animechan.xyz/api/random');
                const data = await res.json();
                
                embed.setTitle('💬 Anime Quote')
                    .setDescription(`"${data.quote}"`)
                    .addFields(
                        { name: 'Character', value: data.character, inline: true },
                        { name: 'Anime', value: data.anime, inline: true }
                    )
                    .setFooter({ text: 'Powered by AnimeChan' });
                    
            } else {
                const res = await fetch('https://api.waifu.pics/sfw/waifu');
                const data = await res.json();
                
                embed.setTitle('🖼️ Random Anime Picture')
                    .setImage(data.url)
                    .setFooter({ text: 'Powered by waifu.pics' });
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Anime error:', error);
            const errorMsg = { content: 'Failed to fetch anime content. (╥﹏╥)', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
