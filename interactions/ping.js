const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const os = require("os")

//System properties
const hostname = os.hostname()
const platform = os.platform()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong'),

	async execute(interaction) {
		const time = Date.now() - interaction.createdTimestamp
		const about = new MessageEmbed()
			.setColor('#31ff08')
			.setTitle('About Mocci Bot')
			.setDescription('AFAIK Mocci Bot is under development')
			.setImage('https://i.postimg.cc/XvQVPfGP/free-anime-image.jpg')

			.addFields(
				{ name: 'Hostname', value: 'Current\t' + hostname },
				{ name: 'Platform', value: 'Current\t' + platform.toString },
				{ name: 'Current Processing Time', value: 'Current\t' + time.toString }
			);

		interaction.reply({ content: [about] })
	}
};