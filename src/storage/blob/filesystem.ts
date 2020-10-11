import { BufReader } from "https://deno.land/std@0.74.0/io/bufio.ts";

import { StorageDriver } from "./driver.ts";

class Filesystem implements StorageDriver {
  private readonly driverName = "filesystem";
  constructor(private readonly rootDirectory: string) {}
  Name(): string {
    return this.driverName;
  }
  GetContent(ctx: any, path: string): Uint8Array {
    const file = Deno.openSync("./big.src.file", { read: true });
    const content = Deno.readAllSync(file);
    file.close();
    return content;
  }
}
