/**
 * @public
 */
export interface NormalizedBundleConfig {
	name: string;
	include: string[];
	exclude: string[];
}

/**
 * @public
 */
export interface NormalizedConfig {
	bundles: NormalizedBundleConfig[];
}
