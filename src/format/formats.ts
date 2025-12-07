export const formats = ["json", "markdown", "text"] as const;
export type Format = (typeof formats)[number];
