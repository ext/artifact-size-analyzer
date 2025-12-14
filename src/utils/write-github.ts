import type nodefs from "node:fs/promises";

/**
 * @internal
 */
export interface WriteGithubOptions {
	env: NodeJS.ProcessEnv;
	key: string;
	fs: typeof nodefs;
}

/**
 * @internal
 */
export async function writeGithub(content: string, options: WriteGithubOptions): Promise<void> {
	const { fs, env, key } = options;

	const dst = env["GITHUB_OUTPUT"];
	if (!dst) {
		return;
	}

	const value = content.replace(/\r/g, "");
	const payload = `${key}<<EOF\n${value}\nEOF\n`;
	await fs.appendFile(dst, payload, "utf8");
}
