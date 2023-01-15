import { finishRegistration, addons } from './load-preinit';
import { AddonManifest } from '../share/AddonManifest';
import { logger } from './logger';

finishRegistration();
logger.log(`Loaded ${addons.length} addon manifests.`);
export default new Promise<AddonManifest[]>((resolve) => resolve(addons));
