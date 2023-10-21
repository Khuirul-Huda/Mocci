const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Generate random number'),
	async execute(interaction) {
		interaction.reply({ content: 'Todo: soon, tanya huda', ephemeral: true })
	}
};
