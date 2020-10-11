interface Repository {
    Named() : any

	Manifests(ctx context.Context, options ...ManifestServiceOption):ManifestService

	Blobs(ctx context.Context) BlobStore

	Tags(ctx context.Context) TagService
}
