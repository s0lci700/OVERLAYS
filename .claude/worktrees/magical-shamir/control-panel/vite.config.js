import { defineConfig, loadEnv } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
// Custom logger to suppress harmless warnings about unresolved public assets
function createLogger() {
  let _hasError = false;

  return {
    info(msg, options) {
      console.log(`[vite] ${msg}`);
    },
    warn(msg, options) {
      if (
        typeof msg === "string" &&
        msg.includes("didn't resolve at build time")
      ) {
        return;
      }
      console.warn(`[vite] ${msg}`);
    },
    warnOnce(msg, options) {
      if (
        typeof msg === "string" &&
        msg.includes("didn't resolve at build time")
      ) {
        return;
      }
      console.warn(`[vite] ${msg}`);
    },
    error(msg, options) {
      _hasError = true;
      console.error(`[vite] ${msg}`);
    },
    clearScreen(type) {
      // no-op or implement as needed
    },
    // SvelteKit expects a `hasErrorLogged()` function on the logger
    hasErrorLogged() {
      return _hasError;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  return {
    plugins: [tailwindcss(), sveltekit()],
    logger: createLogger(),
    server: {
      port: parseInt(env.VITE_PORT || "5173", 10),
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
    },
    // Vitest configuration required by Storybook's addon-vitest (manual setup)
    test: {
      globals: true,
      environment: "jsdom",
      // Use the existing vitest.setup.js located in .storybook (storybook generator created it)
      setupFiles: [path.resolve(__dirname, ".storybook/vitest.setup.js")],
      include: ["src/**/*.test.{js,ts}", "src/**/*.spec.{js,ts}"],
    },
  };
});
