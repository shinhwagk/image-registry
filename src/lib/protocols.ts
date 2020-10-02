const gen = (code, message) => {
    return {
        errors: [{ code, detail: {}, message }]
    }
}

export const MANIFEST_UNKNOWN = gen('MANIFEST_UNKNOWN', 'manifest unknown')

export const BLOB_UNKNOWN = gen('BLOB_UNKNOWN', 'blob unknown to registry')