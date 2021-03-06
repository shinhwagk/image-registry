/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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

export interface ManifestSchemaV1Signed extends ManifestSchema {
    schemaVersion: 1
    signatures: any[]
}

export interface ManifestSchemaV2 extends ManifestSchema {
    schemaVersion: 2
    mediaType: 'application/vnd.docker.distribution.manifest.v2+json'
}

export interface ManifestSchemaV2List extends ManifestSchema {
    schemaVersion: 2
    mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json'
}

export function isManifestSchemaV1Signed(ms: any): ms is ManifestSchemaV1Signed {
    return ms.schemaVersion === 1 && typeof ms.signatures === 'object'
}

export function isManifestSchemaV1(ms: any): ms is ManifestSchemaV1Signed {
    return ms.schemaVersion === 1 && ms.signatures === undefined
}

export function isManifestSchemaV2(ms: any): ms is ManifestSchemaV1Signed {
    return ms.schemaVersion === 2 && ms.mediaType === 'application/vnd.docker.distribution.manifest.v2+json'
}

export function isManifestSchemaV2List(ms: any): ms is ManifestSchemaV1Signed {
    return ms.schemaVersion === 2 && ms.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json'
}

export interface IDistribution {
    validateManifest(ref: string): Promise<boolean>;
    validateBlob(digest: string): Promise<boolean>;
    statBlob(digest: string): { size: number };
    readerBlob(digest: string): ReadStream;
    saveManifest(ref: string, type: string, digest: string, manifest: ManifestSchema): void;
    saveRawManifest(ref: string, type: string, digest: string, raw: string): void;
    writerBlob(digest: string, uuid: string): Promise<void>
    findManifest(ref: string): ManifestSchema | undefined;
    statManifest(ref: string, ms: ManifestSchema): ManifestStat;
    readerRawManfiest(digest: string): string
}

export abstract class AbsDistribution implements IDistribution {
    protected readonly daemon: string
    protected readonly name: string
    protected readonly fullName: string
    constructor(daemon: string, name: string) { this.daemon = daemon; this.name = name, this.fullName = this.daemon + '/' + this.name }
    abstract validateManifest(ref: string): Promise<boolean>
    abstract validateBlob(digest: string): Promise<boolean>
    abstract statBlob(digest: string): { size: number; }
    // abstract statManifest(ref: string): { size: number; }
    abstract readerBlob(digest: string): ReadStream
    abstract saveManifest(ref: string, type: string, digest: string, manifest: ManifestSchema): void
    abstract writerBlob(digest: string, uuid: string): Promise<void>
    abstract findManifest(ref: string): ManifestSchema | undefined
    abstract statManifest(ref: string, ms: ManifestSchema): ManifestStat
    abstract saveRawManifest(ref: string, type: string, digest: string, raw: string): void;
    abstract readerRawManfiest(digest: string): string
    protected checkRefType(ref: string): 'tag' | 'digest' {
        return ref.startsWith('sha256:') ? "digest" : "tag"
    }
}

export interface ManifestStat {
    schemaVersion: number, mediaType: ManifestMediaType, digest: string, size: number
}

export type ManifestMediaType = 'vnd.docker.distribution.manifest.list.v2+json'
    | 'vnd.docker.distribution.manifest.v2+json'
    | 'vnd.docker.distribution.manifest.v1+prettyjws'
    | 'vnd.docker.distribution.manifest.v1+json'

export interface GlobalState {
    fullName: string;
    name: string;
    ref: string; // tag or sha256
    digest: string; // blob digest
    daemon: string;
    registryClient: RegistryClient;
    storage: IDistribution;
    proxy: boolean;
    proxyPrefix: string;
    logger: any
}

export type KoaStateContext = Koa.ParameterizedContext<GlobalState>