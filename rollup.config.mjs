import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import vue from "rollup-plugin-vue";
import virtual from '@rollup/plugin-virtual';
import postcss from "rollup-plugin-postcss";

import * as fs from 'fs';
import * as path from 'path';

const ADDON_MANIFEST_NAME = "addon.ts";
const BUNDLED_EXTS = [".js", ".ts"];

function fenseDependencies(dirs) {
	return {
		generateBundle(options, bundle) {
			const resolvedDirs = dirs.flatMap(dir => path.resolve(dir) + '/');
			for (const filePath of Object.keys(bundle)) {
				const file = bundle[filePath];
				if (file.type === 'chunk') {
					for (const module of file.moduleIds) {
						if (!resolvedDirs.find(dir => module.startsWith(dir)))
							throw new Error(`Module '${path.relative('.', filePath)}' illegally imports ${path.relative(filePath, module)}.`);
					}
				}
			}
		}
	};
}

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
				for (const asset of addonAssets) {
					const assetDest = path.join("static", asset);
					fs.mkdirSync(path.dirname(assetDest), { recursive: true });
					fs.copyFileSync(asset, assetDest);
				}
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
				fs.copyFileSync(args.config_manifest, "./static/manifest.json");
			}
		}
	];

	return [
		{
			input: 'background/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'ScratchAddonsBackground',
				file: 'static/bundles/background.js',
			},
			plugins: [
				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "background/tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),

				fenseDependencies([
					'./background',
					'./share'
				]),

				!devel && terser(),

				...assetGenPlugins
			],
			watch: {
				clearScreen: false
			}
		},
		{
			input: 'inject/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'ScratchAddonsContent',
				file: 'static/bundles/inject.js',
			},
			plugins: [
				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "inject/tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),

				fenseDependencies([
					'./inject',
					'./share',
					'./content'
				]),

				!devel && terser()
			],
			watch: {
				clearScreen: false
			}
		},
		{
			input: 'addons-exec/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'ScratchAddonsAddons',
				file: 'static/bundles/addons.js',
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
						tsconfig: "addons-exec/tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),

				fenseDependencies([
					'./addons',
					'./addons-exec',
					'./share',
					'./content'
				]),

				!devel && terser()
			],
			watch: {
				clearScreen: false
			}
		},
		{
			input: 'webpages/index.ts',
			external: ['vue'],
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'ScratchAddonsWebpages',
				file: 'static/bundles/webpages.js',
				globals: { "vue": "Vue" }
			},
			plugins: [

				vue({ target: "browser" }),
				postcss(),

				typescript(
					{
						tsconfig: "webpages/tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),
				resolve(),
				commonjs(),

				fenseDependencies([
					'./webpages',
					'./share',
					'./content',
					'./node_modules/style-inject'
				]),

				!devel && terser()
			],
			watch: {
				clearScreen: false
			}
		}
	];
};