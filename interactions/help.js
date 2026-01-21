const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of all commands'),
    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('🤖 Mocci Bot - Ultimate Programmer\'s Assistant')
                .setDescription('Here are all available commands organized by category:')
                .setColor(0x5865f2)
                .addFields(
                    { name: '💻 Code Execution', value: '`/run` `/explain` `/format` `/regex` `/leetcode` `/cron`', inline: false },
                    { name: '📚 Documentation', value: '`/docs` `/npm` `/pypi` `/github` `/stackoverflow`', inline: false },
                    { name: '🛠️ Developer Tools', value: '`/json` `/base64` `/hash` `/uuid` `/paste` `/snippet` `/commit`', inline: false },
                    { name: '🎖️ Leveling & XP', value: '`/rank` `/leaderboard` - Earn XP by chatting!', inline: false },
                    { name: '⚖️ Moderation', value: '`/warn` `/warnings` `/clearwarnings` `/modlogs`', inline: false },
                    { name: '🎉 Community', value: '`/starboard` `/giveaway` `/welcome` `/afk`', inline: false },
                    { name: '🤖 AI Features', value: '`/ai` `/setaichannel` - AI chat with memory', inline: false },
                    { name: '📊 Server Info', value: '`/serverstats` `/serverinfo` `/userinfo` `/about` `/dbstatus`', inline: false },
                    { name: '🎮 Fun & Entertainment', value: '`/joke` `/cat` `/dog` `/meme` `/anime` `/advice` `/trivia` `/8ball` `/quote` `/weather` `/poll` `/random` `/enchant`', inline: false },
                    { name: '🖼️ Media', value: '`/avatar` `/screenshot`', inline: false },
                    { name: '⚙️ Admin', value: '`/setactivity` `/reload` (Owner only)', inline: false }
                )
                .setFooter({ text: 'Mocci v3.0' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite Bot')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`),
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setStyle(ButtonStyle.Link)
                        .setURL(process.env.SUPPORT_SERVER_URL)
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Help error:', error);
            await interaction.reply({ content: 'Error displaying help.', flags: 1 << 6 });
        }
    }
};
