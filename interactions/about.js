const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const os = require("os")
//const { MocciLogging } = require('../utils/moccilogger')

const hostname = os.hostname()
const platform = os.platform()
const headerversion = os.version()
const cpus = os.cpus()
const cputotal = os.cpus().length
const model = cpus[0].model

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Show detailed Mocci Bot Info'),

	async execute(interaction) {
		//uptime os
		let totalSeconds = os.uptime();
		let days = Math.floor(totalSeconds / 86400)
		totalSeconds %= 86400
		let hours = Math.floor(totalSeconds / 3600)
		totalSeconds %= 3600
		let minutes = Math.floor(totalSeconds / 60)
		let seconds = Math.floor(totalSeconds % 60)

		const uptime = `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`
		const freemem = `${os.freemem()}`
		const totalmem = `${os.totalmem()} Bytes`
		const memoryinfo = `${freemem} / ${totalmem}`
		const time = Date.now() - interaction.createdTimestamp
		const sysinfo = `**Hostname:** ${hostname}\n**Platform:** ${platform}\n**Header:** ${headerversion}\n**CPU:** ${model} x${cputotal}\n**Memory:** ${memoryinfo} \n**System Uptime:** ${uptime}\n\nDelay Interact: ${time} ms\n Source code: [here](https://github.com/Khuirul-Huda/Mocci)`
		
		const about = new MessageEmbed()
			.setColor('#31ff08')
			.setTitle('About')
			.setDescription('Ini adalah sebuah random text yang digunakan\n untuk mengisi deskripsi hehe hehe hehe abc cdej ')
			.setImage('https://i.postimg.cc/XvQVPfGP/free-anime-image.jpg')
			.setFooter('Support us /support')
			.addFields(
				{ name: 'System Info', value: sysinfo }
			)

		interaction.reply({ embeds: [about] })
	}
};