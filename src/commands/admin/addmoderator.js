const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "addmoderator",
  description: "Adds a user as a moderator",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the user to be added as a moderator",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);
    const moderatorRoleID = process.env.MODERATOR_ROLE_ID;

    if (!member) {
      return interaction.reply({ content: "User not found in this server.", ephemeral: true });
    }

    await member.roles.add(moderatorRoleID);

    const welcomeMessage = `Hey there! \n<:NLGZWLOGO:1237136875995795548>welcome to the moderator team of **${guild.name}**!<:NLGZWLOGO:1237136875995795548> \nDon't forget to check the **rules** in <#1247469943923146823>, we operate on a **zero tolerance policy**, so if you abuse your rank, it will be immediately removed. \nIt's already in the rules, but I want to add that **banning/kicking people is the last resort** and it cannot be done without the permission of <@334034252012322816>. \nSo, read the rules and enjoy your new role! 😀`;

    user.send(welcomeMessage)

    return interaction.followUp({ content: `${user.tag} has been added as a moderator.`, ephemeral: true });
  }
};