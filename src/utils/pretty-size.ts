/**
 * Format a byte size into a human readable string.
 *
 * @internal
 */
export function prettySize(size: number): string {
	const kb = 1024;
	const mb = kb * 1024;

	if (size < kb) {
		return `${String(size)}B`;
	}

	if (size < mb) {
		return `${(size / kb).toFixed(1)}KiB`;
	}

	return `${(size / mb).toFixed(1)}MiB`;
}
