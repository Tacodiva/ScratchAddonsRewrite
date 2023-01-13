# Scratch Addons Rewrite No.2930810

## Key Features:

- Supports MV2 and MV3
- Supports TypeScript alongside JavaScript
- Supports Vue 3
- Type checking of addon manifests at compile time
- GitHub Actions creates MV2 and MV3 builds automatically

Currently, doesn't do anything because addon APIs, addon settings, addon l10n and the UI all needs to be re-implemented.

## Project structure

### Folders

Ok I know there's a lot of scary looking folders in here but they all serve their purpose, and I promise it's not that bad.

When built, this project produces four bundles, they are:

- `addons.js` contains all the addon manifests and their source code. It also contains a small amout of code which registers all the addons.
- `background.js` contains the background script for the plugin. This has to be a single script now due to MV3.
- `inject.js` contains the code which gets injected into scratch.mit.edu and executes all the addons.
- `webpages.js` contains the vue components and logic for the popup and settings page.

And here is a list of the folders and what they contain

- `addons` -> Source bundled into `addons.js`
- `addons-bundle` -> Source bundled into `addons.js`
- `background` -> Source bundled into `background.js`
- `content` -> Source bundled into `addons.js`, `inject.js` and `webpages.js`
- `inject` -> Source bundled into `inject.js`
- `manifests` -> not bundled, contains two versions of manifest.json, one for mv2 and one for mv3.
- `share` -> Source bundled into all bundles
- `static` -> All the other files needed by the extension. This is also the folder all the bundles put into
- `webpages` -> Source bundled into `webpages.js`

### The Addon Manifest Issue

There is a bit of a problem with the way the bundles are set up above. `background.js` needs to know about all the addons, which is information stored in `addons.js`, but because of the new mv3 restrictions, we can't execute any other script from inside `background.js`, so there is no way to access the data directly. The solution is a 'handshaking' system. Each time somebody needs information from the background, they must first perform a handshake. In this handshake, they will ask the background if it has ever received the list of addons. If it hasn't, they will send the list of addons to the background. This sounds like a big hassle but with the power of promises, and my own abstraction of the extension messaging system, it's really not that big of a deal.
