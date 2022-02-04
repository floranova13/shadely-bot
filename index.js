// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { serverCommand, userCommand } = require('./commands');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('pong');
  } else if (commandName === 'server') {
    await interaction.reply(serverCommand(interaction));
    // await interaction.followUp(serverCommand(interaction));
  } else if (commandName === 'user') {
    await userCommand;
  }
});

// Login to Discord with your client's token
client.login(process.env.token);
