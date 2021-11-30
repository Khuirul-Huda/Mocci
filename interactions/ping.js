const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const os = require("os")

//System properties
const hostname = os.hostname()
const platform = os.platform()
const ver = os.version()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong'),


		
	async execute(interaction) {
		const time = Date.now() - interaction.createdTimestamp
		const about = new MessageEmbed()
						.setColor('#31ff08')
						.setTitle('About Mocci Bot')
						.setDescription('AFAIK Mocci Bot is under development:)')
						.setImage('https://i.postimg.cc/XvQVPfGP/free-anime-image.jpg')
						
						.addFields(
							{name: 'Hostname', value: 'Current: '+hostname},
							{name: 'Platform', value: 'Current:'+platform.toString},
							{name: 'Version', value: 'Current:'+ver},
							{name: 'Current Processing Time', value: 'Current:'+time.toString}
						);


		interaction.reply({ content: [about] })
	}
};