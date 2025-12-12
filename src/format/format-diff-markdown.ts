import { type BundleDiff } from "../bundle-diff.ts";
import { prettySize } from "../pretty-size.ts";
import { formatPercent } from "./format-percent.ts";
import { formatSize } from "./format-size.ts";

function num(value: number): string {
	return prettySize(value);
}

function sign(value: number): string {
	return value >= 0 ? "+" : "-";
}

function diff(value: number): string {
	return `${sign(value)}${prettySize(Math.abs(value))}`;
}

function renderAddedRow(it: BundleDiff): string {
	const name = it.name.replace(/ /g, "&nbsp;");
	const sizeCol = `N/A → **${num(it.raw.newSize)}**`;
	const compressedCol = `${formatSize("gzip", it.gzip, { style: "markdown" })}<br>${formatSize(
		"brotli",
		it.brotli,
		{ style: "markdown" },
	)}`;
	const percent = "+0.00%";

	return `| ${name} (added) | ${String(it.newFiles.length)} file(s) | ${sizeCol} | ${compressedCol} | ${percent} |`;
}

function renderRemovedRow(it: BundleDiff): string {
	const name = it.name.replace(/ /g, "&nbsp;");
	const sizeCol = `${num(it.raw.oldSize)} → N/A`;
	return `| ${name} (removed) | N/A | ${sizeCol} | N/A | N/A |`;
}

function renderUpdatedRow(it: BundleDiff): string {
	const name = it.name.replace(/ /g, "&nbsp;");
	const sizeCol = `${num(it.raw.oldSize)} → **${num(it.raw.newSize)}** (${diff(
		it.raw.difference,
	)})`;
	const compressedCol = `${formatSize("gzip", it.gzip, { style: "markdown" })}<br>${formatSize(
		"brotli",
		it.brotli,
		{ style: "markdown" },
	)}`;
	const percent = formatPercent(it.raw);

	return `| ${name} | ${String(it.newFiles.length)} file(s) | ${sizeCol} | ${compressedCol} | ${percent} |`;
}

export function markdownFormat(results: BundleDiff[]): string {
	const header = "## Bundle sizes\n\n";
	const tableHeader = "| Bundle | Files | Size | Compressed | Change |\n|---|---|---:|---:|---:|\n";

	const rows = results
		.map((it) => {
			switch (it.status) {
				case "added":
					return renderAddedRow(it);
				case "removed":
					return renderRemovedRow(it);
				case "updated":
					return renderUpdatedRow(it);
				default: {
					const _exhaustive: never = it.status;
					return _exhaustive;
				}
			}
		})
		.join("\n");

	return `${header}${tableHeader}${rows}\n`;
}
