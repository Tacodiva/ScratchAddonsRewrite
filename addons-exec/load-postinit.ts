import { finishRegistration, addons } from './load-preinit';
import { AddonManifest } from '../share/AddonManifest';

finishRegistration();
console.log(`Loaded ${addons.length} addons`);
export default new Promise<AddonManifest[]>((resolve) => resolve(addons));
