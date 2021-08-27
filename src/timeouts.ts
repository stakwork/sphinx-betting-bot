import * as redis from "./redis";
import { Bet, Type } from "./types";
import * as btc from "./btc";
import { client } from "./client";

const timeouts = {};

const mult = 5000; //60 * 60 * 1000

export function set(K: string, hours: number) {
  timeouts[K] = setTimeout(() => {
    finishBet(K);
  }, hours * mult);
}

async function finishBet(K: string) {
  const bet: Bet = await redis.get(K);
  switch (bet.type) {
    case Type.PRICE:
      const oldPrice = bet.price;
      const newPrice = await btc.price();
      const down = parseFloat(oldPrice) > parseFloat(newPrice);
      const direction = down ? "down" : "up";
      console.log("price went", direction);
      bet.placements &&
        bet.placements.forEach((p) => {
          if (p.param === direction) {
            console.log(`=> ${p.name} won!`);
            client.channels.cache.get(bet.channel).pay();
          }
        });
  }
}
