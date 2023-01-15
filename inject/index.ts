import saPromise from "../content";

saPromise.then(SA => {
    console.log("Got SA!");

    const setting = SA.getAddon('single-file-addon').getSetting('experimentalKeys').asBooleanSetting();

    console.log(setting.get());

    setting.subscribe(value => {
        console.log("Setting updated!!");
        console.log(value);
    });

});