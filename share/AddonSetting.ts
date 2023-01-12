import { AddonManifestSetting, AddonManifestSettingBoolean } from "./AddonManifest";

export abstract class AddonSetting {

    public static create(manifest: AddonManifestSetting): AddonSetting {
        switch (manifest.type) {
            case "boolean":
                return new AddonSettingBoolean(manifest);
            case "integer":
                throw new Error("Not implemented.");
        }
    }

    public readonly id: string;
    public readonly name: string;

    public constructor(manifest: AddonManifestSetting) {
        this.id = manifest.id;
        this.name = manifest.name;
    }

    private throw(type: string): never {
        throw new Error(`Setting ${this.id} is not of type ${type}.`);
    }

    public asBoolean(): boolean {
        this.throw("boolean");
    }

    public asInteger(): boolean {
        this.throw("integer");
    }
}

export class AddonSettingBoolean extends AddonSetting {
    public readonly defaultValue: boolean;
    private _value: boolean;

    public constructor(manifest: AddonManifestSettingBoolean) {
        super(manifest);
        this.defaultValue = manifest.default;
        this._value = this.defaultValue;
    }

    public override asBoolean(): boolean {
        return this._value;
    }
}

