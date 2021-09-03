import * as Sphinx from "sphinx-bot";
import errorEmbed from "./error";
import * as redis from "./redis";
import { Bet, Placement, Type } from "./types";

export function makeNameCustom(thing: string) {
  return "B_" + thing;
}

export function makeName(message: Sphinx.Msg) {
  const name = message.member.nickname || "anon";
  return "B_" + name;
}

export default async function placeBet(message: Sphinx.Msg) {
  const arr = message.content.trim().split(" ");
  if (arr.length != 4) {
    return errorEmbed(message, "wrong number of arguments");
  }

  const K = makeNameCustom(arr[1]);

  const b: Bet = await redis.get(K);
  if (!b) {
    return errorEmbed(message, "bet not found");
  }

  const id = message.member.id || "0";
  console.log(`USER ID ${id} placed a bet!`);
  const existingPlacement = b.placements.find((p) => p.id === id);
  if (existingPlacement) {
    return errorEmbed(message, `You already place a bet with ${b.name}`);
  }

  const sats_string = arr[2];
  const sats = parseInt(sats_string);
  if (!sats) {
    return errorEmbed(message, "no sats?");
  }

  if (b.sats !== sats) {
    return errorEmbed(message, "wrong bet price");
  }

  let price_string = arr[3];
  if (price_string.startsWith("$")) {
    price_string = price_string.substring(1);
  }
  const price = parseFloat(price_string);
  if (!price) return errorEmbed(message, "invalid price");

  const name = message.member.nickname || "anon";
  const place: Placement = {
    amount: sats,
    name: name,
    id: id,
    msg_id: message.id,
    param: price + "",
    type: Type.PRICE,
  };

  // add the placement
  b.placements.push(place);
  await redis.set(K, b);

  message.reply(`${name} bets $${price + ""}`);
}
