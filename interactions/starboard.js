const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Manage the starboard')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up starboard channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for starboard')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('View top starred messages')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'setup') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    await interaction.reply({ content: 'You need Manage Server permission!', flags: 1 << 6 });
                    return;
                }

                const channel = interaction.options.getChannel('channel');
                
                // Store in guild settings (we'll use a simple approach for now)
                interaction.client.starboardChannels = interaction.client.starboardChannels || new Map();
                interaction.client.starboardChannels.set(interaction.guild.id, channel.id);

                await interaction.reply({ content: `⭐ Starboard channel set to ${channel}! React with ⭐ to messages to add them to the starboard.` });

            } else if (subcommand === 'top') {
                const topStarred = await DB.getTopStarred(interaction.guild.id, 10);

                if (topStarred.length === 0) {
                    await interaction.reply({ content: 'No starred messages yet!', flags: 1 << 6 });
                    return;
                }

                const starList = await Promise.all(
                    topStarred.map(async (star, idx) => {
                        let authorName = 'Unknown';
                        try {
                            const author = await interaction.client.users.fetch(star.author_id);
                            authorName = author.tag;
                        } catch {}

                        const content = star.content?.slice(0, 100) || '[No content]';
                        return `**${idx + 1}.** ⭐ ${star.star_count} | by ${authorName}\n> ${content}${star.content?.length > 100 ? '...' : ''}`;
                    })
                );

                const embed = new EmbedBuilder()
                    .setTitle('⭐ Top Starred Messages')
                    .setDescription(starList.join('\n\n'))
                    .setColor(0xffd700)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Starboard error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
