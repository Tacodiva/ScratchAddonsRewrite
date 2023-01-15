import { CurrentManifestVersion, ManifestVersion } from "compile-configs";

chrome.tabs.onUpdated.addListener(async (tabId, { status }, { url }) => {
    if (!url) return;
    if (status !== "loading") return;

    if (CurrentManifestVersion === ManifestVersion.MV3) {
        chrome.scripting.executeScript({
            target: { tabId },
            injectImmediately: true,
            world: "ISOLATED",
            files: ["bundles/addons.js", "bundles/inject.js"]
        });
    } else {
        chrome.tabs.executeScript({
            file: "bundles/addons.js",
        });
        chrome.tabs.executeScript({
            file: "bundles/inject.js",
        });
    }
});