import { AddonManifests } from "./AddonManifest";

declare global {
    interface Document {
        saAddonManifests?: Promise<AddonManifests>;
    }
}

export { };
