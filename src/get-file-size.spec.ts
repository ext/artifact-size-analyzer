import nodefs from "node:fs/promises";
import { Volume } from "memfs";
import { describe, expect, it } from "vitest";
import { getFileSize } from "./get-file-size.ts";

const cwd = "/";

describe("getFileSize", () => {
	it("returns size, gzip and brotli for an existing file", async () => {
		const content = "a".repeat(2000);
		const vol = Volume.fromJSON({ "/dist/foo.js": content });
		const fs = vol.promises as unknown as typeof nodefs;
		const res = await getFileSize("dist/foo.js", { cwd, fs });

		expect(res.size).toBeGreaterThan(0);
		expect(res.gzip).toBeGreaterThan(0);
		expect(res.brotli).toBeGreaterThan(0);
		expect(res.gzip).toBeLessThan(res.size);
		expect(res.brotli).toBeLessThan(res.size);
	});

	it("throws when file does not exist", async () => {
		const vol = Volume.fromJSON({});
		const fs = vol.promises as unknown as typeof nodefs;
		await expect(getFileSize("missing.js", { cwd, fs })).rejects.toThrowErrorMatchingInlineSnapshot(
			`[Error: ENOENT: no such file or directory, open '/missing.js']`,
		);
	});
});
