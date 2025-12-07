import nodefs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { brotliCompress as brotliCb, gzip as gzipCb } from "node:zlib";

const gzip = promisify(gzipCb);
const brotliCompress = promisify(brotliCb);

export interface GetFileSizeResult {
	size: number;
	gzip: number;
	brotli: number;
}

/**
 * @internal
 */
export interface GetFileSizeOptions {
	cwd: string;
	fs?: typeof nodefs | undefined;
}

/**
 * Get file sizes in bytes:
 *
 * - Raw size on disk,
 * - gzip compressed size,
 * - brotli compressed size.
 *
 * Note: this function assumes the file exists; it will throw if the path is missing.
 *
 * @internal
 * @param filePath - path to the file
 * @param options - optional options
 */
export async function getFileSize(
	filePath: string,
	options: GetFileSizeOptions,
): Promise<GetFileSizeResult> {
	const { cwd, fs = nodefs } = options;

	const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
	const [buf, st] = await Promise.all([fs.readFile(fullPath), fs.stat(fullPath)]);
	const [gzBuf, brBuf] = await Promise.all([gzip(buf), brotliCompress(buf)]);

	return {
		size: st.size,
		gzip: Buffer.isBuffer(gzBuf) ? gzBuf.length : 0,
		brotli: Buffer.isBuffer(brBuf) ? brBuf.length : 0,
	};
}
