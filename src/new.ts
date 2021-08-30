import errorEmbed from "./error";
import * as redis from "./redis";
import * as Sphinx from "sphinx-bot";
import * as btc from "./btc";
import { Bet, Type } from "./types";
import * as timeouts from "./timeouts";
import { makeName } from "./bets";

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
  if (!(<any>Object).values(Type).includes(kind)) {
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

  const K = makeName(message);

  const already = await redis.get(K);
  if (already) {
    return errorEmbed(message, "You already have a running bet");
  }

  const price = await btc.price();

  const name = message.member.nickname || "anon";

  const b: Bet = {
    channel: message.channel.id,
    type: existing.type,
    hours: num,
    ts: ts(),
    price,
    placements: [],
    name,
  };
  await redis.set(K, b);
  timeouts.set(K, num);

  const embed = new Sphinx.MessageEmbed()
    .setAuthor("BettingBot")
    .setTitle("Bet Created!")
    .setDescription(
      `BTC price is currently $${price}. What will the price be in ${num} hours?`
    )
    .addFields([
      {
        name: "Bet on the price:",
        value: `/bet ${name} SATS PRICE`,
        inline: true,
      },
      {
        name: "Example:",
        value: `/bet ${name} 1337 $50000`,
        inline: true,
      },
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

function ts() {
  return Math.floor(new Date().getTime() / 1000);
}
