import * as Sphinx from "sphinx-bot";

function errorEmbed(message, msg: string) {
  const e = new Sphinx.MessageEmbed()
    .setAuthor("BettingBot")
    .setTitle("Error: ")
    .setDescription(msg);
  message.channel.send({ embed: e });
}

export default errorEmbed;
