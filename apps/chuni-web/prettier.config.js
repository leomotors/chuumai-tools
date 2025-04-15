// @ts-check

/**
 * @satisfies {import("prettier").Options}
 */
const config = {
  plugins: ["prettier-plugin-svelte"],
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
  ],
};

export default config;
