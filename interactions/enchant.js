/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Enchant = require('enchantment-table');
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
		try {
			const textOpt = interaction.options.getString('text');
			const reverseOpt = interaction.options.getBoolean('reverse');
			if (!textOpt) {
				await interaction.reply({ content: 'Text is required.', flags: 1 << 6 });
				return;
			}
			const translatedText = Enchant.translate(textOpt, reverseOpt);
			const embed = new EmbedBuilder()
				.setTitle('Result')
				.setDescription(translatedText || 'We need something to reply')
				.setColor('Green');
			await interaction.reply({
				content: "Here's translated text. Please note that currently we can't include number for translations",
				embeds: [embed]
			});
		} catch (error) {
			await interaction.reply({ content: 'Error translating text.', flags: 1 << 6 });
		}
	}
};