const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('npm')
        .setDescription('Search NPM packages')
        .addStringOption(option =>
            option.setName('package')
                .setDescription('Package name to search')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const packageName = interaction.options.getString('package');
            const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                await interaction.editReply({ content: `Package "${packageName}" not found on NPM.` });
                return;
            }

            const data = await response.json();
            const latest = data['dist-tags']?.latest || Object.keys(data.versions).pop();
            const latestData = data.versions[latest];

            const embed = new EmbedBuilder()
                .setTitle(`📦 ${data.name}`)
                .setURL(`https://www.npmjs.com/package/${data.name}`)
                .setDescription(data.description || 'No description available')
                .setColor(0xCC3534)
                .addFields(
                    { name: 'Latest Version', value: latest, inline: true },
                    { name: 'License', value: data.license || 'Unknown', inline: true },
                    { name: 'Author', value: typeof data.author === 'object' ? data.author.name : (data.author || 'Unknown'), inline: true }
                );

            if (latestData.dependencies) {
                const depCount = Object.keys(latestData.dependencies).length;
                embed.addFields({ name: 'Dependencies', value: `${depCount}`, inline: true });
            }

            if (data.repository?.url) {
                embed.addFields({ name: 'Repository', value: `[GitHub](${data.repository.url.replace('git+', '').replace('.git', '')})`, inline: true });
            }

            if (data.homepage) {
                embed.addFields({ name: 'Homepage', value: `[Link](${data.homepage})`, inline: true });
            }

            if (data.keywords && data.keywords.length > 0) {
                embed.addFields({ name: 'Keywords', value: data.keywords.slice(0, 10).join(', '), inline: false });
            }

            embed.setFooter({ text: `Install: npm install ${data.name}` });
            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `Error searching NPM: ${error.message}` });
        }
    }
};
