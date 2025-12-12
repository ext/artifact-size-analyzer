import { type BundleDiff } from "../bundle-diff.ts";

export function jsonFormat(results: BundleDiff[]): string {
	return JSON.stringify(results, null, 2);
}
