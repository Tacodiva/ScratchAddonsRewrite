import { channelType, messagesB2C, messagesC2B } from '../share/messages';
import { BackgroundScratchAddons } from './BackgroundScratchAddons';
import l10n, { hasL10N, language, provideL10N } from './l10n';
import SA from './load/load';
import addons, { provideAddonManifests, hasAddonManifests } from './load/load-addons';
import { messageLogger } from './logger';

messagesC2B.handshake.onReceive = async (msg, channel) => {
    messageLogger.log("Received handshake.");
    if (!hasAddonManifests())
        provideAddonManifests(await channel.sendRequest(messagesB2C.handshakeRequestAddons, undefined));
    if (!hasL10N())
        provideL10N(await channel.sendRequest(messagesB2C.handshakeRequestL10N, {
            lang: language,
            addons: (await addons).flatMap(addon => addon.id)
        }));
    return {
        addonL10N: await l10n
    };
};

messagesC2B.settingChange.onReceive = (settingChange, channel) => {
    messageLogger.log(`Received settingChange. ${settingChange.addonID}/${settingChange.settingID} = ${settingChange.value}`);
    SA.then(SA => {
        SA.onSettingChange(settingChange, channel);
    });
}

channelType.accept(
    connection => {
        messageLogger.log('Accepted new connection.');
        BackgroundScratchAddons.connections.add(connection)
    },
    connection => {
        messageLogger.log('Content disconnected.');
        BackgroundScratchAddons.connections.delete(connection);
    }
);