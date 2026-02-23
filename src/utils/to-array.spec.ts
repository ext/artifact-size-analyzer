import { describe, expect, it } from "vitest";
import { toArray } from "./to-array.ts";

describe("toArray", () => {
	it("should return array unchanged", () => {
		expect.assertions(1);
		const input = ["a", "b", "c"];
		const result = toArray(input);
		expect(result).toBe(input);
	});

	it("should wrap single value in array", () => {
		expect.assertions(1);
		const input = "single";
		const result = toArray(input);
		expect(result).toEqual([input]);
	});

	it("should transform array elements with transform function", () => {
		expect.assertions(1);
		const input = [1, 2, 3];
		const transform = (x: number): number => x * 2;
		const result = toArray(input, transform);
		expect(result).toEqual([2, 4, 6]);
	});

	it("should transform single value with transform function", () => {
		expect.assertions(1);
		const input = 5;
		const transform = (x: number): number => x * 2;
		const result = toArray(input, transform);
		expect(result).toEqual([10]);
	});

	it("should handle string to number transformation", () => {
		expect.assertions(1);
		const input = ["1", "2", "3"];
		const transform = (x: string): number => Number.parseInt(x, 10);
		const result = toArray(input, transform);
		expect(result).toEqual([1, 2, 3]);
	});

	it("should handle transformation of single string", () => {
		expect.assertions(1);
		const input = "42";
		const transform = (x: string): number => Number.parseInt(x, 10);
		const result = toArray(input, transform);
		expect(result).toEqual([42]);
	});

	it("should handle complex object transformation", () => {
		expect.assertions(1);
		const input = [{ name: "Alice" }, { name: "Bob" }];
		const transform = (obj: { name: string }): string => obj.name.toUpperCase();
		const result = toArray(input, transform);
		expect(result).toEqual(["ALICE", "BOB"]);
	});

	it("should handle empty array", () => {
		expect.assertions(1);
		const input: string[] = [];
		const result = toArray(input);
		expect(result).toBe(input);
	});

	it("should handle transformation of empty array", () => {
		expect.assertions(1);
		const input: number[] = [];
		const transform = (x: number): number => x * 2;
		const result = toArray(input, transform);
		expect(result).toEqual([]);
	});
});
