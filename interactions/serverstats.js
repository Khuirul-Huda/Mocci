const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('View server statistics'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;

            // Fetch all members to get accurate counts
            await guild.members.fetch();

            const totalMembers = guild.memberCount;
            const humans = guild.members.cache.filter(m => !m.user.bot).size;
            const bots = guild.members.cache.filter(m => m.user.bot).size;
            const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;

            const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
            const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
            const categories = guild.channels.cache.filter(c => c.type === 4).size;

            const roles = guild.roles.cache.size - 1; // Exclude @everyone

            const boostTier = guild.premiumTier;
            const boostCount = guild.premiumSubscriptionCount || 0;

            const createdAt = guild.createdAt;
            const createdTimestamp = Math.floor(createdAt.getTime() / 1000);

            const embed = new EmbedBuilder()
                .setTitle(`📊 ${guild.name} Statistics`)
                .setThumbnail(guild.iconURL({ size: 256 }))
                .addFields(
                    { 
                        name: '👥 Members', 
                        value: `**Total:** ${totalMembers}\n**Humans:** ${humans}\n**Bots:** ${bots}\n**Online:** ${onlineMembers}`, 
                        inline: true 
                    },
                    { 
                        name: '📁 Channels', 
                        value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}`, 
                        inline: true 
                    },
                    { 
                        name: '🎭 Roles', 
                        value: `${roles}`, 
                        inline: true 
                    },
                    { 
                        name: '💎 Server Boost', 
                        value: `**Tier:** ${boostTier}\n**Boosts:** ${boostCount}`, 
                        inline: true 
                    },
                    { 
                        name: '👑 Owner', 
                        value: `<@${guild.ownerId}>`, 
                        inline: true 
                    },
                    { 
                        name: '📅 Created', 
                        value: `<t:${createdTimestamp}:D>\n(<t:${createdTimestamp}:R>)`, 
                        inline: true 
                    }
                )
                .setColor(0x5865f2)
                .setFooter({ text: `Server ID: ${guild.id}` })
                .setTimestamp();

            if (guild.description) {
                embed.setDescription(guild.description);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Server stats error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
