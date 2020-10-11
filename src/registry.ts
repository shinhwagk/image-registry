interface   Registry interface {
	// Scope describes the names that can be used with this Namespace. The
	// global namespace will have a scope that matches all names. The scope
	// effectively provides an identity for the namespace.
	Scope() Scope

	// Repository should return a reference to the named repository. The
	// registry may or may not have the repository but should always return a
	// reference.
	Repository(ctx context.Context, name reference.Named) :Repository

	// Repositories fills 'repos' with a lexicographically sorted catalog of repositories
	// up to the size of 'repos' and returns the value 'n' for the number of entries
	// which were filled.  'last' contains an offset in the catalog, and 'err' will be
	// set to io.EOF if there are no more entries to obtain.
	Repositories(ctx context.Context, repos []string, last string) (n int, err error)

	// Blobs returns a blob enumerator to access all blobs
	Blobs() BlobEnumerator

	// BlobStatter returns a BlobStatter to control
	BlobStatter() BlobStatter
}