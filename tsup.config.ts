import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/app.ts"],
  format: ["cjs"],
  target: "node20",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      "import.meta.url": '"file:///dummy"',
    };
  },
});
