export interface ITask {
    start(): Promise<void>
}

export interface ManifestSchema {
    schemaVersion: 1 | 2
    mediaType: 'application/vnd.docker.distribution.manifest.v2+json' | 'application/vnd.docker.distribution.manifest.list.v2+json'
}