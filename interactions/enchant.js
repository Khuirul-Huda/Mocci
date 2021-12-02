/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const Enchant = require("enchantment-table")
let hide = false
module.exports = {
	data: new SlashCommandBuilder()
		.setName('enchant')
		.setDescription('Translates any text (not number) to enchanting table language')
		.addStringOption(option => option.setName("text")
			.setRequired(true)
			.setDescription("Text to translate")
		),
	async execute(interaction) {
		let untranslatedText = interaction.options.data.find(arg => arg.name === 'text').value
		let translatedText = Enchant.translate(untranslatedText)
		
		if (translatedText === "" ) {
			let translatedText = "We need something to reply"
			let hide = true
		}

		interaction.reply({ content: translatedText, ephemeral: hide })
	}
};