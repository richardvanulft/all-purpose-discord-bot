require("dotenv").config();
require("module-alias/register");

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// Add the event handlers here
client.on("ready", () => updateChannelNameBasedOnBotStatus(client));
client.on("disconnect", () => updateChannelNameBasedOnBotStatus(client));

// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

async function updateChannelNameBasedOnBotStatus(client) {
  const channel = client.channels.cache.get("1237398907525529631");
  if (!channel) {
    console.error("Kanaal niet gevonden");
    return;
  }
  const isOnline = client.ws.status === 0;
  const newChannelName = isOnline ? "Bot is online" : "Bot is offline";
  await channel.setName(newChannelName);
}

(async () => {
  await checkForUpdates();
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    await initializeMongoose();
  }
  await client.login(process.env.BOT_TOKEN);
})();