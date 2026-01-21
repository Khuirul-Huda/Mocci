const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
    // Positive
    '✅ It is certain.',
    '✅ It is decidedly so.',
    '✅ Without a doubt.',
    '✅ Yes definitely.',
    '✅ You may rely on it.',
    '✅ As I see it, yes.',
    '✅ Most likely.',
    '✅ Outlook good.',
    '✅ Yes.',
    '✅ Signs point to yes.',
    // Uncertain
    '🤔 Reply hazy, try again.',
    '🤔 Ask again later.',
    '🤔 Better not tell you now.',
    '🤔 Cannot predict now.',
    '🤔 Concentrate and ask again.',
    // Negative
    '❌ Don\'t count on it.',
    '❌ My reply is no.',
    '❌ My sources say no.',
    '❌ Outlook not so good.',
    '❌ Very doubtful.'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your yes/no question')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const question = interaction.options.getString('question');
            const answer = responses[Math.floor(Math.random() * responses.length)];
            
            const embed = new EmbedBuilder()
                .setTitle('🎱 Magic 8-Ball')
                .addFields(
                    { name: '❓ Question', value: question },
                    { name: '💭 Answer', value: answer }
                )
                .setColor(answer.startsWith('✅') ? 0x00ff00 : answer.startsWith('❌') ? 0xff0000 : 0xffaa00)
                .setFooter({ text: 'The magic 8-ball has spoken!' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('8ball error:', error);
            await interaction.reply({ 
                content: '🎱 The magic 8-ball is unavailable. Ask again later!', 
                flags: 1 << 6 
            }).catch(() => {});
        }
    }
};
