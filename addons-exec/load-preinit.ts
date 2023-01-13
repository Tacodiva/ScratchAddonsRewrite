import { AddonManifest, AddonManifests } from "../share/AddonManifest";

declare global {
    function registerAddon(arg: AddonManifest): void;
}

let addonPromiseResolver: ((result: AddonManifests) => void) = null!;
document.saAddonManifests =  new Promise<AddonManifests>(resolver => addonPromiseResolver = resolver);
document.dispatchEvent(new CustomEvent("sa-addon-manifests"));

let addons: AddonManifest[] = [];
export { addons };

let isRegistrationFinished = false;

export function finishRegistration() {
    isRegistrationFinished = true;
    addonPromiseResolver(addons);
}

globalThis.registerAddon = function (arg: AddonManifest) {
    if (isRegistrationFinished)
        throw new Error("registerAddon() called too late! Addon registration has already finished.");
    addons.push(arg);
}
