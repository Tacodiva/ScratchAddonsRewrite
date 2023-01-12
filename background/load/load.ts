import addons from './load-addons';
import storage from './load-storage';

import { ScratchAddonsBackground } from '../ScratchAddonsBackground';

export default new Promise<ScratchAddonsBackground>
    (async (resolve) => resolve(new ScratchAddonsBackground(await addons, await storage)));