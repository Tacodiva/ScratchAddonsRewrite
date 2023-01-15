import { AddonManifests } from "../share/AddonManifest";
import { ContentAddon } from "./ContentAddon";
import { MessageHandshakeData, messagesC2B } from "../share/messages";
import connection from "./connection";
import { logger } from "./logger";
import addonsPromise from './load-addons';

export class ContentScratchAddons {

    public readonly handshake: MessageHandshakeData;

    private readonly _addons: { readonly [id: string]: ContentAddon | undefined };

    public constructor(manifests: AddonManifests, handshake: MessageHandshakeData) {
        this.handshake = handshake;

        let addons: { [id: string]: ContentAddon } = Object.create(null);
        for (const manifest of manifests) {
            addons[manifest.id] = new ContentAddon(manifest);
        }
        this._addons = addons;

        logger.log(`Content initialization complete`)
    }

    public tryGetAddon(id: string): ContentAddon | undefined {
        return this._addons[id];
    }

    public getAddon(id: string): ContentAddon {
        const addon = this.tryGetAddon(id);
        if (!addon) throw new Error(`Addon ${id} not found.`);
        return addon;
    }
}

const saPromise: Promise<ContentScratchAddons> = new Promise(async resolve => {
    resolve(new ContentScratchAddons(await addonsPromise, await connection.sendRequest(messagesC2B.handshake, undefined)));
});

export default saPromise;