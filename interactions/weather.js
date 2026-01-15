const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get current weather for a city')
        .addStringOption(option =>
            option.setName('city')
                .setDescription('City name')
                .setRequired(true)
        ),
    async execute(interaction) {
        const city = interaction.options.getString('city');
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            await interaction.reply({ content: 'Weather API key not set. Please set OPENWEATHER_API_KEY in your .env.', flags: 1 << 6 });
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('City not found or API error.');
            const data = await res.json();
            const embed = new EmbedBuilder()
                .setTitle(`Weather in ${data.name}`)
                .addFields(
                    { name: 'Condition', value: data.weather[0].description, inline: true },
                    { name: 'Temperature', value: `${data.main.temp}°C`, inline: true },
                    { name: 'Humidity', value: `${data.main.humidity}%`, inline: true },
                    { name: 'Wind', value: `${data.wind.speed} m/s`, inline: true }
                )
                .setColor('Random')
                .setFooter({ text: `Powered by OpenWeather` })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `Failed to fetch weather. ${error.message}`, flags: 1 << 6 });
        }
    }
};
