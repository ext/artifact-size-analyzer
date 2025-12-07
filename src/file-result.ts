/**
 * Per-file size result.
 *
 * @public
 */
export interface FileResult {
	/** Filename (relative to working directory) */
	filename: string;
	/** Size in bytes */
	size: number;
	/** Gzip size in bytes */
	gzip: number;
	/** Brotli size in bytes */
	brotli: number;
}
