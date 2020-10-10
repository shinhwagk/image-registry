// console.log(1);
// import { decode } from "https://deno.land/std@0.74.0/node/querystring.ts";
// console.log(1);
// console.log(decode("abc=xxx&xxx=222"));
// console.log(1);

// let searchParams = new URLSearchParams("https://aaa.com?abc=xxx&xxx=222");

// for (const [key, value] of searchParams.entries()) {
//   console.log(key, value);
// }

import {
  listenAndServe,
  serve,
  ServerRequest,
} from "https://deno.land/std@0.74.0/http/server.ts";

import { AppContext } from "./router.ts";
const s = serve({ port: 8000 });
console.log("http://localhost:8000/");
for await (const req of s) {
  req.url;
  req.respond({ body: "Hello World\n" });
}

const x = /aaa/;
console.log(x instanceof RegExp);

function listenAndServeHandler(req: ServerRequest) {
  req.url.startsWith("proxy");
  const ctx: AppContext = {};
}

listenAndServe("0.0.0.0", listenAndServeHandler);
