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

const cacheCommand = async (interaction, client) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const Member = Guild.members.cache.get(interaction.member.user.id);

  console.log('Guild', { Guild });
  console.log('Member', { Member });

  const user = interaction.user;
  const message = `Your tag: \`${user.tag}\`\nYour id: \`${user.id}\``;
  const channel = await client.channels.cache.get(interaction.channelId);
  await channel.send(user.displayAvatarURL());
  await interaction.reply(message);
};

module.exports = { serverCommand, userCommand, cacheCommand };
