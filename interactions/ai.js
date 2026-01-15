const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Chat with an AI assistant')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Your message to the AI')
        .setRequired(true)
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString('prompt');
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      await interaction.reply({ content: 'AI API key is not configured.', flags: 1 << 6 });
      return;
    }
  await interaction.reply({ content: 'Thinking... Please wait.' });
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'xiaomi/mimo-v2-flash:free',
          messages: [
            { role: 'system', content: 'You are MocciAI, a helpful, friendly, and informative Discord bot assistant. Always respond concisely and keep your answer under 2000 characters.' },
            { role: 'user', content: prompt }
          ],
          reasoning: { enabled: false }
        })
      });
      const result = await response.json();
      const aiMsg = result.choices?.[0]?.message;
      if (!aiMsg) throw new Error('No AI response.');
      let reply = aiMsg.content;
      if (aiMsg.reasoning_details) {
        reply += `\n\n**Reasoning:**\n${aiMsg.reasoning_details}`;
      }
  await interaction.editReply({ content: reply.length > 2000 ? reply.slice(0, 1997) + '...' : reply });
  // Send the original prompt to the sender privately
//   await interaction.user.send(`Your prompt: ${prompt}`);
    } catch (error) {
  await interaction.editReply({ content: `AI error: ${error.message}` });
  await interaction.user.send(`Your prompt: ${prompt}`);
    }
  }
};
