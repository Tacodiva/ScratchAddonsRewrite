declare module 'compile-configs' {
    export const enum ManifestVersion { MV2 = 2, MV3 = 3 }
    export const enum Environment { Production = 0, Development = 1 }
    export var CurrentManifestVersion: ManifestVersion;
    export var CurrentEnvironment: Environment;
}