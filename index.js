const config = require("./config.json");
const { Client, GatewayIntentBits, Formatters } = require("discord.js");
const axios = require("axios");

const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.login(config.BOT_TOKEN);

const prefix = "%";

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  const channel = client.channels.cache.get(message.channelId);

  if (command === "pokemon") {
    const nationalDexId = args[0];

    const pokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nationalDexId}/`);
    if (pokemon.data.name === args[1]) {
      channel.send('Congrats, you guessed correctly!');
    } else {
      channel.send(`Sorry, the correct Pokemon is ${pokemon.data.name.charAt(0).toUpperCase() + pokemon.data.name.slice(1)}`);
    }
  }

  if (command === "weather") {
    const weather = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${config.WEATHER_API_KEY}q=${config.WEATHER_LOCATION}&aqi=no`);

    channel.send(`It is currently ${weather.data.current.temp_f} in ${config.WEATHER_LOCATION}`);
  }

  if (command === "metalarchives") {
    const bandName = args[0];
    const band = (await axios.get(`https://metal-api.dev/search/bands/name/${bandName}`)).data;
    channel.send("Searching bands....");

    let message = '';
    let index = 0;

    // TODO: Refactor so that the message can be filtered and paginated
    while (message.length < 1800) {

       message += `\n${band[index].name} (${band[index].country})\n[Metal Archives](${band[index].link})`;
       index++;
    }

    channel.send(message);
  }

});

console.log("General bot finished loading!")
