import { mainChannelMessages, mainChannel } from '../../share/messaging';
import SA from '../load/load';
import { provideAddonManifests, hasAddonManifests } from '../load/load-addons';

mainChannelMessages.handshake.onReceive = async () => {
    if (hasAddonManifests()) 
        return (await SA).serialize();
    return null;
};

mainChannelMessages.handshakeProvideAddons.onReceive = async (manifestsJSON) => {
    provideAddonManifests(JSON.parse(manifestsJSON));
    return (await SA).serialize();
}

mainChannel.accept();