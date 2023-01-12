import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import virtual from '@rollup/plugin-virtual';

import * as fs from 'fs';
import * as path from 'path';

const ADDON_MANIFEST_NAME = "addon.ts";
const BUNDLED_EXTS = [".js", ".ts"];

export default (args) => {
	const devel = args.config_devel ?? false;

	const addonManifestFiles = [];
	const addonAssets = [];

	function searchFolder(folder, insideAddon = false) {
		const subfiles = fs.readdirSync(folder);
		// Is this an addons folder which has a addon.ts file? Like 'cool-stuff/addon.ts'
		if (subfiles.find(subfile => path.basename(subfile) === ADDON_MANIFEST_NAME)) {
			const subfile = path.join(folder, ADDON_MANIFEST_NAME);
			if (insideAddon)
				throw new Error(`Unexpected addon manifest file '${subfile}'. Addon's manifest cannot be in another addon's folder.`);
			addonManifestFiles.push(subfile);
			insideAddon = true;
		}
		subfiles.forEach(subfileName => {
			const subfile = path.join(folder, subfileName);
			if (fs.statSync(subfile).isDirectory()) {
				searchFolder(subfile, insideAddon);
			} else if (BUNDLED_EXTS.indexOf(path.extname(subfile)) === -1) {
				if (!insideAddon)
					throw new Error(`Unexpected asset '${subfile}'. Assets must in an addon's folder.`);
				addonAssets.push(subfile);
			} else if (!insideAddon) {
				addonManifestFiles.push(subfile);
			}
		});
		return insideAddon;
	}
	searchFolder("./addons");
	console.log(`\x1b[1m\x1b[32mPackaging ${addonManifestFiles.length} addons and ${addonAssets.length} assets.\x1b[0m`);

	const assetGenPlugins = [
		{
			name: "Emit Addon Assets",
			generateBundle() {
				for (const asset of addonAssets)
					plugin.emitFile({
						type: "asset",
						fileName: file,
						source: fs.readFileSync(file)
					});
			}
		},

		{
			name: "Emit manifest.json",
			generateBundle() {
				if (!args.config_manifest) {
					console.warn("\x1b[1m\x1b[33m\nWarning: config_manifest argument not provided. No manifest.json emitted.");
					console.warn("Use `npm run build:firefox` to build for firefox, otherwise use `npm run build:chromium`\n\x1b[0m")
					return;
				}
				this.emitFile({
					type: "asset",
					fileName: "manifest.json",
					source: fs.readFileSync(args.config_manifest)
				});
			}
		}
	];

	return [
		{
			input: 'background/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'app',
				file: 'static/background.js',
			},
			plugins: [
				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),
			],
			watch: {
				clearScreen: false
			}
		},
		{
			input: 'content/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'app',
				file: 'static/content.js',
			},
			plugins: [
				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),
			],
			watch: {
				clearScreen: false
			}
		},
		{
			input: 'addons-bundle/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'app',
				file: 'static/addons.js',
			},
			plugins: [

				virtual({
					'sa-addons':
						addonManifestFiles
							.flatMap(file => `import ${JSON.stringify(file)};`)
							.join("\n")
				}),

				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),
				...assetGenPlugins
			],
			watch: {
				clearScreen: false
			}
		},
		{
			input: 'webpages',
			output: {
				
			}
		}
	];
};