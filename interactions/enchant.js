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
		),
	async execute(interaction) {
		let untranslatedText = interaction.options.data.find(arg => arg.name === 'text').value
		let translatedText = Enchant.translate(untranslatedText)
		
		if (translatedText === "" ) {
			let translatedText = "We need something to reply"
			let hide = true
		}
		
		const embed = new MessageEmbed()
			.setTitle('Result')
			.setDescription(translatedText)
			.setColor('GREEN')
			.setFooter('2022 Mocci Bot')

		interaction.reply({ content: "Here's translated text. Please note that currently we can't include number for translations", ephemeral: hide , embed: embed})
	}
};