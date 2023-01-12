import manifestVersion, { ExtensionManifestVersion } from '../ExtensionManifestVersion';

chrome.tabs.onUpdated.addListener(async (tabId, { status }, { url }) => {
    if (!url) return;
    if (status !== "loading") return;

    if (manifestVersion === ExtensionManifestVersion.MV3) {
        chrome.scripting.executeScript({
            target: { tabId },
            injectImmediately: true,
            world: "ISOLATED",
            files: ["content.js", "addons.js"]
        });
    } else {
        chrome.tabs.executeScript({
            file: "addons.js",
        });
        chrome.tabs.executeScript({
            file: "content.js",
        });
    }
});