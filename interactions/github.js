const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('github')
        .setDescription('Search GitHub repositories')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Repository or user to search')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Search type')
                .setRequired(false)
                .addChoices(
                    { name: 'Repository', value: 'repo' },
                    { name: 'User', value: 'user' }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const query = interaction.options.getString('query');
            const type = interaction.options.getString('type') || 'repo';

            if (type === 'repo') {
                const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Mocci-Discord-Bot'
                    }
                });

                const data = await response.json();

                if (!data.items || data.items.length === 0) {
                    await interaction.editReply({ content: 'No repositories found.' });
                    return;
                }

                const repo = data.items[0];
                const embed = new EmbedBuilder()
                    .setTitle(`⭐ ${repo.full_name}`)
                    .setURL(repo.html_url)
                    .setDescription(repo.description || 'No description available')
                    .setColor(0x238636)
                    .addFields(
                        { name: 'Stars', value: `⭐ ${repo.stargazers_count.toLocaleString()}`, inline: true },
                        { name: 'Forks', value: `🍴 ${repo.forks_count.toLocaleString()}`, inline: true },
                        { name: 'Issues', value: `🐛 ${repo.open_issues_count.toLocaleString()}`, inline: true },
                        { name: 'Language', value: repo.language || 'Unknown', inline: true },
                        { name: 'License', value: repo.license?.name || 'None', inline: true },
                        { name: 'Updated', value: new Date(repo.updated_at).toLocaleDateString(), inline: true }
                    );

                if (repo.topics && repo.topics.length > 0) {
                    embed.addFields({ name: 'Topics', value: repo.topics.slice(0, 10).join(', '), inline: false });
                }

                if (data.items.length > 1) {
                    const others = data.items.slice(1, 4).map(r => `• [${r.full_name}](${r.html_url}) ⭐${r.stargazers_count}`).join('\n');
                    embed.addFields({ name: 'Other Results', value: others, inline: false });
                }

                embed.setFooter({ text: `${data.total_count.toLocaleString()} total results` });
                embed.setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else if (type === 'user') {
                const url = `https://api.github.com/users/${encodeURIComponent(query)}`;
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Mocci-Discord-Bot'
                    }
                });

                if (!response.ok) {
                    await interaction.editReply({ content: `User "${query}" not found on GitHub.` });
                    return;
                }

                const user = await response.json();
                const embed = new EmbedBuilder()
                    .setTitle(`👤 ${user.login}`)
                    .setURL(user.html_url)
                    .setDescription(user.bio || 'No bio available')
                    .setThumbnail(user.avatar_url)
                    .setColor(0x238636)
                    .addFields(
                        { name: 'Name', value: user.name || 'N/A', inline: true },
                        { name: 'Public Repos', value: `${user.public_repos}`, inline: true },
                        { name: 'Followers', value: `${user.followers}`, inline: true },
                        { name: 'Following', value: `${user.following}`, inline: true }
                    );

                if (user.company) embed.addFields({ name: 'Company', value: user.company, inline: true });
                if (user.location) embed.addFields({ name: 'Location', value: user.location, inline: true });
                if (user.blog) embed.addFields({ name: 'Website', value: `[Link](${user.blog})`, inline: true });
                if (user.twitter_username) embed.addFields({ name: 'Twitter', value: `@${user.twitter_username}`, inline: true });

                embed.setFooter({ text: `Joined GitHub on ${new Date(user.created_at).toLocaleDateString()}` });
                embed.setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            await interaction.editReply({ content: `Error searching GitHub: ${error.message}` });
        }
    }
};
