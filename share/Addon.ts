import { AddonManifest } from "./AddonManifest";
import { AddonSetting } from "./AddonSetting";
import { AddonStorage } from "../background/Storage";

export class Addon {

    public readonly id: string;
    public readonly manifest: AddonManifest;

    private _enabled;
    public get enabled() { return this._enabled; }

    public readonly settings: { readonly [key: string]: AddonSetting | undefined };

    public constructor(manifest: AddonManifest, storedSettings: AddonStorage) {
        this.id = manifest.id;
        this.manifest = manifest;
        this._enabled = storedSettings.enabled;

        const settings: { [key: string]: AddonSetting } = Object.create(null);
        if (manifest.settings) {
            for (const settingManifest of manifest.settings) {
                const setting = AddonSetting.create(settingManifest);
                settings[setting.name] = setting;
            }
        }
        this.settings = settings;

    }
}