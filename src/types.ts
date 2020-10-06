import { ReadStream, WriteStream } from "fs-extra";
import Koa from 'koa'

import { RegistryClient } from "./client";

export interface ITask {
    start(): Promise<void>
}

export interface ManifestSchema {
    schemaVersion: 1 | 2
}

export interface ManifestSchemaV1 extends ManifestSchema {
    schemaVersion: 1
}

export interface ManifestSchemaV2 extends ManifestSchema {
    schemaVersion: 2
    mediaType: ManifestMedia
}

export interface IDistribution {
    validateManifest(ref: string): Promise<boolean>;
    validateBlob(digest: string): Promise<boolean>;
    statBlob(digest: string): { size: number };
    readerBlob(digest: string): ReadStream;
    saveManifest(ref: string, type: string, digest: string, manifest: ManifestSchema): void;
    writerBlob(digest: string): WriteStream;
    findManifest(ref: string): ManifestSchema | undefined;
    statManifest(ms: ManifestSchema): ManifestStat
}

export abstract class AbsDistribution implements IDistribution {
    protected readonly name: string
    constructor(name: string) { this.name = name }
    abstract validateManifest(ref: string): Promise<boolean>
    abstract validateBlob(digest: string): Promise<boolean>
    abstract statBlob(digest: string): { size: number; }
    // abstract statManifest(ref: string): { size: number; }
    abstract readerBlob(digest: string): ReadStream
    abstract saveManifest(ref: string, type: string, digest: string, manifest: ManifestSchema): void
    abstract writerBlob(digest: string): WriteStream
    abstract findManifest(ref: string): ManifestSchema | undefined
    abstract statManifest(ms: ManifestSchema): ManifestStat
}

export interface ManifestStat {
    version: number, mediaType: string, digest: string, size: number
}

export type ManifestMedia = 'application/vnd.docker.distribution.manifest.list.v2+json' | 'application/vnd.docker.distribution.manifest.v2+json'

export interface GlobalState {
    name: string;
    ref: string; // tag or sha256
    digest: string; // blob dig
    proxyRepo: string;
    registryClient: RegistryClient;
    storage: IDistribution;
    proxy: boolean;
    proxyPrefix: string;
}

export type KoaStateContext = Koa.ParameterizedContext<GlobalState>