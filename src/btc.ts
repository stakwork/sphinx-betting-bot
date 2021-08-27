import fetch from "node-fetch";

const url = "https://pro-api.coinmarketcap.com/v1/";
const crypto_route = "cryptocurrency/quotes/latest";

const token = process.env.TOKEN;

export async function price() {
  // const headers: HeadersInit = new Headers();
  // headers.set("X-CMC_PRO_API_KEY", token || "");
  // headers.set("Accept", "application/json");
  const headers: any = {
    "X-CMC_PRO_API_KEY": token,
    Accept: "application/json",
  };
  const r = await fetch(url + crypto_route + "?symbol=BTC&convert=USD", {
    headers,
  });
  if (!r.ok) return;
  const j = await r.json();
  const price = j.data.BTC.quote.USD.price; //.toFixed(2);
  console.log(price, typeof price);
  return price.toFixed(2);
}
