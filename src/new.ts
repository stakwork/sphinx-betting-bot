import errorEmbed from "./error";
import * as redis from "./redis";
import * as Sphinx from "sphinx-bot";

const types = ["price"];

enum Steps {
  ONE = 1,
  TWO = 2,
}

export default async function newBot(message: Sphinx.Msg) {
  // console.log(JSON.stringify(message, null, 2));
  const arr = message.content.trim().split(" ");

  if (arr.length !== 2) {
    return errorEmbed(message, "Wrong number of arguments");
  }

  // const existingNew = await redis.get(K);
  // if (existingNew) {
  //   return errorEmbed(message, "You've already started a bot...");
  // }

  const name = message.member.nickname || "anon";

  const uuid = message.reply("What type of bet? [price]");

  await redis.set(uuid, {
    step: Steps.ONE,
    member_id: message.member.id,
    name,
    ts: ts(),
  });
}

async function stepTwo(message: Sphinx.Msg) {
  const kind = message.content.trim();
  if (!types.includes(kind)) {
    return errorEmbed(message, "Not a valid bet type");
  }

  const newuuid = message.reply("How many hours do you want the bet to last?");

  await redis.set(newuuid, {
    step: Steps.TWO,
    member_id: message.member.id,
    type: kind,
    ts: ts(),
  });
}

async function stepThree(message: Sphinx.Msg, existing: any) {
  const nums = message.content.trim();
  const num = parseInt(nums);
  if (!num || (num && num > 100)) {
    return errorEmbed(message, "Invalid number");
  }

  if (!existing.type) {
    return errorEmbed(message, "Invalid bet type");
  }

  const name = message.member.nickname || "anon";

  const K = "BET_" + name;

  const already = await redis.get(K);
  if (already) {
    return errorEmbed(message, "You already have a running bet");
  }

  await redis.set(K, {
    type: existing.type,
    hours: num,
    ts: ts(),
  });

  const embed = new Sphinx.MessageEmbed()
    .setAuthor("BettingBot")
    .setDescription("Bet Created!")
    .addFields([
      { name: "name:", value: name, inline: true },
      { name: "type:", value: existing.type, inline: true },
      { name: "hours:", value: num, inline: true },
    ]);
  message.channel.send({ embed });
}

export async function thread(message: Sphinx.Msg) {
  const uuid = message.reply_id;
  if (!uuid) {
    return errorEmbed(message, "Couldn't find a bot");
  }
  const existing = await redis.get(uuid);
  if (!existing) {
    return errorEmbed(message, "Couldn't find a bot");
  }
  if (existing.member_id !== message.member.id) {
    return errorEmbed(message, "Not your bot");
  }

  if (existing.step === Steps.ONE) {
    return stepTwo(message);
  }
  if (existing.step === Steps.TWO) {
    return stepThree(message, existing);
  }
}

/*

alice: 123
bot: 456 reply_uuid: 123
alice: reply_uuid: 456

*/

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
