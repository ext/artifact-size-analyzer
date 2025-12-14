import path from "node:path";

/**
 * @internal
 */
export function resolve(cwd: string, p: string): string {
	return path.isAbsolute(p) ? p : path.join(cwd, p);
}
