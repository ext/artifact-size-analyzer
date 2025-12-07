import nodefs from "node:fs/promises";
import path from "node:path";
import yargs from "yargs";
import { type BundleSize } from "./bundle-size.ts";
import { compareBundles } from "./compare/index.ts";
import { type Format, formatBundle, formatDiff, formats } from "./format/index.ts";
import { getBundleSize } from "./get-bundle-size.ts";
import { readConfigFile } from "./read-config-file.ts";
import { readJsonFile } from "./read-json-file.ts";

function resolve(cwd: string, p: string): string {
	return path.isAbsolute(p) ? p : path.join(cwd, p);
}

interface AnalyzeOptions {
	cwd: string;
	configFile: string;
	format: Format;
	outputFile?: string | undefined;
	fs?: typeof nodefs;
}

interface CompareOptions {
	cwd: string;
	format: Format;
	outputFile?: string | undefined;
	base: string;
	current: string;
	fs?: typeof nodefs;
}

export async function cli(cwd: string, argv: string[]): Promise<void> {
	const parser = yargs(argv)
		.scriptName("bundle-analyzer")
		.usage("$0 <command> [options]")
		.command(
			"analyze",
			"Analyze bundles from a config file",
			(y) =>
				y
					.option("config-file", {
						alias: "c",
						describe: "Configuration file",
						demandOption: true,
						type: "string",
						requiresArg: true,
					})
					.option("output-file", {
						alias: "o",
						describe: "Write output to file instead of stdout",
						type: "string",
						requiresArg: true,
					})
					.option("format", {
						alias: "f",
						describe: "Output format",
						choices: formats,
						default: "text" as const,
					}),
			async (args) => {
				await analyze({
					cwd,
					configFile: args.configFile,
					format: args.format,
					outputFile: args.outputFile,
				});
			},
		)
		.command(
			"compare",
			"Compare two previously saved analysis results",
			(y) =>
				y
					.option("base", {
						alias: "b",
						describe: "Path to baseline JSON file",
						type: "string",
						requiresArg: true,
						demandOption: true,
					})
					.option("current", {
						alias: "c",
						describe: "Path to current JSON file",
						type: "string",
						requiresArg: true,
						demandOption: true,
					})
					.option("format", {
						alias: "f",
						describe: "Output format",
						choices: formats,
						default: "text" as const,
					})
					.option("output-file", {
						alias: "o",
						describe: "Write output to file instead of stdout",
						type: "string",
						requiresArg: true,
					}),
			async (args) => {
				await compare({
					cwd,
					base: args.base,
					current: args.current,
					format: args.format,
					outputFile: args.outputFile,
				});
			},
		)
		.demandCommand(1, "Please specify a command: analyze or compare")
		.strict()
		.help();

	await parser.parse();
}

export async function analyze(options: AnalyzeOptions): Promise<void> {
	const fs = options.fs ?? nodefs;
	const configPath = resolve(options.cwd, options.configFile);
	const config = await readConfigFile(configPath, options.fs);
	const results = await Promise.all(
		config.bundles.map((bundle) => getBundleSize(bundle, { cwd: options.cwd, fs: options.fs })),
	);
	const color = options.outputFile ? false : process.stdout.isTTY;
	const output = formatBundle(results, options.format, { color });
	if (options.outputFile) {
		const outputFile = resolve(options.cwd, options.outputFile);
		await fs.writeFile(outputFile, output, "utf8");
	} else {
		/* eslint-disable-next-line no-console -- expected to log */
		console.log(output);
	}
}

export async function compare(options: CompareOptions): Promise<void> {
	const fs = options.fs ?? nodefs;
	const color = options.outputFile ? false : process.stdout.isTTY;
	const basePath = resolve(options.cwd, options.base);
	const currentPath = resolve(options.cwd, options.current);
	const base = (await readJsonFile(basePath, options.fs)) as BundleSize[];
	const current = (await readJsonFile(currentPath, options.fs)) as BundleSize[];
	const diff = compareBundles(base, current);
	const output = formatDiff(diff, options.format, { color });
	if (options.outputFile) {
		const outPath = resolve(options.cwd, options.outputFile);
		await fs.writeFile(outPath, output, "utf8");
	} else {
		/* eslint-disable-next-line no-console -- expected to log */
		console.log(output);
	}
}
