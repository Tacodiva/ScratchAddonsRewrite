import addons from './load-addons';
import storage from './load-storage';

import { BackgroundScratchAddons } from '../BackgroundScratchAddons';

export default new Promise<BackgroundScratchAddons>
    (async (resolve) => resolve(new BackgroundScratchAddons(await addons, await storage)));