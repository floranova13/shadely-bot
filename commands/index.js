const serverCommand = (interaction) => {
  const guild = interaction.guild;
  const serverName = guild.name;
  const description = guild.description || '';
  const memberCount = guild.memberCount;
  return `${serverName}: ${description}\nTotal members: ${memberCount}\n`;
};

module.exports = { serverCommand };
