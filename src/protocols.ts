import { isManifestSchemaV1, isManifestSchemaV1Signed, isManifestSchemaV2, isManifestSchemaV2List, ManifestMediaType, ManifestSchema } from "./types"

const gen = (code: string, message: string) => {
    return { errors: [{ code, detail: {}, message }] }
}

export const MANIFEST_UNKNOWN = gen('MANIFEST_UNKNOWN', 'manifest unknown')

export const BLOB_UNKNOWN = gen('BLOB_UNKNOWN', 'blob unknown to registry')

export const TOOMANYREQUESTS = gen('TOOMANYREQUESTS', 'too many requests')

// select manifest through this order
export const ManifestMediaTypes: ManifestMediaType[] = [
    'vnd.docker.distribution.manifest.list.v2+json'
    , 'vnd.docker.distribution.manifest.v2+json'
    , 'vnd.docker.distribution.manifest.v1+prettyjws'
    , 'vnd.docker.distribution.manifest.v1+json'
]

export function IdentifyMediaType(manifest: ManifestSchema): ManifestMediaType {
    switch (true) {
        case isManifestSchemaV2List(manifest):
            return 'vnd.docker.distribution.manifest.list.v2+json'
        case isManifestSchemaV2(manifest):
            return 'vnd.docker.distribution.manifest.v2+json'
        case isManifestSchemaV1Signed(manifest):
            return 'vnd.docker.distribution.manifest.v1+prettyjws'
        case isManifestSchemaV1(manifest):
            return 'vnd.docker.distribution.manifest.v1+json'
        default:
            throw new Error('unknow manifest schema version.')
    }
}
