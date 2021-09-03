import * as Sphinx from "sphinx-bot";
import newBet, { thread } from "./new";
import placeBet from "./bets";

export let client: Sphinx.Client;

const PREFIX = "bet";

let initted = false;

export function init() {
  if (initted) return;
  initted = true;

  client = new Sphinx.Client();
  client.login(process.env.SPHINX_TOKEN || "", undefined, true);

  client.on(Sphinx.MSG_TYPE.INSTALL, async (message: Sphinx.Msg) => {
    console.log("=> Received an install!");
    const embed = new Sphinx.MessageEmbed()
      .setAuthor("BettingBot")
      .setDescription("Welcome to Betting Bot!");
    message.channel.send({ embed });
  });

  client.on(Sphinx.MSG_TYPE.MESSAGE, async (message: Sphinx.Msg) => {
    console.log("=> Received a message!", JSON.stringify(message, null, 2));
    const arr = message.content.trim().split(" ");
    if (arr.length === 1) {
      return thread(message);
    }
    if (arr.length < 2) return;
    if (arr[0] !== "/" + PREFIX) return;
    const cmd = arr[1];

    const isAdmin = message.member.roles.find((role) => role.name === "Admin");
    console.log("isAdmin?", isAdmin);

    switch (cmd) {
      case "new":
        return newBet(message);

      case "help":
        const embed2 = new Sphinx.MessageEmbed()
          .setAuthor("BettingBot")
          .setTitle("BettingBot Commands:")
          .addFields([{ name: "new", value: "/bet new" }]);
        message.channel.send({ embed: embed2 });
        return;

      default:
        return placeBet(message);
    }
  });
}
