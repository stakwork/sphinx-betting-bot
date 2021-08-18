require("dotenv").config();
import * as Sphinx from "sphinx-bot";
import * as redis from "./redis";
import newBot from "./new";

redis.initialize();

const PREFIX = "example";

let initted = false;

function init() {
  if (initted) return;
  initted = true;

  const client = new Sphinx.Client();
  client.login(process.env.SPHINX_TOKEN || "");

  client.on(Sphinx.MSG_TYPE.INSTALL, async (message) => {
    console.log("=> Received an install!");
    const embed = new Sphinx.MessageEmbed()
      .setAuthor("BettingBot")
      .setDescription("Welcome to Betting Bot!");
    message.channel.send({ embed });
  });

  client.on(Sphinx.MSG_TYPE.MESSAGE, async (message: Sphinx.Msg) => {
    console.log("=> Received a message!");
    const arr = message.content.trim().split(" ");
    if (arr.length < 2) return;
    if (arr[0] !== "/" + PREFIX) return;
    const cmd = arr[1];

    const isAdmin = message.member.roles.find((role) => role.name === "Admin");
    console.log("isAdmin?", isAdmin);

    switch (cmd) {
      case "new":
        return newBot(message);

      default:
        const embed2 = new Sphinx.MessageEmbed()
          .setAuthor("BettingBot")
          .setTitle("BettingBot Commands:")
          .addFields([{ name: "new", value: "/bet new" }]);
        message.channel.send({ embed: embed2 });
        return;
    }
  });
}

init();
