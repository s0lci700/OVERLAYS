import { defineConfig, loadEnv } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
// Custom logger to suppress harmless warnings about unresolved public assets
const customLogger = {
  info(msg, options) {
    console.log(`[vite] ${msg}`);
  },
  warn(msg, options) {
    // Suppress build warnings for SVG files in public folder (they resolve at runtime)
    if (
      typeof msg === "string" &&
      msg.includes("didn't resolve at build time")
    ) {
      return;
    }
    console.warn(`[vite] ${msg}`);
  },
  warnOnce(msg, options) {
    // Suppress build warnings for SVG files in public folder
    if (
      typeof msg === "string" &&
      msg.includes("didn't resolve at build time")
    ) {
      return;
    }
    console.warn(`[vite] ${msg}`);
  },
  error(msg, options) {
    console.error(`[vite] ${msg}`);
  },
  clearScreen(type) {
    // Optional: implement if needed
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  return {
    plugins: [sveltekit()],
    customLogger,
    server: {
      port: parseInt(env.VITE_PORT || "5173", 10),
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
    },
  };
});
