const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Cron expression examples and explanations
const EXAMPLES = {
    'every-minute': { cron: '* * * * *', desc: 'Every minute' },
    'every-hour': { cron: '0 * * * *', desc: 'Every hour at minute 0' },
    'daily-9am': { cron: '0 9 * * *', desc: 'Every day at 9:00 AM' },
    'weekly-monday': { cron: '0 9 * * 1', desc: 'Every Monday at 9:00 AM' },
    'monthly-1st': { cron: '0 0 1 * *', desc: 'First day of every month at midnight' },
    'workdays-9am': { cron: '0 9 * * 1-5', desc: 'Every weekday at 9:00 AM' },
    'every-5min': { cron: '*/5 * * * *', desc: 'Every 5 minutes' },
    'midnight': { cron: '0 0 * * *', desc: 'Every day at midnight' }
};

function explainCron(cron) {
    const parts = cron.trim().split(' ');
    if (parts.length !== 5) {
        return 'Invalid cron expression. Must have 5 fields: minute hour day month weekday';
    }

    const [minute, hour, day, month, weekday] = parts;
    
    let explanation = 'Runs ';
    
    // Minute
    if (minute === '*') explanation += 'every minute';
    else if (minute.includes('/')) explanation += `every ${minute.split('/')[1]} minutes`;
    else explanation += `at minute ${minute}`;
    
    // Hour
    if (hour !== '*') {
        if (hour.includes('/')) explanation += ` of every ${hour.split('/')[1]} hours`;
        else explanation += ` of hour ${hour}`;
    }
    
    // Day
    if (day !== '*') {
        if (day.includes('/')) explanation += `, every ${day.split('/')[1]} days`;
        else explanation += `, on day ${day}`;
    }
    
    // Month
    if (month !== '*') {
        if (month.includes('/')) explanation += ` of every ${month.split('/')[1]} months`;
        else explanation += ` of month ${month}`;
    }
    
    // Weekday
    if (weekday !== '*') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (weekday.includes('-')) {
            const [start, end] = weekday.split('-');
            explanation += `, ${days[start]} through ${days[end]}`;
        } else if (weekday.includes('/')) {
            explanation += `, every ${weekday.split('/')[1]} days of the week`;
        } else {
            explanation += `, on ${days[weekday]}`;
        }
    }
    
    return explanation;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cron')
        .setDescription('Cron expression helper')
        .addSubcommand(subcommand =>
            subcommand
                .setName('explain')
                .setDescription('Explain a cron expression')
                .addStringOption(option =>
                    option.setName('expression')
                        .setDescription('Cron expression (e.g., "0 9 * * 1")')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('examples')
                .setDescription('Show common cron expression examples')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'explain') {
                const expression = interaction.options.getString('expression');
                const explanation = explainCron(expression);

                const embed = new EmbedBuilder()
                    .setTitle('⏰ Cron Expression Explained')
                    .addFields(
                        { name: 'Expression', value: `\`${expression}\``, inline: false },
                        { name: 'Explanation', value: explanation, inline: false },
                        { name: 'Format', value: '```\nminute (0-59)\nhour (0-23)\nday (1-31)\nmonth (1-12)\nweekday (0-6, 0=Sunday)\n```', inline: false }
                    )
                    .setColor(0x5865F2)
                    .setFooter({ text: 'Special characters: * (any), / (step), - (range), , (list)' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });

            } else if (subcommand === 'examples') {
                const exampleList = Object.entries(EXAMPLES).map(([key, val]) => 
                    `**${val.desc}**\n\`${val.cron}\``
                ).join('\n\n');

                const embed = new EmbedBuilder()
                    .setTitle('⏰ Common Cron Expressions')
                    .setDescription(exampleList)
                    .setColor(0x5865F2)
                    .addFields(
                        { name: 'Format', value: '`minute hour day month weekday`', inline: false },
                        { name: 'Special Characters', value: '`*` = any value\n`*/n` = every n units\n`n-m` = range from n to m\n`n,m` = list of values', inline: false }
                    )
                    .setFooter({ text: 'Use /cron explain <expression> to understand any cron expression' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], flags: 1 << 6 });
            }

        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
