import nodefs from "node:fs/promises";
import { type Config, type NormalizedConfig, normalizeConfig } from "./config/index.ts";
import { readJsonFile } from "./read-json-file.ts";

/**
 * @public
 * @param filePath - Path to config file
 * @param fs - Optional fs promises-like API to use (for testing)
 * @returns Parsed and normalized config
 */
export async function readConfigFile(
	filePath: string,
	fs: typeof nodefs = nodefs,
): Promise<NormalizedConfig> {
	const config = await readJsonFile(filePath, fs);
	return normalizeConfig(config as Config);
}
