// Load the same .env.local/.env precedence that Next.js uses at runtime.
const { loadEnvConfig } = require("@next/env");
const { spawnSync } = require("node:child_process");
loadEnvConfig(process.cwd());
const result = spawnSync("prisma", ["migrate", "deploy"], { stdio: "inherit", env: process.env });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
