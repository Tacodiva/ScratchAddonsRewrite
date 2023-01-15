import { AddonManifestSetting } from "../share/AddonManifest";

export class BackgroundAddonSetting {

    public readonly id: string;
    public readonly defaultValue: any;
    public value: any | undefined;

    public constructor(manifest: AddonManifestSetting, value: any | undefined) {
        this.id = manifest.id;
        this.defaultValue = manifest.default;
        this.value = value;
    }

}