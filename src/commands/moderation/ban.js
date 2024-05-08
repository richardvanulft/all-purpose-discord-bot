const { banTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, MessageActionRow, MessageButton } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ban",
  description: "bans the specified member",
  category: "MODERATION",
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
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const match = await message.client.resolveUsers(args[0], true);
    const target = match[0];
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();

    // Create a message with a button to mute the user
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("mute")
          .setLabel("Mute User")
          .setStyle("DANGER"),
      );

    await message.channel.send({
      content: `Ban command has been issued for ${target.username}. A poll will be created for the moderators to vote.`,
      components: [row],
    });

    // Create a poll in the specified channel
    const pollChannel = message.client.channels.cache.get("1236968901321953296");
    if (pollChannel) {
      const pollMessage = await pollChannel.send(`@staff, ${message.member.user.username} wants to ban ${target.username} for ${reason}. Do you agree?`);
      await pollMessage.react("👍"); // Agree
      await pollMessage.react("👎"); // Disagree

      // Create a reaction collector
      const filter = (reaction, user) => ["👍", "👎"].includes(reaction.emoji.name) && !user.bot;
      const collector = pollMessage.createReactionCollector({ filter, time: 60000 }); // Collect reactions for 1 minute

      collector.on("end", async (collected) => {
        const agreed = collected.get("👍")?.count - 1; // Subtract 1 to exclude the bot's own reaction
        const disagreed = collected.get("👎")?.count - 1; // Subtract 1 to exclude the bot's own reaction

        if (agreed > disagreed) {
          // If the majority agreed, ban the user
          const response = await ban(message.member, target, reason);
          await message.channel.send(response);
        } else {
          // If the majority disagreed, do not ban the user
          await message.channel.send(`The majority disagreed with the ban. ${target.username} will not be banned.`);
        }
      });
    }
  },
};

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').User} target
 * @param {string} reason
 */
async function ban(issuer, target, reason) {
  const response = await banTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.username} is banned!`;
  if (response === "BOT_PERM") return `I do not have permission to ban ${target.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to ban ${target.username}`;
  else return `Failed to ban ${target.username}`;
}