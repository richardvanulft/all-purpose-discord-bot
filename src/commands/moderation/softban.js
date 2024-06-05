const { softbanTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "softban",
  description: "softban the specified member. Kicks and deletes messages",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
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
        name: "duration",
        description: "duration of the ban in minutes",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: "reason",
        description: "reason for softban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await softban(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const moderatorRoleID = process.env.MODERATOR_ROLE_ID;

    if (!interaction.member.roles.cache.has(moderatorRoleID)) {
      return interaction.reply('You do not have permission to use this command.');
    }
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await softban(interaction.member, target, reason, duration);
    await interaction.followUp(response);
  },
};

async function softban(issuer, target, reason, duration) {
  // Calculate the end of the ban
  const banEnd = new Date();
  banEnd.setMinutes(banEnd.getMinutes() + duration);

  // Format the end of the ban as a Discord timestamp
  const banEndTimestamp = `<t:${Math.floor(banEnd.getTime() / 1000)}:F>`;

  // Send DM to the user
  await target.user.send(`**Hey ${target.user.username}, \n${issuer.user.username} has softbanned you from ${issuer.guild.name} for ${duration} minutes! \nYour ban will end at ${banEndTimestamp}. \nTry to behave in the future to avoid this.**`);

  const response = await softbanTarget(issuer, target, reason, duration);
  if (typeof response === "boolean") {
    return `${target.user.username} is soft-banned for ${duration} minutes!`;
  }
  if (response === "BOT_PERM") return `I do not have permission to softban ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to softban ${target.user.username}`;
  else return `Failed to softban ${target.user.username}`;
}