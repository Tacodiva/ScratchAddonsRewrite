import { MessageAddonL10N } from "../share/messages";

export let language = "en";

let promiseResolver: ((addons: MessageAddonL10N[]) => void) | null = null;

let languageData: Promise<MessageAddonL10N[]> = new Promise(resolver => {
    promiseResolver = resolver;
});
export default languageData;

export function provideL10N(l10n: MessageAddonL10N[]) {
    if (l10n[l10n.length - 1].lang !== language) return;
    if (promiseResolver) {
        promiseResolver(l10n);
        promiseResolver = null;
    }
}

export function hasL10N() {
    return promiseResolver === null;
}