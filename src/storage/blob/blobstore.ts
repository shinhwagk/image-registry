import { StorageDriver } from "./driver.ts";

interface BlobStore {
  driver: StorageDriver;
  statter: BlobStat.Descriptor;
  get(ctx: any, dgst: string): Uint8Array;
  put(ctx: any, content: Uint8Array): any;
}

namespace BlobStat {
  export interface Descriptor {
    size: number;
    digest: string;
  }
}
