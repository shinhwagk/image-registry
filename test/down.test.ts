import * as down from '../src/down';

down.DownManager.create('https://quay.io/v2/openshift/okd-content/blobs/sha256:89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c', 'test', 'openshift/okd-content', 'blobs', '89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c').start()