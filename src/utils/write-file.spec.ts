import type nodefs from "node:fs/promises";
import { Volume } from "memfs";
import { expect, it } from "vitest";
import { writeFile } from "./write-file.ts";

it("should create missing parent directories before writing the file", async () => {
	expect.assertions(1);
	const vol = Volume.fromJSON({});
	const fs = vol.promises as unknown as typeof nodefs;

	await writeFile("hello world", { fs, cwd: "/project", filename: "temp/output.txt" });

	const content = await fs.readFile("/project/temp/output.txt", "utf8");
	expect(content).toBe("hello world");
});

it("should write the file when the parent directory already exists", async () => {
	expect.assertions(1);
	const vol = Volume.fromJSON({});
	const fs = vol.promises as unknown as typeof nodefs;
	await fs.mkdir("/project", { recursive: true });

	await writeFile("hello world", { fs, cwd: "/project", filename: "output.txt" });

	const content = await fs.readFile("/project/output.txt", "utf8");
	expect(content).toBe("hello world");
});

it("should create nested missing parent directories before writing the file", async () => {
	expect.assertions(1);
	const vol = Volume.fromJSON({});
	const fs = vol.promises as unknown as typeof nodefs;

	await writeFile("hello world", {
		fs,
		cwd: "/project",
		filename: "a/b/c/output.txt",
	});

	const content = await fs.readFile("/project/a/b/c/output.txt", "utf8");
	expect(content).toBe("hello world");
});
