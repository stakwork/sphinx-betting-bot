import * as redis from "./redis";
import { Bet, Type, Placement } from "./types";
import * as btc from "./btc";
import { client } from "./client";
import * as Sphinx from "sphinx-bot";

const timeouts = {};

const mult = 5000; //60 * 60 * 1000

export function set(K: string, hours: number) {
  timeouts[K] = setTimeout(() => {
    finishBet(K);
  }, hours * mult);
}

async function finishBet(K: string) {
  console.log("===>  FINISH!!!!");
  const bet: Bet = await redis.get(K);
  await redis.del(K);
  switch (bet.type) {
    case Type.PRICE:
      const newPriceString = await btc.price();
      const newPrice = parseFloat(newPriceString);
      let winner: Placement | any = {};
      let diff = Infinity;
      let totalSats = 0;
      bet.placements &&
        bet.placements.forEach((p) => {
          totalSats += p.amount;
          const price = parseFloat(p.param);
          const mydiff = Math.abs(price - newPrice);
          if (mydiff < diff) {
            winner = p;
            diff = mydiff;
          }
        });
      if (winner && winner.id) {
        console.log(`=> ${winner.name} won ${totalSats} sats!`);
        client.channels.cache.get(bet.channel).pay(<Sphinx.Msg>{
          amount: totalSats,
          reply_id: winner.msg_id,
          recipient_id: winner.id,
        });
        await sleep(500);
        client.channels.cache.get(bet.channel).send(<Sphinx.Msg>{
          content: `${winner.name} won ${totalSats} sats!`,
        });
      }
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
