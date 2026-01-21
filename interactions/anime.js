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
                    { name: '�️ Picture', value: 'picture' },
                    { name: '� Quote', value: 'quote' }
                )
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const type = interaction.options.getString('type') || 'picture'; // Changed default to picture
            const embed = new EmbedBuilder()
                .setColor(0xff6b9d)
                .setTimestamp();
            
            if (type === 'quote') {
                try {
                    const res = await fetch('https://animechan.xyz/api/random');
                    
                    if (!res.ok) throw new Error('API error');
                    
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error('Invalid response format');
                    }
                    
                    const data = await res.json();
                    
                    if (!data.quote || !data.character || !data.anime) {
                        throw new Error('Invalid data structure');
                    }
                    
                    embed.setTitle('💬 Anime Quote')
                        .setDescription(`"${data.quote}"`)
                        .addFields(
                            { name: 'Character', value: data.character, inline: true },
                            { name: 'Anime', value: data.anime, inline: true }
                        )
                        .setFooter({ text: 'Powered by AnimeChan' });
                } catch (apiError) {
                    // Fallback to hardcoded quotes if API fails
                    const fallbackQuotes = [
                        { quote: "The world isn't perfect. But it's there for us, doing the best it can.", character: "Roy Mustang", anime: "Fullmetal Alchemist" },
                        { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece" },
                        { quote: "Hard work is worthless for those that don't believe in themselves.", character: "Naruto Uzumaki", anime: "Naruto" },
                        { quote: "People's lives don't end when they die. It ends when they lose faith.", character: "Itachi Uchiha", anime: "Naruto" },
                        { quote: "If you don't like your destiny, don't accept it.", character: "Naruto Uzumaki", anime: "Naruto" }
                    ];
                    
                    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
                    
                    embed.setTitle('💬 Anime Quote')
                        .setDescription(`"${randomQuote.quote}"`)
                        .addFields(
                            { name: 'Character', value: randomQuote.character, inline: true },
                            { name: 'Anime', value: randomQuote.anime, inline: true }
                        )
                        .setFooter({ text: 'Fallback Quote (API unavailable)' });
                }
                    
            } else {
                const res = await fetch('https://api.waifu.pics/sfw/waifu');
                
                if (!res.ok) throw new Error('Failed to fetch anime picture');
                
                const data = await res.json();
                
                if (!data.url) throw new Error('No image URL received');
                
                embed.setTitle('🖼️ Random Anime Picture')
                    .setImage(data.url)
                    .setFooter({ text: 'Powered by waifu.pics' });
            }
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Anime error:', error);
            const errorMsg = { content: 'Failed to fetch anime content. (╥﹏╥) Please try again later.', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
