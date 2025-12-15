import { Console } from "node:console";
import type nodefs from "node:fs/promises";
import { Volume } from "memfs";
import { WritableStreamBuffer } from "stream-buffers";
import { expect } from "vitest";
import { type Config } from "../config/index.ts";

/**
 * @internal
 */
export async function createVolume(
	json: Record<string, string> = {},
): Promise<{ fs: typeof nodefs }> {
	const vol = Volume.fromJSON(json);
	const fs = vol.promises as unknown as typeof nodefs;
	await fs.mkdir("/project/dist", { recursive: true });
	await fs.mkdir("/project/temp", { recursive: true });
	return { fs };
}

/**
 * @internal
 */
export function createConsole(): { stream: WritableStreamBuffer; console: Console } {
	const stream = new WritableStreamBuffer();
	const bufConsole = new Console(stream, stream);
	return { stream, console: bufConsole };
}

/**
 * @internal
 */
export function makeConfig(): Config {
	return {
		artifacts: [
			{
				id: "app",
				name: "app",
				include: "dist/**/*.js",
			},
		],
	};
}

/**
 * @internal
 */
export function setupStringSerializer(): void {
	expect.addSnapshotSerializer({
		test(value) {
			return typeof value === "string";
		},
		serialize(value) {
			return value as string;
		},
	});
}
