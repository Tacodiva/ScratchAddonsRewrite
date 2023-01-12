import { finishRegistration, addons } from './load-addons-global';
import { AddonManifest } from '../AddonManifest';
import '../../addons/addons';

finishRegistration();

export default new Promise<AddonManifest[]>((resolve) => resolve(addons));
