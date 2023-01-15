import { AddonManifests } from '../share/AddonManifest';
import { messagesB2C, MessageSettingChange } from '../share/messages';
import { ConnectedMessageChannel } from '../share/messaging';
import { BackgroundAddon } from './BackgroundAddon';
import { logger } from './logger';
import { Storage } from './Storage';

export class BackgroundScratchAddons {
    public static readonly connections : Set<ConnectedMessageChannel> = new Set();

    public readonly addons: { readonly [key: string]: BackgroundAddon | undefined };

    public constructor(addonManifests: AddonManifests, storage: Storage) {
        let addons: { [key: string]: BackgroundAddon } = {};

        if (!storage.addons) storage.addons = {};

        for (const addonManifest of addonManifests) {
            const addon = new BackgroundAddon(addonManifest, storage.addons[addonManifest.id]);
            addons[addon.id] = (addon);
        }

        this.addons = addons;

        logger.log(`Background initialization complete on ${addonManifests.length} addons.`);
    }

    public onSettingChange(event: MessageSettingChange, source: ConnectedMessageChannel) {
        this.addons[event.addonID]!.settings[event.settingID]!.value = event.value;
        for (const connection of BackgroundScratchAddons.connections) {
            if (connection === source) continue;
            connection.sendNotify(messagesB2C.settingChange, event);
        }
    }
}