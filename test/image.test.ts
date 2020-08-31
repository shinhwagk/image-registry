import * as image from '../src/image';



const pil = image.ProxyImageLayer.create('openshift', 'okd-content', '89eaaaf386250faa931481c7a091b8540c35739569482aaebe214e0c69999e7c')
pil.verify()