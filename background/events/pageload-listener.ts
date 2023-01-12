import manifestVersion, { ExtensionManifestVersion } from '../ExtensionManifestVersion';

chrome.tabs.onUpdated.addListener(async (tabId, { status }, { url }) => {
    if (!url) return;
    if (status !== "loading") return;

    if (manifestVersion === ExtensionManifestVersion.MV3) {
        chrome.scripting.executeScript({
            target: { tabId },
            injectImmediately: true,
            world: "MAIN",
            files: ["content.js"]
        });
    } else {
        chrome.tabs.executeScript({
            file: "content.js"
        });
    }
});