/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Enchant = require("enchantment-table")
let hide = false
module.exports = {
	data: new SlashCommandBuilder()
		.setName('enchant')
		.setDescription('Translates any text (not number) to enchanting table language')
		.addStringOption(option => option.setName("text")
			.setRequired(true)
			.setDescription("Text to translate")
		)
		.addBooleanOption(bool => bool.setName("reverse")
			.setRequired(true)
			.setDescription("Whether or not to translate to galactic or regular character")

		),
	async execute(interaction) {

		let isReverse = false
			isReverse = interaction.options.data.find(dibalik => dibalik.name === 'reverse').value
		const untranslatedText = interaction.options.data.find(arg => arg.name === 'text').value
		let translatedText = Enchant.translate(untranslatedText, isReverse)

		if (translatedText === "") {
			let translatedText = "We need something to reply"
			let hide = true
		}

		const embed = new MessageEmbed()
			.setTitle('Result')
			.setDescription(translatedText)
			.setColor('GREEN')

		interaction.reply({ content: "Here's translated text. Please note that currently we can't include number for translations", ephemeral: hide, embeds: [embed] })
	}
};