const { SlashCommandBuilder } = require('@discordjs/builders')
const engine = require('puppeteer')
let msg = "Ini kak"
const args_n = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--single-process',
  '--disable-gpu',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
]
const denyFrom = [
    'https://pagead2.googlesyndication.com',
    'https://creativecdn.com',
    'https://www.googletagmanager.com',
    'https://cdn.krxd.net',
    'https://adservice.google.com',
    'https://cdn.concert.io',
    'https://z.moatads.com',
    'https://cdn.permutive.com']
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
        const browser = await engine.launch({headless: true, args: args_n, userDataDir: './puppeteer/temp'})
        //const context = browser.createIncognitoBrowserContext()
        const render = (await browser).newPage()
await (await render).setRequestInterception(true);

(await render).on('request', (request) => {
    const url = request.url();
    if (denyFrom.some((d) => url.startsWith(d))) {
      request.abort();
    } else {
      request.continue();
    }
  });
        await (await render).goto(url).catch(err => msg = "Ini Kak")
        const pic = await (await render).screenshot()
       const y = (await browser).close()
         await interaction.editReply({content: msg,  files: [pic], ephemeral: false})
	
}  
}
