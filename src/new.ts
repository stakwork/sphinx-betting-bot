import errorEmbed from "./error";
import * as redis from "./redis";
import * as Sphinx from "sphinx-bot";

// const types = ["price"];

export default async function newBot(message: Sphinx.Msg) {
  console.log(JSON.stringify(message, null, 2));
  const arr = message.content.trim().split(" ");

  const tribe = message.channel.id;
  const pubkey = message.member.id;
  const nickname = message.member.nickname;

  if (arr.length !== 2) {
    return errorEmbed(message, "Wrong number of arguments");
  }

  const name = nickname || "anon";
  const NAME = "_" + tribe + "_" + pubkey;

  const existingNew = await redis.get(NAME);
  if (existingNew) {
    return errorEmbed(message, "You've already started a bot...");
  }

  await redis.set(NAME, {
    name,
    ts: ts(),
  });
  message.reply("What type of bet? [price]");
}

// function more(message) {
//   const arr = message.content.trim().split(" ");
//   const type = arr[2];
//   if (!types.includes(type)) {
//     return errorEmbed(message, "Invalid type");
//   }
//   const hours_s = arr[3];
//   const hours = parseInt(hours_s);
//   if (!hours || hours < 1 || hours > 100) {
//     return errorEmbed(message, "Invalid timeout");
//   }

//   const name = nickname || "anon";

//   const NAME = tribe + "_" + name;
//   const existing = await redis.get(NAME);
//   if (existing) {
//     return errorEmbed(message, 'Bet already exists with name "' + name + '"');
//   }
//   const bet = {
//     name,
//     type,
//     tribe,
//     pubkey,
//     timestamp: ts(),
//     end: ts() + hours * 60 * 60,
//   };
//   await redis.set(NAME, bet);

//   const embed = new Sphinx.MessageEmbed()
//     .setAuthor("BettingBot")
//     .setTitle("Created a new bet:")
//     .addFields([
//       { name: "Type:", value: type, inline: true },
//       { name: "Name", value: name, inline: true },
//       { name: "Timeout", value: hours + " hours", inline: true },
//     ]);
//   message.channel.send({ embed });
//   return;
// }

function ts() {
  return Math.floor(new Date().getTime() / 1000);
}
