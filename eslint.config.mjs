/* This file is managed by @html-validate/eslint-config */
/* Changes may be overwritten */

import defaultConfig from "@html-validate/eslint-config";
import typescriptConfig from "@html-validate/eslint-config-typescript";
import typeinfoConfig from "@html-validate/eslint-config-typescript-typeinfo";
import vitestConfig from "@html-validate/eslint-config-vitest";

export default [
	...defaultConfig({
		type: "module",
	}),

	typescriptConfig(),
	typeinfoConfig(import.meta.dirname, {
		files: ["src/**/*.{ts,cts,mts}", "analyze/**/*.{ts,cts,mts}", "compare/**/*.{ts,cts,mts}"],
	}),
	vitestConfig(),

	{
		name: "local/ts",
		files: ["**/*.ts"],
		rules: {
			"import-x/extensions": "off",
		},
	},

	{
		name: "local/examples",
		files: ["examples/**/*.ts"],
		rules: {
			"no-console": "off",
			"import-x/no-unresolved": "off",
		},
	},

	{
		name: "local/actions",
		files: ["{analyze,compare}/**/*.ts"],
		rules: {
			"no-console": "off",
		},
	},
];
