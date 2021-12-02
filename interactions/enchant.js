/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const Enchant = require("enchantment-table")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enchant')
		.setDescription('Translates any text to enchanting table language')
		.addStringOption(option => option.setName("text")
			.setRequired(true)
			.setDescription("Text to translate")
		),
	async execute(interaction) {
		let untranslatedText = interaction.options.data.find(arg => arg.name === 'text').value
		let translatedText = Enchant.translate(untranslatedText)
		interaction.reply({ content: translatedText, ephemeral: false })
	}
};