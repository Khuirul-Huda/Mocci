const { SlashCommandBuilder } = require('discord.js');
const DB = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set or remove your AFK status')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set AFK status')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('AFK message')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove AFK status')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'set') {
                const message = interaction.options.getString('message');
                
                await DB.setAFK(interaction.user.id, message);
                await interaction.reply({ content: `💤 You are now AFK: ${message}` });

            } else if (subcommand === 'remove') {
                const afkData = await DB.getAFK(interaction.user.id);

                if (!afkData) {
                    await interaction.reply({ content: 'You are not AFK!', flags: 1 << 6 });
                    return;
                }

                await DB.removeAFK(interaction.user.id);
                await interaction.reply({ content: '✅ AFK status removed!' });
            }

        } catch (error) {
            console.error('AFK error:', error);
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
