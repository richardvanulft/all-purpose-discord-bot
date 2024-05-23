const { getJson } = require("@helpers/HttpUtils");
const { success, warn, error } = require("@helpers/Logger");

module.exports = class BotUtils {
  function;

  /**
   * Check if the bot is up to date
   */
  static async checkForUpdates() {
    const response = await getJson("https://api.github.com/repos/richardvanulft/discord-bot/releases/latest");
    if (!response.success) {
      error("VersionCheck: Failed to check for bot updates", response.message);
      return false;
    }
    if (response.data) {
      const latestVersion = response.data.tag_name;
      const currentVersion = require("@root/package.json").version;

      const latestVersionParts = latestVersion.split(".").map(Number);
      const currentVersionParts = currentVersion.split(".").map(Number);

      for (let i = 0; i < latestVersionParts.length; i++) {
        if (currentVersionParts[i] > latestVersionParts[i]) {
          break;
        } else if (currentVersionParts[i] < latestVersionParts[i]) {
          warn(`VersionCheck: ${latestVersion} update is available`);
          warn("download: https://github.com/richardvanulft/discord-bot/releases/latest");
          return true;
        }
      }

      success(`VersionCheck: Your discord bot is up to date. Current version is ${latestVersion}`);
    }
    return false;
  }

  pullLatestUpdate(client) {
    exec(`git pull ${process.env.REPO_URL}`, (error, stdout, stderr) => {
      if (error) {
        client.logger.error(`Error pulling updates: ${error.message}`);
        return;
      }
      if (stderr) {
        client.logger.error(`Error pulling updates: ${stderr}`);
        return;
      }
      client.logger.log(`Pulled updates: ${stdout}`);
    });
  }

  /**
   * Get the image url from the message
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  static async getImageFromMessage(message, args) {
    let url;

    // check for attachments
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const attachUrl = attachment.url;
      const attachIsImage = attachUrl.endsWith(".png") || attachUrl.endsWith(".jpg") || attachUrl.endsWith(".jpeg");
      if (attachIsImage) url = attachUrl;
    }

    if (!url && args.length === 0) url = message.author.displayAvatarURL({ size: 256, extension: "png" });

    if (!url && args.length !== 0) {
      try {
        url = new URL(args[0]).href;
      } catch (ex) {
        /* Ignore */
      }
    }

    if (!url && message.mentions.users.size > 0) {
      url = message.mentions.users.first().displayAvatarURL({ size: 256, extension: "png" });
    }

    if (!url) {
      const member = await message.guild.resolveMember(args[0]);
      if (member) url = member.user.displayAvatarURL({ size: 256, extension: "png" });
    }

    if (!url) url = message.author.displayAvatarURL({ size: 256, extension: "png" });

    return url;
  }

  static get musicValidations() {
    return [
      {
        callback: ({ client, guildId }) => client.musicManager.getPlayer(guildId),
        message: "🚫 No music is being played!",
      },
      {
        callback: ({ member }) => member.voice?.channelId,
        message: "🚫 You need to join my voice channel.",
      },
      {
        callback: ({ member, client, guildId }) =>
          member.voice?.channelId === client.musicManager.getPlayer(guildId)?.channelId,
        message: "🚫 You're not in the same voice channel.",
      },
    ];
  }
};
