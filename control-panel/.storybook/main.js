import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type { import('@storybook/sveltekit').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/sveltekit",

  /**
   * Alias $lib/socket to a static mock so Storybook never tries to
   * open a real Socket.io connection when rendering components.
   */
  viteFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "$lib/socket": path.resolve(__dirname, "../src/__mocks__/socket.js"),
    };
    return config;
  },
};
export default config;
