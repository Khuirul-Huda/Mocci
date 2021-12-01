/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enchant')
		.setDescription('Translates any text to enchanting table language'),
        //.addStringOption(new SlashCommandStringOption()),
	async execute(interaction) {
		interaction.reply({ content: 'Tunggu.... Kamu cantik deh', ephemeral: true })
	}
};