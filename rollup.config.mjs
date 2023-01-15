import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import vue from "rollup-plugin-vue";
import virtual from '@rollup/plugin-virtual';
import postcss from "rollup-plugin-postcss";

import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';

const ADDON_MANIFEST_NAME = "addon.ts";
const BUNDLED_EXTS = [".js", ".ts", ".vue"];

function fenceDependencies(dirs) {
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
	const outputPath = args.config_out ?? "./";
	const copyAssets = path.resolve(outputPath) !== path.resolve();

	const configPath = args.config_path;
	if (!configPath)
		throw new Error(`Missing argument 'config_path'.`);
	const manifestPath = path.join(configPath, "manifest.json");
	const compileConfigsPath = path.join(configPath, "compile-configs.js");

	const addonManifestFiles = [];

	function searchForManifests(folder, insideAddon = false) {
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
				searchForManifests(subfile, insideAddon);
			} else if (BUNDLED_EXTS.indexOf(path.extname(subfile)) !== -1 && !insideAddon) {
				addonManifestFiles.push(subfile);
			}
		});
		return insideAddon;
	}
	searchForManifests("./addons/content");


	console.log(`\x1b[1m\x1b[32mPackaging ${addonManifestFiles.length} addon manifests.\x1b[0m`);

	if (copyAssets) {
		function copyToOutput(file) {
			const assetDest = path.join(outputPath, file);
			fs.mkdirSync(path.dirname(assetDest), { recursive: true });
			fse.copy(file, assetDest);
		}

		function copyFolderAssets(folder) {
			fs.readdirSync(folder).forEach(subfileName => {
				const subfile = path.join(folder, subfileName);
				if (fs.statSync(subfile).isDirectory()) {
					copyFolderAssets(subfile);
				} else if (BUNDLED_EXTS.indexOf(path.extname(subfile)) === -1) {
					copyToOutput(subfile);
				}
			});
		}

		['addons', 'webpages'].forEach(copyFolderAssets);
		['static', '_locales'].forEach(copyToOutput);
	}

	fs.copyFileSync(manifestPath, path.join(outputPath, "manifest.json"));

	const compileConfigsSource = fs.readFileSync(compileConfigsPath, "utf8");
	const compileConfigsPlugin = virtual({
		'compile-configs': compileConfigsSource
	});

	return [
		{
			input: 'background/index.ts',
			output: {
				sourcemap: devel,
				format: 'iife',
				name: 'ScratchAddonsBackground',
				file: path.join(outputPath, 'bundles/background.js'),
			},
			plugins: [
				compileConfigsPlugin,

				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "background/tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),

				fenceDependencies([
					'./background',
					'./share'
				]),

				!devel && terser()
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
				file: path.join(outputPath, 'bundles/inject.js'),
			},
			plugins: [
				compileConfigsPlugin,

				resolve(),
				commonjs(),

				typescript(
					{
						tsconfig: "inject/tsconfig.json",
						sourceMap: devel,
						inlineSources: devel
					}
				),

				fenceDependencies([
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
				file: path.join(outputPath, 'bundles/addons.js'),
			},
			plugins: [
				compileConfigsPlugin,

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

				fenceDependencies([
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
				file: path.join(outputPath, 'bundles/webpages.js'),
				globals: { "vue": "Vue" }
			},
			plugins: [
				compileConfigsPlugin,

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

				fenceDependencies([
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