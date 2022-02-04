const serverCommand = (interaction) => {
  const guild = interaction.guild;
  const serverName = guild.name;
  const description = guild.description || '';
  const memberCount = guild.memberCount;
  return (
    `${guild.iconURL()}\n${serverName}: ${description}\nTotal members: ${memberCount}\n`
  );
};

const userCommand = async (interaction) => {
  const user = interaction.user;
  const message = `Your tag: ${user.tag}\nYour id: ${user.id}`;

  await interaction.reply(message);
};

module.exports = { serverCommand, userCommand };
