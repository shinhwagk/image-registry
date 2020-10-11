interface ManifestService   {
	// Exists returns true if the manifest exists.
	Exists(ctx context.Context, dgst digest.Digest)bool

	// Get retrieves the manifest specified by the given digest
	Get(ctx context.Context, dgst digest.Digest, options ...ManifestServiceOption):Manifest

	// Put creates or updates the given manifest returning the manifest digest
	Put(ctx context.Context, manifest Manifest, options ...ManifestServiceOption):string

	// Delete removes the manifest specified by the given digest. Deleting
	// a manifest that doesn't exist will return ErrManifestNotFound
	Delete(ctx context.Context, dgst digest.Digest) :void
}