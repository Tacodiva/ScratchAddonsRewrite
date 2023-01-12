import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';
import * as path from 'path';

export default (args) => {
	const devel = args.config_devel ?? false;

	const assetGenPlugins = [
		{
			name: "Emit Addon Assets",
			generateBundle() {
				const bundledExts = [".js", ".ts"];
				const plugin = this;
				function copyAsset(file) {
					if (fs.statSync(file).isDirectory())
						fs.readdirSync(file).forEach(subfile =>
							copyAsset(path.join(file, subfile))
						);
					else if (bundledExts.indexOf(path.extname(file)) === -1) {
						plugin.emitFile({
							type: "asset",
							fileName: file,
							source: fs.readFileSync(file)
						});
					}
				}
				copyAsset('addons');
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
						tsconfig: "tsconfig.background.json",
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
						tsconfig: "tsconfig.content.json",
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
	];
};