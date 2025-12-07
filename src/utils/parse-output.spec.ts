import { describe, expect, it } from "vitest";
import { parseOutput } from "./parse-output.ts";

describe("parseOutput()", () => {
	it("should parse a valid format:key string", () => {
		expect(parseOutput("json:report")).toEqual({ format: "json", key: "report" });
		expect(parseOutput("markdown:summary")).toEqual({ format: "markdown", key: "summary" });
		expect(parseOutput("text:out")).toEqual({ format: "text", key: "out" });
	});

	it("should throw for non-string values", () => {
		expect(() => parseOutput(null)).toThrow(
			"--output-github must be a string in the form 'format:key'",
		);
		expect(() => parseOutput({})).toThrow(
			"--output-github must be a string in the form 'format:key'",
		);
	});

	it("should throw when missing the ':' separator", () => {
		expect(() => parseOutput("json")).toThrow("--output-github must be in the form 'format:key'");
	});

	it("should throw for unsupported formats", () => {
		expect(() => parseOutput("xml:foo")).toThrow(/Invalid format for --output-github: xml/);
	});

	it("should throw when the key is empty", () => {
		expect(() => parseOutput("json:")).toThrow("--output-github key must not be empty");
	});
});
