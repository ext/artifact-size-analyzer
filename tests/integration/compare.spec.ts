import type nodefs from "node:fs/promises";
import { Volume } from "memfs";
import { expect, it } from "vitest";
import { BundleDiff } from "../../src/bundle-diff";
import { BundleSize } from "../../src/bundle-size";
import { analyze, compare } from "../../src/cli";
import { type Config } from "../../src/config";

async function createVolume(json: Record<string, string> = {}): Promise<{ fs: typeof nodefs }> {
	const vol = Volume.fromJSON(json);
	const fs = vol.promises as unknown as typeof nodefs;
	await fs.mkdir("/project/dist", { recursive: true });
	await fs.mkdir("/project/temp", { recursive: true });
	return { fs };
}

async function readJsonFile<T = unknown>(fs: typeof nodefs, filePath: string): Promise<T> {
	const content = await fs.readFile(filePath, "utf-8");
	return JSON.parse(content) as T;
}

function makeConfig(): Config {
	return {
		bundles: [
			{
				name: "app",
				include: "dist/**/*.js",
			},
		],
	};
}

it("reports no differences for identical bundles", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify(makeConfig()),
	});

	/* baseline */
	await fs.writeFile("/project/dist/app.js", "a".repeat(100));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current (identical) */
	await fs.writeFile("/project/dist/app.js", "a".repeat(100));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert returned bundle counts are correct */
	expect(base).toHaveLength(1);
	expect(current).toHaveLength(1);
	expect(diff).toHaveLength(1);

	/* assert expected filenames are present in the results */
	expect(base[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(current[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].oldFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].newFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);

	/* assert sizes are unchanged between base and current */
	expect(diff[0].sizeDiff).toBe(0);
	expect(diff[0].oldSize).toBe(100);
	expect(diff[0].newSize).toBe(100);

	/* snapshot results for regression checks */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});

it("reports size increase when file grows", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify(makeConfig()),
	});

	/* baseline */
	await fs.writeFile("/project/dist/app.js", "x".repeat(100));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current (bigger) */
	await fs.writeFile("/project/dist/app.js", "x".repeat(160));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert returned bundle counts are correct */
	expect(base).toHaveLength(1);
	expect(current).toHaveLength(1);
	expect(diff).toHaveLength(1);

	/* assert expected filenames are present in the results */
	expect(base[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(current[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].oldFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].newFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);

	/* assert sizes reflect the expected growth in the current bundle */
	expect(diff[0].sizeDiff).toBe(60);
	expect(diff[0].oldSize).toBe(100);
	expect(diff[0].newSize).toBe(160);

	/* snapshot results for regression checks */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});

it("detects added file between baseline and current", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify(makeConfig()),
	});

	/* baseline (single file) */
	await fs.writeFile("/project/dist/app.js", "1".repeat(50));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current (added vendor.js) */
	await fs.writeFile("/project/dist/app.js", "1".repeat(50));
	await fs.writeFile("/project/dist/vendor.js", "v".repeat(30));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert returned bundle counts are correct */
	expect(base).toHaveLength(1);
	expect(current).toHaveLength(1);
	expect(diff).toHaveLength(1);

	/* assert expected filenames are present and vendor.js is detected as added */
	expect(base[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(current[0].files).toEqual([
		expect.objectContaining({ filename: "dist/app.js" }),
		expect.objectContaining({ filename: "dist/vendor.js" }),
	]);
	expect(diff[0].oldFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].newFiles).toEqual([
		expect.objectContaining({ filename: "dist/app.js" }),
		expect.objectContaining({ filename: "dist/vendor.js" }),
	]);

	/* assert sizes reflect the added file (increase by vendor size) */
	expect(diff[0].sizeDiff).toBe(30);
	expect(diff[0].oldSize).toBe(50);
	expect(diff[0].newSize).toBe(80);

	/* snapshot results for regression checks */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});

it("detects removed file between baseline and current", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify(makeConfig()),
	});

	/* baseline (app + vendor) */
	await fs.writeFile("/project/dist/app.js", "1".repeat(50));
	await fs.writeFile("/project/dist/vendor.js", "v".repeat(30));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current (vendor removed) */
	await fs.unlink("/project/dist/vendor.js");
	await fs.writeFile("/project/dist/app.js", "1".repeat(50));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert returned bundle counts are correct */
	expect(base).toHaveLength(1);
	expect(current).toHaveLength(1);
	expect(diff).toHaveLength(1);

	/* assert filenames: baseline had both, current has only app.js after removal */
	expect(base[0].files).toEqual([
		expect.objectContaining({ filename: "dist/app.js" }),
		expect.objectContaining({ filename: "dist/vendor.js" }),
	]);
	expect(current[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].oldFiles).toEqual([
		expect.objectContaining({ filename: "dist/app.js" }),
		expect.objectContaining({ filename: "dist/vendor.js" }),
	]);
	expect(diff[0].newFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);

	/* assert sizes reflect that vendor.js was removed (decrease by vendor size) */
	expect(diff[0].sizeDiff).toBe(-30);
	expect(diff[0].oldSize).toBe(80);
	expect(diff[0].newSize).toBe(50);

	/* snapshot results for regression checks */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});

it("compares multiple bundles", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify({
			bundles: [
				{ name: "app", include: "dist/app/**/*.js" },
				{ name: "lib", include: "dist/lib/**/*.js" },
			],
		}),
	});

	/* baseline */
	await fs.mkdir("/project/dist/app", { recursive: true });
	await fs.mkdir("/project/dist/lib", { recursive: true });
	await fs.writeFile("/project/dist/app/app.js", "a".repeat(100));
	await fs.writeFile("/project/dist/lib/lib.js", "l".repeat(200));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current (app +10 bytes, lib -20 bytes) */
	await fs.writeFile("/project/dist/app/app.js", "a".repeat(110));
	await fs.writeFile("/project/dist/lib/lib.js", "l".repeat(180));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert returned bundle counts are correct */
	expect(base).toHaveLength(2);
	expect(current).toHaveLength(2);
	expect(diff).toHaveLength(2);

	/* assert expected filenames for each bundle (nested directory layout) */
	expect(base[0].files).toEqual([expect.objectContaining({ filename: "dist/app/app.js" })]);
	expect(current[0].files).toEqual([expect.objectContaining({ filename: "dist/app/app.js" })]);
	expect(diff[0].oldFiles).toEqual([expect.objectContaining({ filename: "dist/app/app.js" })]);
	expect(diff[0].newFiles).toEqual([expect.objectContaining({ filename: "dist/app/app.js" })]);

	/* size diffs */
	function findDiff(arr: BundleDiff[], name: string): BundleDiff {
		const d = arr.find((x) => x.name === name);
		if (!d) throw new Error(`diff not found: ${name}`);
		return d;
	}

	const appDiff = findDiff(diff, "app");
	const libDiff = findDiff(diff, "lib");
	expect(appDiff.sizeDiff).toBe(10);
	expect(appDiff.oldSize).toBe(100);
	expect(appDiff.newSize).toBe(110);
	expect(libDiff.sizeDiff).toBe(-20);
	expect(libDiff.oldSize).toBe(200);
	expect(libDiff.newSize).toBe(180);

	/* snapshots */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});

it("respects exclude patterns in config", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify({
			bundles: [
				{
					name: "app",
					include: "dist/**/*.js",
					exclude: "dist/vendor.js",
				},
			],
		}),
	});

	/* baseline */
	await fs.writeFile("/project/dist/app.js", "1".repeat(50));
	await fs.writeFile("/project/dist/vendor.js", "v".repeat(30));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current */
	await fs.writeFile("/project/dist/app.js", "1".repeat(50));
	await fs.writeFile("/project/dist/vendor.js", "v".repeat(30));
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert vendor is excluded from results as configured */
	expect(base[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(current[0].files).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].oldFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);
	expect(diff[0].newFiles).toEqual([expect.objectContaining({ filename: "dist/app.js" })]);

	/* assert sizes are unchanged because vendor.js is excluded */
	expect(diff[0].sizeDiff).toBe(0);
	expect(diff[0].oldSize).toBe(50);
	expect(diff[0].newSize).toBe(50);

	/* snapshot results for regression checks */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});

it("handles empty bundles gracefully", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify({
			bundles: [
				{
					name: "empty",
					include: "dist/**/*.js",
				},
			],
		}),
	});

	/* baseline (no files) */
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/base.json",
		format: "json",
		fs,
	});

	/* current (no files) */
	await analyze({
		cwd: "/project",
		configFile: "bundle-config.json",
		outputFile: "temp/current.json",
		format: "json",
		fs,
	});

	/* compare */
	await compare({
		cwd: "/project",
		base: "temp/base.json",
		current: "temp/current.json",
		outputFile: "temp/diff.json",
		format: "json",
		fs,
	});

	const base = await readJsonFile<BundleSize[]>(fs, "/project/temp/base.json");
	const current = await readJsonFile<BundleSize[]>(fs, "/project/temp/current.json");
	const diff = await readJsonFile<BundleDiff[]>(fs, "/project/temp/diff.json");

	/* assert empty bundle handled */
	expect(base).toHaveLength(1);
	expect(current).toHaveLength(1);
	expect(diff).toHaveLength(1);

	/* filenames */
	expect(base[0].files).toEqual([]);
	expect(current[0].files).toEqual([]);

	/* sizes empty */
	expect(diff[0].sizeDiff).toBe(0);
	expect(diff[0].oldSize).toBe(0);
	expect(diff[0].newSize).toBe(0);

	/* snapshots */
	expect(base).toMatchSnapshot("base");
	expect(current).toMatchSnapshot("current");
	expect(diff).toMatchSnapshot("compare");
});
