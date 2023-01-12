export type AddonManifests = readonly AddonManifest[];

export interface AddonManifest {
    readonly id: string;

    readonly name: string;
    readonly description: string;

    readonly tags: string[];
    readonly credits: AddonManifestCredit[];

    readonly info?: any[];
    readonly settings?: AddonManifestSetting[];

    readonly userscripts: AddonManifestUserscript[];

    readonly dynamicEnable: boolean;
    readonly dynamicDisable: boolean;

    readonly versionAdded: string;
    readonly enabledByDefault?: boolean;
}

export interface AddonManifestCredit {
    readonly name: string;
    readonly link: string;
}

export interface AddonManifestUserscript {
    readonly matches: string[];
    readonly function: AddonUserscriptFunction;
}

export type AddonUserscriptFunction = (ctx: {
    console: Console;
    msg: (message: string) => string;
}) => (Promise<void> | undefined);

interface AddonManifestSettingBase {
    readonly id: string;
    readonly name: string;
    readonly type: string;
}

export type AddonManifestSettingBoolean = {
    readonly type: "boolean";
    readonly default: boolean;
} & AddonManifestSettingBase;

export type AddonManifestSettingInteger = {
    readonly type: "integer";
    readonly min: number;
    readonly default: number;
    readonly max: number;
} & AddonManifestSettingBase;

export type AddonManifestSetting = AddonManifestSettingBoolean | AddonManifestSettingInteger;