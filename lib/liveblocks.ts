import { Liveblocks } from "@liveblocks/node";

// it is used multiple time isiliye 
export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET as string,
});