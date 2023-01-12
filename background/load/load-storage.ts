import { Storage } from '../Storage';
export default new Promise<Storage>((resolve) => {
    // TDTODO we'll need to convert the old storage format to
    //  the new one, probably in here.
    chrome.storage.sync.get(resolve);
});