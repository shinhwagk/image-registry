const gen = (code: string, message: string) => {
    return { errors: [{ code, detail: {}, message }] }
}

export const MANIFEST_UNKNOWN = gen('MANIFEST_UNKNOWN', 'manifest unknown')

export const BLOB_UNKNOWN = gen('BLOB_UNKNOWN', 'blob unknown to registry')

export const TOOMANYREQUESTS = gen('TOOMANYREQUESTS', 'too many requests')

export const ManifestMediaTypes = [
    'vnd.docker.distribution.manifest.list.v2+json'
    , 'vnd.docker.distribution.manifest.v2+json'
    , 'vnd.docker.distribution.manifest.v1+prettyjws'
    , 'vnd.docker.distribution.manifest.v1+json'
]