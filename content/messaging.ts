import { MessageAddonL10N, messagesB2C } from "../share/messages";
import { SettingEventSource } from "./ContentAddonSetting";
import { L10NLogger, messageLogger } from "./logger";
import addonsPromise from './load-addons';
import saPromise from "./ContentScratchAddons";

messagesB2C.settingChange.onReceive = settingChange => {
    messageLogger.log(`Received settingChange. ${settingChange.addonID}/${settingChange.settingID} = ${settingChange.value}`);

    saPromise.then(SA => {
        SA.getAddon(settingChange.addonID)
            .getSetting(settingChange.settingID)
            .setAny(settingChange.value, SettingEventSource.EXTERNAL);
    });
}

messagesB2C.handshakeRequestAddons.onReceive = async () => {
    messageLogger.log(`Received handshakeRequestAddons.`);
    return JSON.parse(JSON.stringify(await addonsPromise));
}

messagesB2C.handshakeRequestL10N.onReceive = ({ lang, addons }) => {
    messageLogger.log(`Received handshakeRequestL10N.`);

    async function loadLanguageFile(file: string): Promise<{ [key: string]: string }> {
        L10NLogger.log(`Loading '${file}'.`);
        return await fetch(chrome.runtime.getURL(file))
            .then(res => res && res.json())
            .catch(err => {
                L10NLogger.warn(`Error loading addon manifest language file ${file}.`);
                return {};
            });
    }

    async function loadLanguage(lang: string): Promise<MessageAddonL10N> {
        L10NLogger.log(`Loading language '${lang}'.`);
        const languageDir = `addons/l10n/${lang}`;
        let addonsMap: { [key: string]: { [key: string]: string } } = Object.create(null);
        for (const addon of addons)
            addonsMap[addon] = await loadLanguageFile(`${languageDir}/${addon}.json`);
        return {
            lang,
            addons: addonsMap,
            general: await loadLanguageFile(`${languageDir}/_general.json`)
        }
    }

    let languages: string[] = [];
    if (lang !== "en") languages.push("en");
    languages.push(lang);

    return Promise.all(languages.flatMap(loadLanguage));
}