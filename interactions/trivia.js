const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Get a random trivia question')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Question category')
                .setRequired(false)
                .addChoices(
                    { name: 'General Knowledge', value: '9' },
                    { name: 'Science & Nature', value: '17' },
                    { name: 'Computers', value: '18' },
                    { name: 'Mathematics', value: '19' },
                    { name: 'Sports', value: '21' },
                    { name: 'Geography', value: '22' },
                    { name: 'History', value: '23' },
                    { name: 'Animals', value: '27' }
                )
        )
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Question difficulty')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy', value: 'easy' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'Hard', value: 'hard' }
                )
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const category = interaction.options.getString('category') || '';
            const difficulty = interaction.options.getString('difficulty') || '';
            
            let url = 'https://opentdb.com/api.php?amount=1';
            if (category) url += `&category=${category}`;
            if (difficulty) url += `&difficulty=${difficulty}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.response_code !== 0) throw new Error('No questions found');
            
            const question = data.results[0];
            const answers = [...question.incorrect_answers, question.correct_answer]
                .sort(() => Math.random() - 0.5)
                .map((ans, i) => `${['A', 'B', 'C', 'D'][i]}. ${ans}`)
                .join('\n');
            
            const embed = new EmbedBuilder()
                .setTitle('🧠 Trivia Question')
                .setDescription(question.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'))
                .addFields(
                    { name: 'Answers', value: answers },
                    { name: 'Category', value: question.category, inline: true },
                    { name: 'Difficulty', value: question.difficulty.toUpperCase(), inline: true },
                    { name: 'Type', value: question.type === 'multiple' ? 'Multiple Choice' : 'True/False', inline: true }
                )
                .setColor(0x5865f2)
                .setFooter({ text: 'React with 🔍 to reveal the answer! • Open Trivia DB' })
                .setTimestamp();
            
            const message = await interaction.editReply({ embeds: [embed] });
            await message.react('🔍');
            
            // Collect reaction to show answer
            const filter = (reaction, user) => reaction.emoji.name === '🔍' && user.id === interaction.user.id;
            const collector = message.createReactionCollector({ filter, time: 60000, max: 1 });
            
            collector.on('collect', async () => {
                const answerEmbed = new EmbedBuilder()
                    .setTitle('✅ Answer')
                    .setDescription(`**${question.correct_answer}**`)
                    .setColor(0x00ff00);
                
                await interaction.followUp({ embeds: [answerEmbed], ephemeral: true });
            });
            
        } catch (error) {
            console.error('Trivia error:', error);
            const errorMsg = { content: 'Failed to fetch trivia question. Please try again later.', flags: 1 << 6 };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};
