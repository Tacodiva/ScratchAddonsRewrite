import { mainChannelMessages, mainChannel } from '../../share/messaging';
import { resolveAddonManifests } from '../load/load-addons';

mainChannelMessages.init.onReceive = async (addonManifests) => {
    resolveAddonManifests(addonManifests);
    return "Lots of love, from the background 0w0";
};

mainChannel.accept();