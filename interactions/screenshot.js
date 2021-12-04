const { SlashCommandBuilder } = require('@discordjs/builders')
const engine = require('puppeteer')

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
        
        const browser = await engine.launch()
        const context = browser.createIncognitoBrowserContext()
        const render = (await context).newPage()
        await (await render).goto(url)
        const pic = (await render).screenshot()
      
         interaction.reply({content: pic})
        
}  
}