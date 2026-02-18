import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

import fs from "fs";
import path from "path";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
);
const homepage = packageJson.homepage || "/";

// https://vite.dev/config/
export default defineConfig({
  base: homepage,
  plugins: [react(), basicSsl()],
  server: {
    host: true, // Разрешить доступ с внешних устройств по IP
    port: 5175,
  },
});
