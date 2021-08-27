import * as Sphinx from "sphinx-bot";
import errorEmbed from "./error";
import * as redis from "./redis";
import { Bet, Placement, Type } from "./types";

// BET = the created bet
// PLACEMENT = a placed bet
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

  const n = arr[1];
  const K = makeNameCustom(n);

  const b: Bet = await redis.get(K);
  if (!b) {
    return errorEmbed(message, "bet not found");
  }

  const direction = arr[2];
  if (!(direction === "up" || direction == "down")) {
    return errorEmbed(message, "what?");
  }

  const amt = arr[3];
  const amount = parseInt(amt);
  if (!amount) return errorEmbed(message, "wrong amount of sats");

  const id = message.member.id || "0";
  const name = message.member.nickname || "anon";
  const place: Placement = {
    amount,
    name: name,
    id: id,
    param: direction,
    type: Type.PRICE,
  };

  // add the placement
  b.placements.push(place);
  await redis.set(K, b);

  message.reply(`${name} placed a bet for ${amount} sats!`);
}
