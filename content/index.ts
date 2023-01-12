
import addons from '../share/load/load-addons';
import { mainChannel, mainChannelMessages } from '../share/messaging';

const comms = mainChannel.connect();

addons.then(addons => {

    comms.sendRequest(mainChannelMessages.init, addons).then(res => {
        console.log("Received response!");
        console.log(res);
    });
});