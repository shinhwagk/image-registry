import { ServerRequest } from "https://deno.land/std/http/server.ts";

export enum QueryType {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  HEAD = "HEAD",
  PATCH = "PATCH",
}

const x: AppRouter[] = [];

async function reqBlob(ctx: AppContext, req: ServerRequest) {
}

x.push({ Method: QueryType.GET, Path: /abc/, Hanlder: reqBlob });

// for (const { QT, path, h } of x) {
//   console.log(QT, path, h);
// }

interface AppRouter {
  Method: QueryType;
  Path: string | RegExp;
  Hanlder: (ctx: AppContext, req: ServerRequest) => void;
}

const routers = x;

interface App {
  routers: AppRouter[];
  context: AppContext;
}

export interface AppContext {
  isProxy: boolean;
  domain: string;
  name: string;
  reference: string;
}

function reqBlobHanlder(ctx: AppContext, req: ServerRequest) {
}
