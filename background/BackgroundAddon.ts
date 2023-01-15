import { AddonManifest } from "../share/AddonManifest";
import { BackgroundAddonSetting } from "./BackgroundAddonSetting";
import { AddonStorage } from "./Storage";

export class BackgroundAddon {
    public readonly id: string;

    public readonly enabled: BackgroundAddonSetting;
    public readonly settings: { readonly [key: string]: BackgroundAddonSetting | undefined };

    public constructor(manifest: AddonManifest, storage: AddonStorage | undefined) {
        this.id = manifest.id;

        this.enabled = new BackgroundAddonSetting({
            id: "enabled",
            name: "Enabled",
            default: manifest.enabledByDefault ?? false,
            type: "boolean"
        }, storage?.enabled);

        let settings: { [key: string]: BackgroundAddonSetting } = Object.create(null);
        if (manifest.settings)
            for (const settingManifest of manifest.settings) {
                settings[settingManifest.id] = new BackgroundAddonSetting(settingManifest, storage?.settings[settingManifest.id]);
            }

        this.settings = settings;
    }
}