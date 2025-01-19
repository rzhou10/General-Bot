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
  } else if (command === "weather") {
    const weather = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${config.WEATHER_API_KEY}q=${config.WEATHER_LOCATION}&aqi=no`);

    channel.send(`It is currently ${weather.data.current.temp_f} in ${config.WEATHER_LOCATION}`);
  } else if (command === "metalarchives") {
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
  } else if (command === "youtube") {
    const videos = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCjYac0sM1ciPFIKNmW4pF1Q&maxResults=10&order=date&type=video&key=${config.YOUTUBE_KEY}`);

    if (videos.data.items.length > 0) {
      const vids = videos.data.items.slice(2);
      channel.send(`Heavy Metallurgy recent videos: [${vids[0].snippet.title}](https://www.youtube.com/watch?v=VGzkVWX5Ufs${vids[0].id.videoId}) and [${vids[1].snippet.title}](https://www.youtube.com/watch?v=VGzkVWX5Ufs${vids[1].id.videoId})`);
    } else {
      channel.send(`No new videos from Heavy Metallurgy!`);
    }
  }
}
);

console.log("General bot finished loading!")
