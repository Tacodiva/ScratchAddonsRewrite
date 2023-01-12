import { Addon } from './Addon';
import { AddonManifest } from '../share/AddonManifest';
import { Storage } from './Storage';

export class ScratchAddonsBackground {

    public readonly addons: { readonly [key: string]: Addon | undefined };

    public constructor(addonManifests: AddonManifest[], storage: Storage) {
        let addons: { [key: string]: Addon } = {};

        if (!storage.addons) storage.addons = {};

        for (const addonManifest of addonManifests) {
            let addonStorage = storage.addons[addonManifest.id];
            if (!addonStorage) addonStorage = {
                id: addonManifest.id,
                enabled: addonManifest.enabledByDefault ?? false,
                settings: {}
            };
            const addon = new Addon(addonManifest, addonStorage);
            addons[addon.id] = (addon);
        }

        this.addons = addons;

        console.log("SA Background Ready.");
    }
}