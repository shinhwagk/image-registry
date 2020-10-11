export interface StorageDriver {
  Name(): string;
  GetContent(ctx: any, path: string): Uint8Array;
}
