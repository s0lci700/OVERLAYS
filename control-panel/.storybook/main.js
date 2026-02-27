// This file has been automatically migrated to valid ESM format by Storybook.
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

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
  // Serve the repo-level `assets` folder at /assets so stories can load
  // images like `/assets/img/barbarian.png` used across the control panel.
  staticDirs: [
    { from: path.resolve(__dirname, "..", "..", "assets"), to: "/assets" },
    {
      from: path.resolve(__dirname, "../static"),
      to: "/assets/",
    },
  ],

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
