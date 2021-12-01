
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const os = require("os")

const hostname = os.hostname()
const platform = os.platform()
const headerversion = os.version()
const cpus = os.cpus()
const cputotal = os.cpus().length
const model = cpus[0].model

let uptime = new Date(os.uptime * 1000).toISOString().substr(11, 8)
let freemem = `${os.freemem()} Bytes`
let totalmem = `${os.totalmem()} Bytes`
let memoryinfo = `${freemem} / ${totalmem}`

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Show detailed Mocci Bot Info'),

	async execute(interaction) {
		const time = Date.now() - interaction.createdTimestamp
		const sysinfo = `**Hostname:** ${hostname}\n**Platform:** ${platform}\n**Header:** ${headerversion}\n**Cpu:** ${model} x${cputotal}\n**Memory:** ${memoryinfo} \n**Uptime:** ${uptime}\n\nDelay Interact: ${time} ms\n Source code: [here](https://github.com/Khuirul-Huda/Mocci)`

		const about = new MessageEmbed()
			.setColor('#31ff08')
			.setTitle('About')
			.setDescription('Ini adalah sebuah random text yang digunakan untuk mengisi deskripsi hehe hehe hehe abc cdej ')
			.setImage('https://i.postimg.cc/XvQVPfGP/free-anime-image.jpg')
			.setFooter('Support us /support')
			.addFields(
				{ name: 'System Info', value: sysinfo }
			)

		interaction.reply({ embeds: [about] })
	}
};