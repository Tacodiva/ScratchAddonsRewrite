import { AddonManifests } from "../share/AddonManifest";
import { HandshakeData } from "../share/HandshakeData";
import { ConnectedMessageChannel } from "../share/messaging";

export class ScratchAddonsContent {

    public readonly background : ConnectedMessageChannel;
    public readonly addons : AddonManifests;
    public readonly handshake : HandshakeData;

    public constructor(background: ConnectedMessageChannel, addons: AddonManifests, handshake: HandshakeData) {
        this.background = background;
        this.addons = addons;
        this.handshake = handshake;
    }
}