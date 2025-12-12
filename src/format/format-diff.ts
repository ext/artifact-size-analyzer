import { type BundleDiff } from "../bundle-diff.ts";
import { jsonFormat } from "./format-diff-json.ts";
import { markdownFormat } from "./format-diff-markdown.ts";
import { textFormat } from "./format-diff-text.ts";
import { type Format } from "./formats.ts";

/**
 * Options for `formatDiff()`.
 *
 * @public
 */
export interface FormatDiffOptions {
	/** Whether output should be colorized */
	color: boolean;
}

export function formatDiff(
	results: BundleDiff[],
	format: Format,
	options: FormatDiffOptions,
): string {
	switch (format) {
		case "json":
			return jsonFormat(results);
		case "markdown":
			return markdownFormat(results);
		case "text":
			return textFormat(results, options);
	}
}
