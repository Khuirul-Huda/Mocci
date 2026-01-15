const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Generate random number'),
	async execute(interaction) {
		try {
			await interaction.reply({ content: 'Todo: soon, tanya huda' });
		} catch (error) {
			await interaction.reply({ content: 'Error generating random number.', flags: 1 << 6 });
		}
	}
};
