import { AddonManifestSetting, AddonManifestSettingBoolean, AddonManifestSettingInteger } from "../share/AddonManifest";
import { messagesC2B } from "../share/messages";
import connection from "./connection";
import { ContentAddon } from "./ContentAddon";

export enum SettingEventSource {
    NONE = 0x00,
    INTERNAL = 0x01,
    EXTERNAL = 0x02,
    BOTH = INTERNAL | EXTERNAL,
}

export abstract class ContentAddonSetting {

    public static create(addon: ContentAddon, manifest: AddonManifestSetting): ContentAddonSetting {
        switch (manifest.type) {
            case "boolean":
                return new ContentAddonSettingBoolean(addon, manifest);
            case "integer":
                return new ContentAddonSettingInteger(addon, manifest);
        }
    }

    public readonly id: string;
    public readonly name: string;
    public readonly addon: ContentAddon;

    public constructor(addon: ContentAddon, manifest: AddonManifestSetting) {
        this.id = manifest.id;
        this.name = manifest.name;
        this.addon = addon;
    }

    public abstract setAny(value: any, source?: SettingEventSource): void;
    public abstract getAny() : any;

    private throw(type: string): never {
        throw new Error(`Setting ${this.id} is not of type ${type}.`);
    }

    public asBoolean(): boolean {
        return this.asBooleanSetting().get();
    }

    public asBooleanSetting(): ContentAddonSettingBoolean {
        this.throw("boolean");
    }

    public asInteger(): number {
        return this.asIntegerSetting().get();
    }

    public asIntegerSetting(): ContentAddonSettingInteger {
        this.throw("integer");
    }
}

abstract class ContentAddonSettingGeneric<T> extends ContentAddonSetting {
    public readonly defaultValue: T;

    private _value: T;

    protected _listeners: Set<{
        callback: (value: T) => void,
        source: SettingEventSource
    }>;

    public constructor(addon: ContentAddon, manifest: AddonManifestSetting, defaultValue: T) {
        super(addon, manifest);

        this._value = this.defaultValue = defaultValue;
        this._listeners = new Set();

        this.subscribe(this.onChangeInternal, SettingEventSource.INTERNAL);
    }

    protected onChangeInternal = (value: T) => {
        connection.sendNotify(messagesC2B.settingChange, {
            addonID: this.addon.id,
            settingID: this.id,
            value
        });
    }

    public get(): T {
        return this._value;
    }

    public set(value: T, source: SettingEventSource = SettingEventSource.INTERNAL) {
        this._value = value;
        for (const listener of this._listeners) {
            if ((listener.source & source) !== 0)
                listener.callback(value);
        }
    }

    public subscribe(callback: (value: T) => void, source: SettingEventSource = SettingEventSource.BOTH) {
        if (source === SettingEventSource.NONE) throw new Error("Cannot subscribe to no event sources.");
        this._listeners.add({ callback, source });
    }

    public unsubscribe(callback: (value: T) => void) {
        this._listeners.forEach(listener => {
            if (listener.callback === callback)
                this._listeners.delete(listener);
        });
    }

    public setAny(value: any, source?: SettingEventSource | undefined): void {
        this.set(this._validateAny(value), source);
    }

    public getAny() : T {
        return this._value;
    }

    protected abstract _validateAny(value: any): T;
    protected _validateAnyFail(expected: string): never {
        throw new Error(`Invalid value for setting '${this.id}'. Expected ${expected}.`);
    }
}

export class ContentAddonSettingBoolean extends ContentAddonSettingGeneric<boolean> {
    public constructor(addon: ContentAddon, manifest: AddonManifestSettingBoolean) {
        super(addon, manifest, manifest.default);
    }

    public override asBooleanSetting(): ContentAddonSettingBoolean {
        return this;
    }

    protected _validateAny(value: any): boolean {
        if (typeof value === 'boolean') return value;
        this._validateAnyFail('boolean');
    }
}

export class ContentAddonSettingInteger extends ContentAddonSettingGeneric<number> {
    public readonly min: number;
    public readonly max: number;

    public constructor(addon: ContentAddon, manifest: AddonManifestSettingInteger) {
        super(addon, manifest, manifest.default);
        this.min = manifest.min;
        this.max = manifest.max;
    }

    protected override onChangeInternal = (value: number) => {
        if (value > this.min || value < this.max)
            throw new Error(`Invalid setting value '${value}'. Out of range for setting ${this.id}.`);
        if (!Number.isInteger(value))
            throw new Error(`Invalid setting value '${value}'. Setting ${this.id} must be an integer.`);
        super.onChangeInternal(value);
    };

    public override asIntegerSetting(): ContentAddonSettingInteger {
        return this;
    }

    protected _validateAny(value: any): number {
        if (typeof value === 'number') return value;
        this._validateAnyFail('number');
    }
}