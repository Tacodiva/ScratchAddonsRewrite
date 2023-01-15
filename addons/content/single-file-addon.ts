registerAddon({
    id: "single-file-addon",
    
    name: "Single File Addon",
    description: "",
    tags: ["editor", "codeEditor"],
    credits: [
        {
            name: "Tacodude7729",
            link: "https://scratch.mit.edu/users/Tacodude7729/"
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
            "default": false,
        }
    ],
    userscripts: [
        {
            "matches": ["projects"],
            "function": async function() {
                console.log("Wow, this addon doesn't even need a folder!");
            }
        }
    ],
    dynamicEnable: true,
    dynamicDisable: true,
    versionAdded: "1.20.0"
});
