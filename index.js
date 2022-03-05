/* eslint-disable no-case-declarations */
/* eslint-disable indent */
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { serverCommand, userCommand, pongCommand } = require('./commands');
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

  switch (commandName) {
    case 'ping':
      await pongCommand(interaction);
      break;
    case 'server':
      await serverCommand(interaction);
      break;
    case 'user':
      await userCommand(interaction, client);
      break;
    default:
      break;
  }
});

// Login to Discord with your client's token
client.login(process.env.token);
