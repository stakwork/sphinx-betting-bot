export enum Type {
  PRICE = "price",
  BLOCKHASH = "blockhash",
}

export interface Bet {
  channel: string;
  type: Type;
  sats: number;
  hours: number;
  ts: number;
  price: string;
  placements: Placement[];
  name: string;
}

export interface Placement {
  type: Type;
  msg_id: string;
  id: string; // user id
  name: string; // user name
  amount: number;
  param: string;
}
