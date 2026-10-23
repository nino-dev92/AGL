import { writeFile } from "node:fs/promises";

await writeFile(
  new URL("../dist/package.json", import.meta.url),
  JSON.stringify({ type: "commonjs" }, null, 2),
);
