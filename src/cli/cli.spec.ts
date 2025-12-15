import { expect, it } from "vitest";
import { createParser } from "./cli.ts";
import { createConsole, createVolume, setupStringSerializer } from "./test-helpers.ts";

setupStringSerializer();

it("should display help message", async () => {
	const { console } = createConsole();
	const { fs } = await createVolume();

	const parser = createParser({
		cwd: "/project",
		env: {},
		console,
		fs,
	});

	return new Promise<void>((resolve) => {
		expect.assertions(2);
		parser.parseAsync("--help", (err: unknown, _argv: unknown, output: unknown) => {
			expect(err).toBeUndefined();
			expect(output).toMatchSnapshot();
			resolve();
		});
	});
});

it("should display analyze command help", async () => {
	const { console } = createConsole();
	const { fs } = await createVolume();

	const parser = createParser({
		cwd: "/project",
		env: {},
		console,
		fs,
	});

	return new Promise<void>((resolve) => {
		expect.assertions(2);
		parser.parseAsync("analyze --help", (err: unknown, _argv: unknown, output: unknown) => {
			expect(err).toBeUndefined();
			expect(output).toMatchSnapshot();
			resolve();
		});
	});
});

it("should display compare command help", async () => {
	const { console } = createConsole();
	const { fs } = await createVolume();

	const parser = createParser({
		cwd: "/project",
		env: {},
		console,
		fs,
	});

	return new Promise<void>((resolve) => {
		expect.assertions(2);
		parser.parseAsync("compare --help", (err: unknown, _argv: unknown, output: unknown) => {
			expect(err).toBeUndefined();
			expect(output).toMatchSnapshot();
			resolve();
		});
	});
});
