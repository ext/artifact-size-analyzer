/**
 * Get input from GitHub Actions
 */
export function getInput(name: string): string {
	/* eslint-disable-next-line unicorn/no-unsafe-property-key -- technical debt */
	return process.env[`INPUT_${name.toUpperCase().replaceAll("-", "_")}`] ?? "";
}
