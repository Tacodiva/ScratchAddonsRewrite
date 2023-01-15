import { AddonManifests } from "./AddonManifest";
import { MessageChannelType, MessageType, MessageTypeNotify, MessageTypeRequest } from "./messaging";

export interface MessageHandshakeData {
    addonL10N: MessageAddonL10N[]
}

export interface MessageSettingChange {
    addonID: string,
    settingID: string,
    value: any
}

export interface MessageAddonL10N {
    lang: string,
    general: { [key: string]: string },
    addons: { [key: string]: { [key: string]: string } }
}

export const messagesC2B = {
    handshake: new MessageTypeRequest<void, MessageHandshakeData>("handshake", true),

    settingChange: new MessageTypeNotify<MessageSettingChange>("c2bSettingChange", true)
};

export const messagesB2C = {
    handshakeRequestAddons: new MessageTypeRequest<void, AddonManifests>("handshakeProvideAddons", false),
    handshakeRequestL10N: new MessageTypeRequest<{
        lang: string,
        addons: string[]
    }, MessageAddonL10N[]>("b2cHandshakeRequestL10N", false),
    
    settingChange: new MessageTypeNotify<MessageSettingChange>("b2cSettingChange", false),
}

export const channelType = new MessageChannelType("main", Object.values<MessageType>(messagesC2B).concat(Object.values(messagesB2C)));
