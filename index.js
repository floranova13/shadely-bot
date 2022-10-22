/* eslint-disable no-case-declarations */
/* eslint-disable indent */
const { Client, Intents } = require('discord.js');
const { pongCommand } = require('./commands');
const { serverCommand, userCommand } = require('./commands/general');
const { playCommand } = require('./commands/music');
const { rollCommand } = require('./commands/dice');

require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
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
      case 'play':
        await playCommand(interaction, client);
        break;
      case 'roll':
        await rollCommand(interaction);
        break;
      default:
        break;
    }
  }
});

// Login to Discord with your client's token
client.login(process.env.token);
