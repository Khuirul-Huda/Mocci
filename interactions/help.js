const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows all command'),
	async execute(interaction) {
		interaction.reply({ content: 'under development' })
	}
};