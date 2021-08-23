import * as Sphinx from "sphinx-bot";

export type NameType = "new";

const prefixes: { [k in NameType]: string } = {
  new: "_",
};

export function makeName(t: NameType, m: Sphinx.Msg) {
  return `${prefixes[t]}_${m.channel.id}_${m.member.id}`;
}
