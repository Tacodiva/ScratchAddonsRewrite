import { AddonManifest } from "../share/AddonManifest";
import { ContentAddonSetting, ContentAddonSettingBoolean } from "./ContentAddonSetting";

export class ContentAddon {
    public readonly id: string;

    public readonly manifest: AddonManifest;

    public readonly enabled: ContentAddonSettingBoolean;
    public readonly settings: { readonly [key: string]: ContentAddonSetting | undefined };

    public constructor(manifest: AddonManifest) {
        this.manifest = manifest;
        this.id = manifest.id;

        this.enabled = new ContentAddonSettingBoolean(this, {
            id: "enabled",
            name: "Enabled",
            default: this.manifest.enabledByDefault ?? false,
            type: "boolean"
        });

        let settings: { [key: string]: ContentAddonSetting } = Object.create(null);
        settings[this.enabled.id] = this.enabled;
        if (manifest.settings)
            for (const settingManifest of manifest.settings) {
                if (settings[settingManifest.id])
                    throw new Error(`Duplicate setting id ${settingManifest.id} in addon ${this.id}.`);
                settings[settingManifest.id] = ContentAddonSetting.create(this, settingManifest);
            }

        this.settings = settings;
    }

    public tryGetSetting(id: string): ContentAddonSetting | undefined {
        return this.settings[id];
    }

    public getSetting(id: string) {
        const setting = this.tryGetSetting(id);
        if (!setting) throw new Error(`No setting '${id}' in addon '${this.id}'`);
        return setting;
    }

}