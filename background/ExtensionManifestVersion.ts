export const enum ExtensionManifestVersion {
    MV2,
    MV3
}

function getManifestVersion() {
    switch (chrome.runtime.getManifest().manifest_version) {
        case 2: return ExtensionManifestVersion.MV2;
        case 3: return ExtensionManifestVersion.MV3;
    }
    throw new Error(`Unknown extension manifest version '${chrome.runtime.getManifest().version}'`)
}

const manifestVersion: ExtensionManifestVersion = getManifestVersion();
export default manifestVersion;