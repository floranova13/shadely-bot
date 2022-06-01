const { MessageActionRow, MessageButton } = require('discord.js');

const pongCommand = async (interaction) => {
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('primary')
      .setLabel('Pong')
      .setStyle('PRIMARY')
  );

  await interaction.reply({ components: [row] });
};

module.exports = { pongCommand };
