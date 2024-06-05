const { banTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, DiscordAPIError } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "superban",
  description: "bans the specified member",
  category: "ADMIN",
  botPermissions: ["BanMembers"],
  userPermissions: ["BanMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for ban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const match = await message.client.resolveUsers(args[0], true);
    const target = match[0];
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await ban(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const response = await ban(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').User} target
 * @param {string} reason
 */
async function ban(issuer, target, reason) {
  try {
    // Attempt to send a DM to the user
    await target.send(`Hey ${target.username}, ${issuer.user.username} has banned you from ${issuer.guild.name}! You can appeal a ban in the dm's of the owner with evidence why this ban should be lifted.`);
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code === 50007) {
      // The user has closed their DMs
      await issuer.send(`Failed to send a DM to ${target.username} because they have closed their DMs.`);
    } else {
      // Some other error occurred
      throw error;
    }
  }

  const response = await banTarget(issuer, target, reason);
  if (typeof response === "boolean") {
    return `${target.username} is banned!`;
  }
  if (response === "BOT_PERM") return `I do not have permission to ban ${target.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to ban ${target.username}`;
  else return `Failed to ban ${target.username}`;
}