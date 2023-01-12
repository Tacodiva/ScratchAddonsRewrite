import { resolveAddonManifests } from "../background/load/load-addons";
import { AddonManifests } from "./AddonManifest";

abstract class MessageType {
    public readonly id: string;
    public readonly backgroundbound: boolean;

    constructor(id: string, backgroundbound: boolean) {
        if (id === "response")
            throw new Error("The id 'response' is reserved.");
        this.id = id;
        this.backgroundbound = backgroundbound;
    }

    public abstract receive(content: any): Promise<{ id: "response", content: any }> | null;
}

export class MessageTypeNotify<TMsg> extends MessageType {
    public readonly receiver: (msg: TMsg) => void;

    public constructor(id: string, backgroundbound: boolean, receiver: (msg: TMsg) => void) {
        super(id, backgroundbound);
        this.receiver = receiver;
    }

    public override receive(content: any): null {
        this.receiver(content)
        return null;
    }
}

export class MessageTypeRequest<TMsg, TRes> extends MessageType {
    public onReceive: ((msg: TMsg) => Promise<TRes>) | null;

    public constructor(id: string, backgroundbound: boolean) {
        super(id, backgroundbound);
        this.onReceive = null;
    }

    public async receive(content: any): Promise<{ id: "response"; content: any; }> {
        if (!this.onReceive)
            throw new Error(`No onReceive method set for message ${this.id}.`);
        return {
            id: "response",
            content: await this.onReceive(content)
        }
    }
}

export class MessageChannelType {
    public readonly id: string;
    private readonly typeMap: { readonly [id: string]: MessageType };

    public constructor(id: string, types: MessageType[]) {
        this.id = id;
        let typeMap = Object.create(null);
        for (const type of types) {
            if (type.id === "request") throw new Error("Message id 'request' is reserved.");
            typeMap[type.id] = type;
        }
        this.typeMap = typeMap;
    }

    public getMessageType(id: string): MessageType {
        const type = this.typeMap[id];
        if (!type) throw new Error(`Unknown message id ${id}`);
        return type;
    }

    public connect(): MessageChannel {
        return new MessageChannel(false, this, chrome.runtime.connect({ name: this.id }));
    }

    public accept() {
        chrome.runtime.onConnect.addListener(port => {
            if (port.name === this.id) {
                new MessageChannel(true, this, port);
            }
        });
    }
}

export class MessageChannel {
    public readonly isBackgroundSide: boolean;
    public readonly type: MessageChannelType;
    public readonly port: chrome.runtime.Port;

    private readonly requests: { [id: number]: ((content: any) => void) }
    private _currentId: number;

    public constructor(backgroundSide: boolean, type: MessageChannelType, port: chrome.runtime.Port) {
        this.isBackgroundSide = backgroundSide;
        this.type = type;
        this.port = port;
        this.requests = Object.create(null);
        this._currentId = 0;

        port.onMessage.addListener(this._onMessageListener)
    }

    private _onMessageListener = (message: any) => {
        if (typeof message !== 'object' || typeof message.id !== 'string')
            throw new Error(`Invalid message ${message} received.`);
        if (message.id === "response") {
            this.requests[message.request](message.content);
            this.requests[message.request] = undefined!;
        } else {
            const response = this.type.getMessageType(message.id).receive(message.content);
            if (response) response.then((responseObj: any) => {
                responseObj.request = message.request;
                this.port.postMessage(responseObj);
            });
        }
    }

    private _checkDirection(message: MessageType) {
        if (message.backgroundbound) {
            if (this.isBackgroundSide)
                throw new Error(`Cannot send background bound message from this side.`);
        } else {
            if (!this.isBackgroundSide)
                throw new Error(`Cannot send non-background bound message from this side.`);
        }
    }

    public sendNotify<TMsg>(message: MessageTypeNotify<TMsg>, content: TMsg) {
        this._checkDirection(message);
        this.port.postMessage({
            id: message.id,
            content
        });
    }

    public sendRequest<TMsg, TRes>(message: MessageTypeRequest<TMsg, TRes>, content: TMsg): Promise<TRes> {
        this._checkDirection(message);
        return new Promise<TRes>(async resolve => {
            const requestId = this._currentId++;
            this.requests[requestId] = resolve;
            this.port.postMessage({
                id: message.id,
                request: requestId,
                content
            });
        });
    }
}

export const mainChannelMessages = {
    init: new MessageTypeRequest<AddonManifests, string>("init", true)
};

export const mainChannel = new MessageChannelType("main", Object.values(mainChannelMessages));