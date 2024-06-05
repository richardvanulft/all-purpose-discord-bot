const { ApplicationCommandOptionType } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

module.exports = {
  name: "watchchannel",
  description: "Set the channels to monitor and output to, and the role to tag",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "monitor",
        type: ApplicationCommandOptionType.Channel,
        description: "The channel to monitor",
        required: true,
      },
      {
        name: "output",
        type: ApplicationCommandOptionType.Channel,
        description: "The channel to output to",
        required: true,
      },
      {
        name: "role",
        type: ApplicationCommandOptionType.Role,
        description: "The role to tag",
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const monitorChannel = interaction.options.getChannel("monitor");
    const outputChannel = interaction.options.getChannel("output");
    const role = interaction.options.getRole("role");

    const guildData = await getSettings(interaction.guild);
    guildData.watchingchannels.push({
      monitoredChannelId: monitorChannel.id,
      outputChannelId: outputChannel.id,
      roleId: role.id,
    });

    await guildData.save();

    await interaction.followUp(`Channels and role set!`);
  },

  async messageRun(message) {
    console.log('messageRun called');
    const guildData = await getSettings(message.guild);
    const watchChannel = guildData.watchingchannels.find(wc => wc.monitoredChannelId === message.channel.id);
    if (watchChannel) {
      const outputChannel = message.guild.channels.cache.get(watchChannel.outputChannelId);
      if (outputChannel.type === 'GUILD_TEXT') {
        outputChannel.send(`${message.content} <@&${watchChannel.roleId}>`);
      }
    }
  },
};