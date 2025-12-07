import { type Format, formats } from "../format/index.ts";

export interface ParsedOutput {
	format: Format;
	key: string;
}

export function parseOutput(value: unknown): ParsedOutput {
	if (typeof value !== "string") {
		throw new Error("--output-github must be a string in the form 'format:key'");
	}

	const parts = value.split(":", 2);
	if (parts.length !== 2) {
		throw new Error("--output-github must be in the form 'format:key'");
	}

	const [fmt, key] = parts;
	if (!(formats as readonly string[]).includes(fmt)) {
		throw new Error(
			`Invalid format for --output-github: ${fmt}. Supported formats: ${formats.join(",")}`,
		);
	}

	if (!key) {
		throw new Error("--output-github key must not be empty");
	}

	return { format: fmt as Format, key };
}
