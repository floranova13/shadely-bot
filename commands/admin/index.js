/* eslint-disable quotes */
const initializeCommand = async (interaction, client, servers) => {
  const validRoles = {
    'Personal Server': ['DM'],
  };

  try {
    const Guild = await client.guilds.cache.get(interaction.guild.id);
    const roles = validRoles.hasOwnKey(interaction.guild.name)
      ? [...validRoles[interaction.guild.name]]
      : [];
    let message;

    if (!servers[Guild.id]) {
      servers[Guild.id] = { queue: [], current: '', roles };
      message = 'Initialized bot!';
    } else {
      message =
        "Bot already initialized! Are you trying to erase me?! I'll remember that.";
    }

    await interaction.reply(message);
  } catch (error) {
    console.error('ERROR OCCURED IN queueCommand!');
  }
};

module.exports = { initializeCommand };
