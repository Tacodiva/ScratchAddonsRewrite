import { AddonManifests } from "../../share/AddonManifest";

let promiseResolver: ((addons: AddonManifests) => void) | null = null;

export default new Promise<AddonManifests>(resolve => {
    promiseResolver = resolve;
});

export function provideAddonManifests(manifests: AddonManifests) {
    if (promiseResolver) {
        promiseResolver(manifests);
        promiseResolver = null;
    }
}

export function hasAddonManifests() {
    return promiseResolver === null;
}