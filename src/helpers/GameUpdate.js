const axios = require("axios");
const cheerio = require("cheerio");

async function checkForUpdates() {
  const url = "https://store.steampowered.com/news/app/2479810"; // Vervang <app_id> met de id van Grayzone Warfare

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Zoek naar een element dat de update-informatie bevat
    // Dit hangt af van de structuur van de Steam-pagina, dus je moet dit mogelijk aanpassen
    const updateElement = $(".apphub_AppName");

    if (updateElement.length > 0) {
      const updateText = updateElement.text();

      // Controleer of de update-informatie is veranderd sinds de laatste keer dat je hebt gecontroleerd
      // Je moet een manier implementeren om de laatste update-informatie op te slaan en te vergelijken
      if (updateText !== lastUpdateText) {
        // Stuur een bericht naar de Discord-server
        const channel = client.channels.cache.get('1237398907525529631); // Vervang <channel_id> met de id van het kanaal waar je het bericht wilt sturen
        if (channel) {
          channel.send(`Er is een nieuwe update voor Grayzone Warfare: ${updateText}`);
        }

        // Update de laatste update-informatie
        lastUpdateText = updateText;
      }
    }
  } catch (error) {
    console.error(`Er is een fout opgetreden bij het controleren op updates: ${error}`);
  }
}

// Roep de functie periodiek aan
setInterval(checkForUpdates, 60000); // Controleert elke minuut