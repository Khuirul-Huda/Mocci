const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { randomUUID } = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uuid')
        .setDescription('Generate UUID (v4)')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of UUIDs to generate (1-10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)
        ),
    async execute(interaction) {
        try {
            const count = interaction.options.getInteger('count') || 1;
            const uuids = Array.from({ length: count }, () => randomUUID());

            const embed = new EmbedBuilder()
                .setTitle('🆔 UUID Generator')
                .setDescription(`Generated ${count} UUID(s):\n\n` + uuids.map((uuid, i) => `${i + 1}. \`${uuid}\``).join('\n'))
                .setColor(0x5865F2)
                .setFooter({ text: 'UUID v4 (Random)' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: 1 << 6 });

        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
