import { AddonManifests } from "../share/AddonManifest";

export default new Promise<AddonManifests>(resolve => {
    if (document.saAddonManifests) {
        document.saAddonManifests.then(resolve);
    } else {
        document.addEventListener("sa-addon-manifests", () => {
            if (!document.saAddonManifests)
                throw new Error(`Received event but couldn't find addon manifests promise.`);
            document.saAddonManifests.then(resolve);
        }, { once: true });
    }
});