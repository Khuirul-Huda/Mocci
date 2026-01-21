const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme from Reddit'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const subreddits = ['memes', 'dankmemes', 'me_irl', 'wholesomememes', 'ProgrammerHumor'];
            const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];
            
            const res = await fetch(`https://meme-api.com/gimme/${randomSub}`);
            const data = await res.json();
            
            if (!data.url) throw new Error('No meme found');
            
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setURL(data.postLink)
                .setImage(data.url)
                .setColor(0xff4500)
                .setFooter({ text: `👍 ${data.ups} upvotes • r/${data.subreddit} • u/${data.author}` })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Meme error:', error);
            const errorMsg = { content: 'Failed to fetch meme. Sad stonks 📉', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
