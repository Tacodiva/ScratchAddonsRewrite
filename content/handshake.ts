import { mainChannel, mainChannelMessages } from '../share/messaging';
import { AddonManifests } from "../share/AddonManifest";
import { ScratchAddonsContent } from './ScratchAddonsContent';

const addonsPromise = new Promise<AddonManifests>(resolve => {
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

export default function (): Promise<ScratchAddonsContent> {
    return new Promise(async resolve => {
        const channel = mainChannel.connect();

        const addons = await addonsPromise;
        let handshakeData = await channel.sendRequest(mainChannelMessages.handshake, undefined);
        if (!handshakeData) {
            handshakeData = await channel.sendRequest(mainChannelMessages.handshakeProvideAddons, JSON.stringify(addons));
        }
        resolve(new ScratchAddonsContent(channel, addons, handshakeData));
    });
}