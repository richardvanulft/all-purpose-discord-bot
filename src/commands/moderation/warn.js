const { warnTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");
const { listWarnings } = require("./warnings");
const Warning = require("@schemas/warn");
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warn",
  description: "warns the specified member",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
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
        description: "reason for warn",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "image",
        description: "image link",
        type: ApplicationCommandOptionType.String,
        required: false,
      }
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const imageLink = message.attachments.first() ? message.attachments.first().url : null;
    const response = await warn(message.member, target, reason, imageLink);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const moderatorRoleID = process.env.MODERATOR_ROLE_ID;

    if (!interaction.member.roles.cache.has(moderatorRoleID)) {
      return interaction.reply('You do not have permission to use this command.');
    }
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || 'No reason provided'; // provide a default value
    const imageLink = interaction.options.getString("image") || 'No image provided'; // provide a default value
    const target = await interaction.guild.members.fetch(user.id);

    const response = await warn(interaction.member, target, reason, imageLink);
    await interaction.followUp(response);
  },
};

async function warn(issuer, target, reason, imageLink) {
  const expireDate = new Date(Date.now() + 31536000000); // 31536000000 ms is 1 year
  const response = await warnTarget(issuer, target, reason);
  if (typeof response === "boolean") {
    // Send DM to the user
    let dmMessage = `**Hey <@${target.user.id}>, \n<@${issuer.user.id}> has warned you in ${issuer.guild.name}. \nReason:** \n\`\`\`${reason}\`\`\` \n**Your warn will expire on <t:${Math.floor(expireDate.getTime() / 1000)}:F>. \nTry to do better next time! 😠**`;
    if (imageLink) dmMessage += `\nImage: ${imageLink}`;
    await target.user.send(dmMessage);

    // Save the warning in the database
    const warning = new Warning({
      userId: target.id,
      guildId: issuer.guild.id,
      issuerId: issuer.id,
      reason: reason,
      imageLink: imageLink,
    });
    await warning.save();

    return `${target.user.username} is warned!`;
  }
  if (response === "BOT_PERM") return `I do not have permission to warn ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to warn ${target.user.username}`;
  else return `Failed to warn ${target.user.username}`;
}