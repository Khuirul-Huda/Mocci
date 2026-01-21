const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pypi')
        .setDescription('Search Python packages on PyPI')
        .addStringOption(option =>
            option.setName('package')
                .setDescription('Package name to search')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const packageName = interaction.options.getString('package');
            const url = `https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                await interaction.editReply({ content: `Package "${packageName}" not found on PyPI.` });
                return;
            }

            const data = await response.json();
            const info = data.info;

            const embed = new EmbedBuilder()
                .setTitle(`🐍 ${info.name}`)
                .setURL(info.package_url)
                .setDescription(info.summary || 'No description available')
                .setColor(0x3776AB)
                .addFields(
                    { name: 'Latest Version', value: info.version, inline: true },
                    { name: 'License', value: info.license || 'Unknown', inline: true },
                    { name: 'Author', value: info.author || 'Unknown', inline: true }
                );

            if (info.requires_python) {
                embed.addFields({ name: 'Python Version', value: info.requires_python, inline: true });
            }

            if (info.home_page) {
                embed.addFields({ name: 'Homepage', value: `[Link](${info.home_page})`, inline: true });
            }

            if (info.project_urls) {
                const urls = Object.entries(info.project_urls)
                    .slice(0, 3)
                    .map(([key, val]) => `[${key}](${val})`)
                    .join(' • ');
                if (urls) embed.addFields({ name: 'Links', value: urls, inline: false });
            }

            if (info.keywords) {
                embed.addFields({ name: 'Keywords', value: info.keywords.slice(0, 200), inline: false });
            }

            embed.setFooter({ text: `Install: pip install ${info.name}` });
            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `Error searching PyPI: ${error.message}` });
        }
    }
};
