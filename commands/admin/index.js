/* eslint-disable quotes */
const initializeCommand = async (interaction, client, servers) => {
  const Guild = await client.guilds.cache.get(interaction.guild.id);
  const Member = await Guild.members.cache.get(interaction.member.user.id);
  const validRoles = {
    'Personal Server': ['DM'],
    'D&D': ['*'],
  };

  if (
    !Member.roles.cache.some((role) =>
      ['Server Owner', 'Admin', 'Mod', 'Server Manager'].includes(role.name)
    )
  ) {
    await interaction.reply(
      "You have no authority over me, so I don't have to listen to anything you say!"
    );
  }

  try {
    const roles = validRoles[Guild.name]
      ? [...validRoles[interaction.guild.name]]
      : [];
    let message;

    if (!servers[Guild.id]) {
      servers[Guild.id] = { queue: [], oldQueue: [], current: null, roles };
      message = 'Initialized bot!';
    } else {
      message =
        "Bot already initialized! Are you trying to erase me?! I'll remember that.";
    }

    await interaction.reply(message);
  } catch (error) {
    console.error('ERROR OCCURED IN initializeCommand!');
  }
};

module.exports = { initializeCommand };
