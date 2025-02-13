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
      channel.send(`Heavy Metallurgy recent videos: [${vids[0].snippet.title}](https://www.youtube.com/watch?v=${vids[0].id.videoId}) and [${vids[1].snippet.title}](https://www.youtube.com/watch?v=${vids[1].id.videoId})`);
    } else {
      channel.send(`No new videos from Heavy Metallurgy!`);
    }
  } else if (command === "lfm") {
    channel.send(`Compiling stats...`);

    const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    let message = '';

    if (args[0] === 'stats') {
      const infoUrl = `${baseUrl}?method=user.getinfo&user=${config.LASTFM_USERNAME}&api_key=${config.LASTFM_KEY}&format=json`;

      const startDate = new Date('2022-01-01');
      const dayDifference = Math.round((Math.abs(startDate.getTime() - new Date().getTime())) / (1000 * 60 * 60 * 24));
      let errorFetch = false;

      const result = await axios.get(infoUrl);
      if (result.status === 200) {

        const userData = result.data.user
        const averageScrobblesPerDay = (userData.playcount / dayDifference).toFixed(2);
        const albumsPerArtist = (userData.album_count / userData.artist_count).toFixed(2);

        message = `Average scrobbles per day: ${averageScrobblesPerDay}\nAverage album per artist: ${albumsPerArtist}`;

        let counter = 1;

        let count1000 = 0;
        let count500 = 0;
        let count100 = 0;
        let count50 = 0;

        while (counter < 21) {
          const artistUrl = `${baseUrl}?method=user.gettopartists&user=${config.LASTFM_USERNAME}&api_key=${config.LASTFM_KEY}&format=json&page=${counter}`;
          const userArtistData = await axios.get(artistUrl);

          if (userArtistData.status === 200) {

            userArtistData.data.topartists.artist.forEach((artist) => {
              if (Number(artist.playcount) >= 1000) {
                count1000++;
              }
              if (Number(artist.playcount) >= 500) {
                count500++;
              }
              if (Number(artist.playcount) >= 100) {
                count100++;
              }
              if (Number(artist.playcount) >= 50) {
                count50++;
              }
            })
            counter++
          } else {
            errorFetch = true;
            break;
          }
        }

        if (errorFetch) {
          channel.send('An issue occurred with fetching top artists')
        }

        message += `\n\nArtist count by rank:\n\n${count1000} artists with 1000+ plays\n${count500} artists with 500+ plays\n${count100} artists with 100+ plays\n${count50} artists with 50+ plays`;
      } else {
        channel.send('An issue occurred with fetching user information')
      }

    } else {

      // To do: compare stats with other users
    }

    channel.send(message);

  }
}
);

console.log("General bot finished loading!")
