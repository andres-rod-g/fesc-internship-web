import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  integrations: [react(), tailwind()],

  adapter: node({
    mode: "standalone",
  }),
  server: {
    host: true,
    port: 4321
  }
});