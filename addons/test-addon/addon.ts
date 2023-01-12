import userscript from './userscript.js';

registerAddon({
    id: "test-addon",
    
    name: "Extra key support",
    description: "Adds more keys to the \"key () pressed?\" and \"when () key pressed\" block dropdowns, such as enter, dot, comma, and more.",
    tags: ["editor", "codeEditor", "beta"],
    credits: [
        {
            name: "Tacodude7729",
            link: "https://scratch.mit.edu/users/Tacodude7729/"
        }
    ],
    info: [
        {
            "type": "notice",
            "text": "The \"experimental keys\" include equals, slash, semicolon and more. They may not work on all operating systems or keyboard layouts.",
            "id": "experimentalKeysWarn"
        },
        {
            "type": "notice",
            "text": "The \"Shift keys\" include keys which typically require the Shift key and a number key, like hashtag, exclamation mark and more. These keys only work with the \"when () key pressed\" block and do not work on all operating systems or keyboard layouts.",
            "id": "shiftKeysWarn"
        }
    ],
    settings: [
        {
            "name": "Enable experimental keys",
            "id": "experimentalKeys",
            "type": "boolean",
            "default": false
        },
        {
            "name": "Enable Shift keys",
            "id": "shiftKeys",
            "type": "boolean",
            "default": false
        }
    ],
    userscripts: [
        {
            "matches": ["projects"],
            "function": userscript
        }
    ],
    dynamicEnable: true,
    dynamicDisable: true,
    versionAdded: "1.20.0"
})