const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DB = require('../utils/db');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Manage giveaways')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a giveaway')
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('Duration (e.g., 1h, 30m, 1d)')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('winners')
                        .setDescription('Number of winners')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(20)
                )
                .addStringOption(option =>
                    option.setName('prize')
                        .setDescription('Prize description')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('End a giveaway early')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('Giveaway message ID')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reroll')
                .setDescription('Reroll giveaway winners')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('Giveaway message ID')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({ content: 'You need Manage Server permission!', flags: 1 << 6 });
            return;
        }

        try {
            if (subcommand === 'start') {
                const duration = interaction.options.getString('duration');
                const winnerCount = interaction.options.getInteger('winners');
                const prize = interaction.options.getString('prize');

                const time = ms(duration);
                if (!time || time < 1000) {
                    await interaction.reply({ content: 'Invalid duration! Use formats like: 1h, 30m, 1d', flags: 1 << 6 });
                    return;
                }

                const endsAt = Date.now() + time;

                const giveaway = await DB.createGiveaway(
                    interaction.guild.id,
                    interaction.channel.id,
                    interaction.user.id,
                    prize,
                    winnerCount,
                    endsAt
                );

                const embed = new EmbedBuilder()
                    .setTitle('🎉 GIVEAWAY 🎉')
                    .setDescription(`**Prize:** ${prize}\n\n**Winners:** ${winnerCount}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\n\n**React with 🎉 to enter!**`)
                    .setColor(0xff69b4)
                    .setFooter({ text: `Hosted by ${interaction.user.tag}` })
                    .setTimestamp(endsAt);

                const message = await interaction.channel.send({ embeds: [embed] });
                await message.react('🎉');
                await DB.updateGiveawayMessageId(giveaway.id, message.id);

                await interaction.reply({ content: 'Giveaway started!', flags: 1 << 6 });

                // Schedule giveaway end
                setTimeout(async () => {
                    await endGiveaway(interaction.client, giveaway.id);
                }, time);

            } else if (subcommand === 'end') {
                const messageId = interaction.options.getString('message_id');
                const giveaway = await DB.getGiveawayByMessageId(messageId);

                if (!giveaway || giveaway.ended) {
                    await interaction.reply({ content: 'Giveaway not found or already ended!', flags: 1 << 6 });
                    return;
                }

                await endGiveaway(interaction.client, giveaway.id);
                await interaction.reply({ content: 'Giveaway ended!', flags: 1 << 6 });

            } else if (subcommand === 'reroll') {
                const messageId = interaction.options.getString('message_id');
                const giveaway = await DB.getGiveawayByMessageId(messageId);

                if (!giveaway || !giveaway.ended) {
                    await interaction.reply({ content: 'Giveaway not found or not ended yet!', flags: 1 << 6 });
                    return;
                }

                try {
                    const channel = await interaction.client.channels.fetch(giveaway.channel_id);
                    const message = await channel.messages.fetch(giveaway.message_id);
                    const reaction = message.reactions.cache.get('🎉');

                    if (!reaction) {
                        await interaction.reply({ content: 'No reactions found!', flags: 1 << 6 });
                        return;
                    }

                    const users = await reaction.users.fetch();
                    const entries = users.filter(u => !u.bot);

                    if (entries.size < giveaway.winner_count) {
                        await interaction.reply({ content: 'Not enough participants!', flags: 1 << 6 });
                        return;
                    }

                    const winners = entries.random(giveaway.winner_count);
                    const winnerArray = Array.isArray(winners) ? winners : [winners];
                    const winnerMentions = winnerArray.map(w => `<@${w.id}>`).join(', ');

                    await channel.send(`🎉 Rerolled! New winner(s): ${winnerMentions}\n**Prize:** ${giveaway.prize}`);
                    await interaction.reply({ content: 'Giveaway rerolled!', flags: 1 << 6 });

                } catch (error) {
                    console.error('Reroll error:', error);
                    await interaction.reply({ content: 'Failed to reroll giveaway!', flags: 1 << 6 });
                }
            }

        } catch (error) {
            console.error('Giveaway error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};

async function endGiveaway(client, giveawayId) {
    try {
        const giveaway = await DB.getGiveaway(giveawayId);
        if (!giveaway || giveaway.ended) return;

        const channel = await client.channels.fetch(giveaway.channel_id);
        const message = await channel.messages.fetch(giveaway.message_id);
        const reaction = message.reactions.cache.get('🎉');

        if (!reaction) {
            await DB.endGiveaway(giveawayId, []);
            return;
        }

        const users = await reaction.users.fetch();
        const entries = users.filter(u => !u.bot);

        if (entries.size === 0) {
            const noWinnersEmbed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY ENDED 🎉')
                .setDescription(`**Prize:** ${giveaway.prize}\n\n**No valid entries!**`)
                .setColor(0xff0000);

            await message.edit({ embeds: [noWinnersEmbed] });
            await channel.send('No one entered the giveaway! 😢');
            await DB.endGiveaway(giveawayId, []);
            return;
        }

        const winnerCount = Math.min(giveaway.winner_count, entries.size);
        const winners = entries.random(winnerCount);
        const winnerArray = Array.isArray(winners) ? winners : [winners];
        const winnerIds = winnerArray.map(w => w.id);
        const winnerMentions = winnerArray.map(w => `<@${w.id}>`).join(', ');

        const endEmbed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY ENDED 🎉')
            .setDescription(`**Prize:** ${giveaway.prize}\n\n**Winner(s):** ${winnerMentions}`)
            .setColor(0x00ff00)
            .setFooter({ text: `Hosted by ${giveaway.host_id}` });

        await message.edit({ embeds: [endEmbed] });
        await channel.send(`🎊 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
        await DB.endGiveaway(giveawayId, winnerIds);

    } catch (error) {
        console.error('End giveaway error:', error);
    }
}
