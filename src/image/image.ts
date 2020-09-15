import * as path from 'path'



function checkmManifestExist(repo: string, name: string, reference: string): boolean {
    if (reference.startsWith('sha256:')) {
        path.join(storageDir, repo, name, 'manifests', reference)
    }
}

class Image {
    manifests: string
    blobs: string
    constructor(private readonly repo: string, private readonly name: string) {
        this.manifests = path.join(storageDir, repo, name, 'manifests')
        this.manifests = path.join(storageDir, repo, name, 'blobs')
    }

    isExist(reference: string) {

    }
}