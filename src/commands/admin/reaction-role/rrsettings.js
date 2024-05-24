const { model: ReactionRoleModel } = require("@schemas/ReactionRoles");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rrsettings",
  description: "Wijzig de instellingen van een reaction role bericht",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<messageId> <allowMultipleRoles>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "message_id",
        description: "message id to which reaction roles must be configured",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "allow_multiple_roles",
        description: "allow users to have multiple roles from this message",
        type: ApplicationCommandOptionType.Boolean,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const messageId = args[0];
    const allowMultipleRoles = args[1].toLowerCase() === "true";

    if (!message.guild.channels.cache.get(message.channel.id).permissionsFor(message.guild.members.me).has(channelPerms)) {
      return message.reply(`You need the following permissions in this channel\n${parsePermissions(channelPerms)}`);
    }

    try {
      await ReactionRoleModel.updateOne(
        { message_id: messageId },
        { $set: { "roles.$[].allow_multiple_roles": allowMultipleRoles } },
      );
      message.reply(`Instellingen voor bericht ${messageId} zijn bijgewerkt.`);
    } catch (error) {
      console.error("Er is een fout opgetreden bij het bijwerken van de instellingen:", error);
      message.reply("Er is een fout opgetreden bij het bijwerken van de instellingen.");
    }
  },

  async interactionRun(interaction) {
    const messageId = interaction.options.getString("message_id");
    const allowMultipleRoles = interaction.options.getBoolean("allow_multiple_roles");

    if (!interaction.guild.channels.cache.get(interaction.channel.id).permissionsFor(interaction.guild.members.me).has(channelPerms)) {
      return interaction.followUp(`You need the following permissions in this channel\n${parsePermissions(channelPerms)}`);
    }

    try {
      await ReactionRoleModel.updateOne(
        { message_id: messageId },
        { $set: { "allow_multiple_roles": allowMultipleRoles } },
      );
      interaction.followUp(`Instellingen voor bericht ${messageId} zijn bijgewerkt.`);
    } catch (error) {
      console.error("Er is een fout opgetreden bij het bijwerken van de instellingen:", error);
      interaction.followUp("Er is een fout opgetreden bij het bijwerken van de instellingen.");
    }
  },
};