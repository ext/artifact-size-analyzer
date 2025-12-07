import type nodefs from "node:fs/promises";
import { Volume } from "memfs";
import { expect, it } from "vitest";
import { analyze } from "../../src/cli.ts";

async function createVolume(json: Record<string, string> = {}): Promise<{ fs: typeof nodefs }> {
	const vol = Volume.fromJSON(json);
	const fs = vol.promises as unknown as typeof nodefs;
	await fs.mkdir("/project/dist", { recursive: true });
	await fs.mkdir("/project/temp", { recursive: true });
	return { fs };
}

it("should write to GitHub Actions output when --output-github is provided", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify({
			bundles: [{ name: "app", include: "dist/**/*.js" }],
		}),
	});
	await fs.writeFile("/project/dist/app.js", "a".repeat(50));
	await fs.writeFile("/gha_out.txt", "", "utf8");

	await analyze({
		cwd: "/project",
		env: {
			GITHUB_OUTPUT: "/gha_out.txt",
		},
		configFile: "bundle-config.json",
		format: "json",
		outputGithub: [{ format: "json", key: "foo" }],
		fs,
	});

	const content = await fs.readFile("/gha_out.txt", "utf8");
	expect(content).toMatch(/^foo<<EOF\n[\s\S]*\nEOF\n$/);
});

it("should write multiple GitHub outputs when multiple --output-github are provided", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify({
			bundles: [{ name: "app", include: "dist/**/*.js" }],
		}),
	});
	await fs.writeFile("/project/dist/app.js", "c".repeat(40));
	await fs.writeFile("/gha_out.txt", "", "utf8");

	await analyze({
		cwd: "/project",
		env: {
			GITHUB_OUTPUT: "/gha_out.txt",
		},
		configFile: "bundle-config.json",
		format: "json",
		outputGithub: [
			{ format: "json", key: "foo" },
			{ format: "markdown", key: "bar" },
		],
		fs,
	});

	const content = await fs.readFile("/gha_out.txt", "utf8");
	expect(content).toMatch(/^foo<<EOF[\s\S]*?\nEOF\n/);
	expect(content).toMatch(/bar<<EOF[\s\S]*?\nEOF\n$/);
});

it("should silently do nothing when --output-github is provided but GITHUB_OUTPUT is not set", async () => {
	const { fs } = await createVolume({
		"/project/bundle-config.json": JSON.stringify({
			bundles: [{ name: "app", include: "dist/**/*.js" }],
		}),
	});
	await fs.writeFile("/project/dist/app.js", "b".repeat(30));

	await expect(
		analyze({
			cwd: "/project",
			env: {},
			configFile: "bundle-config.json",
			format: "json",
			outputGithub: [{ format: "json", key: "foo" }],
			fs,
		}),
	).resolves.toBeUndefined();
});
