const { SlashCommandBuilder } = require('@discordjs/builders')
const engine = require('puppeteer')
let msg = "Ini kak"
module.exports = {
    data: new SlashCommandBuilder()
            .setName('screenshot')
            .setDescription('Take a picture of website')
            .addStringOption(link => link.setName('url')
                    .setDescription('URL to screenshot')
                    .setRequired(true)
            ),

     async execute(interaction){
        const url = interaction.options.data.find(arg => arg.name === 'url').value
        interaction.reply({content: 'Bentar lagi masak', ephemeral: false})
        const browser = await engine.launch()
        const context = browser.createIncognitoBrowserContext()
        const render = (await context).newPage()
        await (await render).goto(url).catch(err => msg = "Ini Kak")
        const pic = await (await render).screenshot()
       const y = (await browser).close()
         await interaction.editReply({content: msg,  files: [pic], ephemeral: false})
	
}  
}
