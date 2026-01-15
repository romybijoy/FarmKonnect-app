import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
  define: {
    global: "window", // or 'globalThis'
  },
  server: {
    host: true,
    allowedHosts: [
      "d973-2409-40f3-10cb-15d6-fc38-b840-e272-ce52.ngrok-free.app",
    ],
  },
});
