export enum Type {
  PRICE = "price",
  BLOCKHASH = "blockhash",
}

export interface Bet {
  channel: string;
  type: Type;
  hours: number;
  ts: number;
  price: string;
  placements: Placement[];
}

export interface Placement {
  type: Type;
  id: string;
  name: string;
  amount: number;
  param: string;
}
