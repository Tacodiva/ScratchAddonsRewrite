import { AddonManifest } from "../AddonManifest";

declare global {
    function registerAddon(arg: AddonManifest): void;
}

let addons: AddonManifest[] = [];
export { addons };

let isRegistrationFinished = false;

export function finishRegistration() {
    isRegistrationFinished = true;
}

globalThis.registerAddon = function(arg : AddonManifest) {
    if (isRegistrationFinished)
    throw new Error("registerAddon() called too late! Addon registration has already finished.");
    addons.push(arg);
}
