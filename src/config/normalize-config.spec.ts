import { describe, expect, it } from "vitest";
import { Config } from "./index.ts";
import { normalizeConfig } from "./normalize-config.ts";

describe("normalizeConfig()", () => {
	it("should handle empty config", () => {
		expect.assertions(1);
		const config: Config = {};
		expect(normalizeConfig(config)).toEqual({ artifacts: [] });
	});

	it("should handle empty artifact", () => {
		expect.assertions(1);
		const config: Config = {
			artifacts: [{ id: "empty", name: "empty" }],
		};
		expect(normalizeConfig(config)).toEqual({
			artifacts: [
				{ id: "empty", name: "empty", include: [], exclude: [], compression: ["gzip", "brotli"] },
			],
		});
	});

	it("should normalize include/exclude strings to array", () => {
		expect.assertions(1);
		const config: Config = {
			artifacts: [{ id: "test", name: "test", include: "dist/*.js", exclude: "dist/foo.js" }],
		};
		expect(normalizeConfig(config)).toEqual({
			artifacts: [
				{
					id: "test",
					name: "test",
					include: ["dist/*.js"],
					exclude: ["dist/foo.js"],
					compression: ["gzip", "brotli"],
				},
			],
		});
	});

	it("should preserve include/exclude arrays", () => {
		expect.assertions(1);
		const config: Config = {
			artifacts: [
				{
					id: "test",
					name: "test",
					include: ["dist/*.js"],
					exclude: ["dist/foo.js", "dist/bar.js"],
				},
			],
		};
		expect(normalizeConfig(config)).toEqual({
			artifacts: [
				{
					id: "test",
					name: "test",
					include: ["dist/*.js"],
					exclude: ["dist/foo.js", "dist/bar.js"],
					compression: ["gzip", "brotli"],
				},
			],
		});
	});

	it("should preserve compression array", () => {
		expect.assertions(1);
		const config: Config = {
			artifacts: [{ id: "c2", name: "c2", include: [], exclude: [], compression: ["brotli"] }],
		};
		expect(normalizeConfig(config).artifacts[0].compression).toEqual(["brotli"]);
	});

	it("should normalize single compression string to array", () => {
		expect.assertions(1);
		const config: Config = {
			artifacts: [{ id: "c3", name: "c3", include: [], exclude: [], compression: "gzip" }],
		};
		expect(normalizeConfig(config).artifacts[0].compression).toEqual(["gzip"]);
	});

	it("should treat false compression as empty array", () => {
		expect.assertions(1);
		const config: Config = {
			artifacts: [{ id: "c4", name: "c4", include: [], exclude: [], compression: false }],
		};
		expect(normalizeConfig(config).artifacts[0].compression).toEqual([]);
	});
});
