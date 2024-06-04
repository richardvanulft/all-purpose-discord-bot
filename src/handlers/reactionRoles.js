const { getReactionRoles } = require("@schemas/ReactionRoles");
const { model: ReactionRoleModel } = require("@schemas/ReactionRoles");

module.exports = {
  /**
   * @param {import('discord.js').MessageReaction} reaction
   * @param {import('discord.js').User} user
   */
  async handleReactionAdd(reaction, user) {
    const role = await getRole(reaction);
    if (!role) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    // Fetch the ReactionRole document from the database
    const rrDocument = await ReactionRoleModel.findOne({ message_id: reaction.message.id });

    // If allow_multiple_roles is false and the member already has a role from the message, return
    if (!rrDocument.allow_multiple_roles && member.roles.cache.some(role => rrDocument.roles.map(rr => rr.role_id).includes(role.id))) {
      // Remove the user's reaction
      reaction.users.remove(user.id).catch(() => {
      });

      // Send an error message to the user
      user.send("You already have a role from this message and multiple roles are not allowed.").catch(() => {
      });

      return;
    }

    await member.roles.add(role).catch(() => {});
  },

  /**
   * @param {import('discord.js').MessageReaction} reaction
   * @param {import('discord.js').User} user
   */
  async handleReactionRemove(reaction, user) {
    const role = await getRole(reaction);
    if (!role) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    await member.roles.remove(role).catch(() => {});
  },
};

/**
 * @param {import('discord.js').MessageReaction} reaction
 */
async function getRole(reaction) {
  const { message, emoji } = reaction;
  if (!message || !message.channel) return;

  const rr = getReactionRoles(message.guildId, message.channelId, message.id);
  const emote = emoji.id ? emoji.id : emoji.toString();
  const found = rr.find((doc) => doc.emote === emote);

  const reactionRole = found ? await message.guild.roles.fetch(found.role_id) : null;
  return reactionRole;
}
