const { MessageActionRow, MessageButton } = require('discord.js');

const serverCommand = async (interaction) => {
  const guild = interaction.guild;
  const serverName = guild.name;
  const description = guild.description || '';
  const memberCount = guild.memberCount;
  const message = `${guild.iconURL()}\n${serverName}: ${description}\nTotal members: ${memberCount}\n`;

  await interaction.reply(message);
};

const userCommand = async (interaction, client) => {
  const user = interaction.user;
  const message = `Your tag: \`${user.tag}\`\nYour id: \`${user.id}\``;
  const channel = await client.channels.cache.get(interaction.channelId);
  await channel.send(user.displayAvatarURL());
  await interaction.reply(message);
};

const pongCommand = async (interaction) => {
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('primary')
      .setLabel('Pong')
      .setStyle('PRIMARY')
  );

  await interaction.reply({ components: [row] });
};

module.exports = { serverCommand, userCommand, pongCommand };
