import * as down from '../src/down';

// down.DownManager.create('https://quay.io/v2/openshift/okd-content/blobs/sha256:89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c', {}, 'storage', 'openshift/okd-content', 'blobs', '89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c').start()

down.DownManager.create('https://quay.io/v2/coreos/etcd/blobs/sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4', {}, 'storage', 'coreos/etcd', 'blobs', 'a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4').start()