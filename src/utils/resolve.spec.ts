import { describe, expect, it } from "vitest";
import { resolve } from "./resolve.ts";

describe.runIf(process.platform !== "win32")("resolve (posix)", () => {
	it("should return absolute paths unchanged", () => {
		expect.assertions(1);
		const absolutePath = "/absolute/path/file.txt";
		const result = resolve("/some/cwd", absolutePath);
		expect(result).toBe("/absolute/path/file.txt");
	});

	it("should join relative paths with cwd", () => {
		expect.assertions(1);
		const cwd = "/project/root";
		const relativePath = "src/file.ts";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("/project/root/src/file.ts");
	});

	it("should handle current directory reference", () => {
		expect.assertions(1);
		const cwd = "/project/root";
		const relativePath = "./src/file.ts";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("/project/root/src/file.ts");
	});

	it("should handle parent directory references", () => {
		expect.assertions(1);
		const cwd = "/project/root";
		const relativePath = "../other/file.ts";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("/project/other/file.ts");
	});

	it("should handle empty string as relative path", () => {
		expect.assertions(1);
		const cwd = "/project/root";
		const relativePath = "";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("/project/root");
	});
});

describe.runIf(process.platform === "win32")("resolve (windows)", () => {
	it("should return absolute paths unchanged", () => {
		expect.assertions(1);
		const absolutePath = "C:\\absolute\\path\\file.txt";
		const result = resolve("D:\\some\\cwd", absolutePath);
		expect(result).toBe("C:\\absolute\\path\\file.txt");
	});

	it("should join relative paths with cwd", () => {
		expect.assertions(1);
		const cwd = "C:\\project\\root";
		const relativePath = "src\\file.ts";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("C:\\project\\root\\src\\file.ts");
	});

	it("should handle current directory reference", () => {
		expect.assertions(1);
		const cwd = "C:\\project\\root";
		const relativePath = ".\\src\\file.ts";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("C:\\project\\root\\src\\file.ts");
	});

	it("should handle parent directory references", () => {
		expect.assertions(1);
		const cwd = "C:\\project\\root";
		const relativePath = "..\\other\\file.ts";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("C:\\project\\other\\file.ts");
	});

	it("should handle empty string as relative path", () => {
		expect.assertions(1);
		const cwd = "C:\\project\\root";
		const relativePath = "";
		const result = resolve(cwd, relativePath);
		expect(result).toBe("C:\\project\\root");
	});
});
